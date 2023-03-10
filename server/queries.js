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

const { PUBLIC_KEY } = process.env.PUBLIC_KEY
const { PRIVATE_KEY } = process.env.PRIVATE_KEY

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
  let last = null;
  let klines = null;
  console.log(request.params);

  if ((await isDateInDb(coin, startTime)) === true) {
    last = await getLastRow(coin);
    console.log("Data in db");
    klines = await getAllCandles(
      coin,
      interval,
      Math.floor(new Date(last.rows[0].open_time).getTime())
    );
  } else {
    console.log("Data Not in DB");
    klines = await getAllCandles(coin, interval, startTime);
  }

  for (const [key, value] of Object.entries(klines)) {
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
  response
    .status(201)
    .send(await findRowsGreaterThanTimestamp(coin, startTime));
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
