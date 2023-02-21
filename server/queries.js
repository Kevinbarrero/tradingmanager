const { response } = require("express");
const Binance = require("node-binance-api");
const { getAllCandles } = require("./customBinance.js");
const {
  coinToDb,
  tableGenerator,
  pool,
  isDateInDb,
  deleteOldRecords,
  findRowsGreaterThanTimestamp,
  getLastRow,
} = require("./dbQueries");
const { PUBLIC_KEY, PRIVATE_KEY } = require("./keys.js");

const binance = new Binance().options({
  APIKEY: PUBLIC_KEY,
  APISECRET: PRIVATE_KEY,
  recvWindow: 60000,
  verbose: true,
});

const getCoin = (request, response) => {
  console.log(request.params.coin.toUpperCase());
  query = `SELECT * FROM ` + '"' + request.params.coin.toUpperCase() + '"';
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

//query to get klines from binance
const getKlines = async (request, response) => {
  const coin = request.params.coin;
  const interval = request.params.interval;
  const startTime = request.params.startTime;
  let klines = null;
  let last = null;
  console.log(request.params);
  if (await isDateInDb(coin, startTime)) {
    last = await getLastRow(coin);
    console.log(last.rows[0].open_time);
  }
  klinesBinance = await getAllCandles(
    coin,
    interval,
    Math.floor(new Date(last.rows[0].open_time).getTime())
  );
  for (const [key, value] of Object.entries(klinesBinance)) {
    /*
    klines.open_time = new Date(value[0])
    klines.open = value[1];
    klines.high = value[2];
    klines.low = value[3];
    klines.close = value[4];
    klines.volume = value[5];
    klines.close_time = new Date(value[6])
    klines.n_trades = value[8];
    console.log(klines.length)
    */
    await coinToDb(
      coin.toLowerCase(),
      value[0] / 1000,
      value[1],
      value[2],
      value[3],
      value[4],
      value[5],
      value[6] / 1000,
      value[8]
    );
  }
  response.status(201).send(await findRowsGreaterThanTimestamp(coin, startTime));
  deleteOldRecords();
};

const createTables = async (request, response) => {
  let coindata = await binance.futuresPrices();
  for (const [key] of Object.entries(coindata)) {
    tableGenerator(key.toLowerCase());
  }
  response.status(201).send("Tables Created Correctly");
};

module.exports = {
  getCoin,
  createTables,
  getKlines,
};
