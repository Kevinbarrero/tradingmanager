const { response } = require("express");
const Binance = require("node-binance-api");
const { getAllCandles, klines1m } = require("./customBinance.js");
const { tableGenerator } = require("./dbQueries");

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
    console.time("getklines");
    if (interval === "1m") {
      // res = await getAllCandles(coin, interval, startTime)

      let data = await klines1m(coin, startTime);
      data.sort(function (a, b) {
        return new Date(a.open_time) - new Date(b.open_time); // sort by the open_time property
      });
      data.pop();
      data.pop();
      // console.log("response: ", data);
      response.status(201).send(data);
    } else {
      const klines = await getAllCandles(coin, interval, startTime);
      response.status(201).send(klines);
    }
    console.timeEnd("getklines");
  } catch (error) {
    response
      .status(500)
      .send("Internal server error: coin, interval or datatime not correct");
  }
};

const createTables = async (request, response) => {
  let coindata = await binance.futuresPrices();
  for (const [key] of Object.entries(coindata)) {
    tableGenerator(key.toLowerCase());
  }
  response.status(201).send("Tables Created Correctly");
};

const getCoins = async (request, response) => {
  let coindata = await binance.futuresPrices();
  response.status(201).send(Object.keys(coindata));
};

module.exports = {
  createTables,
  getKlines,
  getCoins,
};
