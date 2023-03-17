const { response } = require("express");
const Binance = require("node-binance-api");
const { getAllCandles, klines1m } = require("./customBinance.js");
const {
  tableGenerator,
  pool,
  findRowsGreaterThanTimestamp,
} = require("./dbQueries");

const { PUBLIC_KEY } = process.env.PUBLIC_KEY;
const { PRIVATE_KEY } = process.env.PRIVATE_KEY;

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

const getKlines = async (request, response) => {
  const coin = request.params.coin;
  const interval = request.params.interval;
  const startTime = request.params.startTime;
  console.log(request.params);

  if (interval === "1m") {
    klines1m(coin, startTime);
    response
      .status(201)
      .send(await findRowsGreaterThanTimestamp(coin, startTime));
  } else {
    klines = await getAllCandles(coin, interval, startTime);
    response.status(201).send(klines);
  }
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
