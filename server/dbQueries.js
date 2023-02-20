const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "tradingmanager",
    password: "postgres",
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
      "to_timestamp(" + open_time + ")" + ", " 
      + open + ", " 
      + high + ", " 
      + low + ", " 
      + close + ", " 
      + volume + ", " 
      + "to_timestamp(" + close_time +")" + ", " 
      + n_trades + `) ON CONFLICT (open_time) DO NOTHING;
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

  function isDateInDb(coin, startTime){
    let isindb = null
    const query = `SELECT EXISTS (SELECT 1 FROM ` + coin + ` WHERE open_time = to_timestamp(` + startTime/1000 + `)) AS time;`
    pool.query(query).then(res => {
        console.log(res.rows[0].time)
        if (res.rows[0].time == true){
            isindb = true
        }else{
            isindb = false
        }
    })
    return isindb
  }

  module.exports = {
    coinToDb,
    tableGenerator,
    isDateInDb,
    pool
  };