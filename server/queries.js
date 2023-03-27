const { response } = require("express");
const Binance = require("node-binance-api");
const { getAllCandles, klines1m } = require("./customBinance.js");
const {tableGenerator} = require("./dbQueries");

const { PUBLIC_KEY } = process.env.PUBLIC_KEY;
const { PRIVATE_KEY } = process.env.PRIVATE_KEY;

const binance = new Binance().options({
  APIKEY: PUBLIC_KEY,
  APISECRET: PRIVATE_KEY,
  recvWindow: 60000,
  verbose: true,
});

const getKlines = async (request, response) => {
  try {
    const coin = request.params.coin;
    const interval = request.params.interval;
    const startTime = request.params.startTime;
    console.log(request.params);
  
    if (interval === "1m") {
      res = await getAllCandles(coin, interval, startTime)
      klines1m(coin, startTime);
      response
        .status(201)
        .send(res);
    } else {
      klines = await getAllCandles(coin, interval, startTime);
      response.status(201).send(klines);
    }
  } catch (error) {
    response.status(500).send("Internal server error: coin, interval or datatime not correct");
  }
 
};

const createTables = async (request, response) => {
  let coindata = await binance.futuresPrices();
  for (const [key] of Object.entries(coindata)) {
    tableGenerator(key.toLowerCase());
  }
  response.status(201).send("Tables Created Correctly");
};

const getCoins = async(request, response) => {
  let coindata = await binance.futuresPrices();
  response.status(201).send(Object.keys(coindata))
}

module.exports = {
  createTables,
  getKlines,
  getCoins
};
