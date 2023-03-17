const axios = require("axios");
const {
  isDateInDb,
  getLastRow,
  coinToDb,
} = require("./dbQueries");

async function getAllCandles(symbol, interval, startTime, endTime) {
  const baseUrl = "https://fapi.binance.com";
  const endpoint = "/fapi/v1/klines";

  let candles = [];
  let limit = 1500;
  let startTimeTemp = startTime;
  let response;

  do {
    response = await axios.get(baseUrl + endpoint, {
      params: {
        symbol: symbol,
        interval: interval,
        startTime: startTimeTemp,
        //endTime: endTime,
        limit: limit,
      },
    });
    candles = candles.concat(response.data);
    const lastCandleTimestamp = response.data[response.data.length - 1][0];
    startTimeTemp = lastCandleTimestamp + 1;
  } while (response.data.length === limit);

  return candles;
}

async function klines1m(coin, startTime) {
  if ((await isDateInDb(coin, startTime)) === true) {
    last = await getLastRow(coin);
    console.log("Data in db");
    klines = await getAllCandles(
      coin,
      "1m",
      Math.floor(new Date(last.rows[0].open_time).getTime())
    );
  } else {
    console.log("Data Not in DB");
    klines = await getAllCandles(coin, "1m", startTime);
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
}

module.exports = {
  getAllCandles,
  klines1m,
};
