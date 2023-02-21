const Pool = require("pg").Pool;
const { POSTGRES_USER, DATABASE_NAME, DATABASE_PASSWD } = require("./keys.js");

const pool = new Pool({
  user: POSTGRES_USER,
  host: "localhost",
  database: DATABASE_NAME,
  password: DATABASE_PASSWD,
  port: 5432,
});

function coinToDb(
  coin,
  open_time,
  open,
  high,
  low,
  close,
  volume,
  close_time,
  n_trades
) {
  const query =
    `INSERT INTO ` +
    '"' +
    coin +
    '"' +
    ` VALUES (` +
    "to_timestamp(" +
    open_time +
    ")" +
    ", " +
    open +
    ", " +
    high +
    ", " +
    low +
    ", " +
    close +
    ", " +
    volume +
    ", " +
    "to_timestamp(" +
    close_time +
    ")" +
    ", " +
    n_trades +
    `) ON CONFLICT (open_time) DO NOTHING;
    `;
  pool.query(query);
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

async function isDateInDb(coin, startTime) {
  const query = {
    text: `SELECT EXISTS(SELECT 1 FROM ${coin} WHERE open_time = to_timestamp(${
      startTime / 1000
    }));`,
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
    text: `SELECT * FROM ${coin} WHERE open_time > to_timestamp(${
      startTime / 1000
    }) AT TIME ZONE 'Europe/Moscow'`,
  };

  const result = await pool.query(query);

  return result.rows;
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
  pool,
};
