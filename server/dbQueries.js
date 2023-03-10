const Pool = require("pg").Pool;
const POSTGRES_USER = process.env.POSTGRES_USER
const DATABASE_NAME = process.env.DATABASE_NAME
const DATABASE_PASSWD = process.env.DATABASE_PASSWD

const pool = new Pool({
  user: POSTGRES_USER,
  host: "localhost",
  database: DATABASE_NAME,
  password: DATABASE_PASSWD,
  port: 5432,
});

async function coinToDb(
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
  await pool.query(query);
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

function getLastRow(coin){
  const query = `SELECT * FROM ${coin} ORDER BY open_time desc LIMIT 1`
  return pool.query(query);
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
    })`,
  };

  const result = await pool.query(query);
  return result.rows.sort((a,b) => a.open_time - b.open_time);
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
