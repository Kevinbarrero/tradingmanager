const Pool = require("pg").Pool;
const POSTGRES_USER = process.env.POSTGRES_USER;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PASSWD = process.env.DATABASE_PASSWD;
const copyFrom = require("pg-copy-streams").from;

const pool = new Pool({
  user: POSTGRES_USER,
  host: "localhost",
  database: DATABASE_NAME,
  password: DATABASE_PASSWD,
  port: 5432,
});

async function coinToDb(coin, candles) {
  const tableName = coin.toLowerCase();
  const tempTableName = `${tableName}_temp`;
  const columns = [
    "open_time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "close_time",
    "n_trades",
  ];

  // Create a new connection from the pool
  const client = await pool.connect();

  try {
    // Start a transaction
    await client.query("BEGIN");

    // Create a temporary table for the new data
    await client.query(
      `CREATE TEMP TABLE ${tempTableName} (LIKE ${tableName} INCLUDING ALL) ON COMMIT DROP`
    );

    // Use COPY FROM to insert the new data into the temporary table
    const stream = client.query(
      copyFrom(
        `COPY ${tempTableName} (${columns.join(
          ", "
        )}) FROM STDIN DELIMITER ',' CSV HEADER`
      )
    );
    stream.on("error", (error) => {
      throw error;
    });
    candles.forEach((candle) => {
      stream.write(
        `${candle.open_time},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume},${candle.close_time},${candle.n_trades}\n`
      );
    });
    stream.end();

    // Merge the new data with the main table
    await client.query(`
      INSERT INTO ${tableName} (${columns.join(", ")})
      SELECT ${columns.join(", ")} FROM ${tempTableName}
      ON CONFLICT (open_time) DO UPDATE
      SET (open, high, low, close, volume, close_time, n_trades) =
      (EXCLUDED.open, EXCLUDED.high, EXCLUDED.low, EXCLUDED.close, EXCLUDED.volume, EXCLUDED.close_time, EXCLUDED.n_trades)
    `);

    // Commit the transaction
    await client.query("COMMIT");
  } catch (error) {
    // If there is an error, rollback the transaction
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

function tableGenerator(key) {
  const query =
    `CREATE TABLE IF NOT EXISTS ` +
    '"' +
    key +
    '"' +
    ` (
      open_time TIMESTAMP UNIQUE, 
      open FLOAT, 
      high FLOAT, 
      low FLOAT, 
      close FLOAT, 
      volume FLOAT, 
      close_time TIMESTAMP UNIQUE, 
      n_trades INT
      )`;
  pool.query(query);
}

function getLastRow(coin) {
  const query = `SELECT * FROM ${coin} ORDER BY open_time desc LIMIT 1`;
  return pool.query(query);
}

async function isDateInDb(coin, startTime) {
  const query = {
    text: `SELECT EXISTS(SELECT 1 FROM ${coin} WHERE open_time = to_timestamp($1) + interval '3 hours');`,
    values: [startTime / 1000],
  };

  try {
    const result = await pool.query(query);
    return result.rows[0].exists;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function findRowsGreaterThanTimestamp(coin, startTime) {
  const query = {
    text: `SELECT * FROM ${coin} WHERE open_time >= to_timestamp($1) + interval '3 hours'`,
    values: [startTime / 1000],
  };

  const result = await pool.query(query);
  // return result.rows.sort((a, b) => a.open_time - b.open_time);
  // console.log(
  // "db response: ",
  // result.rows.sort((a, b) => a.open_time - b.open_time).at(-1)
  // );
  return result.rows.sort((a, b) => a.open_time - b.open_time);
}

function deleteOldRecords() {
  const query = `SELECT delete_old_records();`;
  pool.query(query);
}
module.exports = {
  coinToDb,
  tableGenerator,
  isDateInDb,
  deleteOldRecords,
  findRowsGreaterThanTimestamp,
  getLastRow,
  pool,
};
