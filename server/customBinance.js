const axios = require("axios");
const {
  isDateInDb,
  getLastRow,
  coinToDb,
} = require("./dbQueries");

async function getAllCandles(symbol, interval, startTime) {
    let candles = [];
  try {
    
    const baseUrl = "https://fapi.binance.com";
    const endpoint = "/fapi/v1/klines";

  
    let limit = 1500;
    let startTimeTemp = startTime;
    let response;

    do {
      response = await axios.get(baseUrl + endpoint, {
        params: {
          symbol: symbol,
          interval: interval,
          startTime: startTimeTemp,
          limit: limit,
        },
      })
      //candles = candles.concat(response.data);
      newCandles = response.data.map((candlestick) => ({
        open_time: candlestick[0],
        open: candlestick[1],
        high: candlestick[2],
        low: candlestick[3],
        close: candlestick[4],
        volume: candlestick[5],
        close_time: candlestick[6],
        n_trades: candlestick[8],
      }));
      candles = candles.concat(newCandles);
      
      const lastCandleTimestamp = response.data[response.data.length - 1][0];
      startTimeTemp = lastCandleTimestamp + 1;
    } while (response.data.length === limit);
  } catch (error) {
    console.log(error)
  }
  return candles;
}

async function klines1m(coin, startTime) {
  try {
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
    klines.forEach(async (value) => {
        await coinToDb(
        coin.toLowerCase(),
        value.open_time / 1000,
        value.open,
        value.high,
        value.low,
        value.close,
        value.volume,
        value.close_time / 1000,
        value.n_trades
      );
    })
  } catch (error) {
    console.log(error)
  }
  
}

module.exports = {
  getAllCandles,
  klines1m,
};
