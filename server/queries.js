const { response } = require("express");
const Binance = require("node-binance-api");
const {getAllCandles} = require('./customBinance.js')
const {coinToDb, tableGenerator, pool, isDateInDb} = require('./dbQueries')

const binance = new Binance().options({
  APIKEY: "lH0sHdc09QIabXjTmQi5XWsskWLb1bKshUABOu5Nmh3maX15YxNOg1vXVloRRYGu",
  APISECRET: "Hm4SWeT8824oV9GfiaZbYnSNRLyhYT21YkkK5CfTDktsltms0YLCRSUIiXjBrJ43",
  recvWindow: 60000,
  verbose: true
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
  console.log(request.params);
  console.log(isDateInDb(coin, startTime));

  klines = await getAllCandles(coin, interval, startTime)
  //console.log(klines)
  for (const [key, value] of Object.entries(klines)) {
    console.log(new Date(value[0]).toLocaleString(), key);
    coinToDb(
      coin.toLowerCase(),
      value[0]/1000,
      value[1],
      value[2],
      value[3],
      value[4],
      value[5],
      value[6]/1000,
      value[8]
    );
  }
  response.status(201).send(klines);
};

//query to add coin list to db
async function coinUpdaterQuery() {
  let coindata = await binance.futuresPrices();
  for (const [key] of Object.entries(coindata)) {
    /*
    pool.query(
      "INSERT INTO coins (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *",
      [key]
    ),
      (error) => {
        if (error) {
          throw error;
        }
      };
      */
    tableGenerator(key.toLowerCase());
  }
}

const createTables = (request, response) => {
  coinUpdaterQuery();
  response.status(201).send("Coins Updated Correctly");
};

module.exports = {
  getCoin,
  createTables,
  getKlines,
};
