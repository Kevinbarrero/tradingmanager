const axios = require("axios");
const {
  isDateInDb,
  getLastRow,
  coinToDb,
  deleteOldRecords,
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
      });
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
    console.log(error);
  }
  return candles;
}

async function klines1m(coin, startTime) {
  if (await isDateInDb(coin, startTime)) {
    const last = await getLastRow(coin);
    console.log("Data in db");
    const klines = await getAllCandles(
      coin,
      "1m",
      Math.floor(new Date(last.rows[0].open_time).getTime())
    );
    const values = klines.map((value) => ({
      coin: coin.toLowerCase(),
      open_time: new Date(value.open_time).toISOString(),
      open: value.open,
      high: value.high,
      low: value.low,
      close: value.close,
      volume: value.volume,
      close_time: new Date(value.close_time).toISOString(),
      n_trades: value.n_trades,
    }));
    await coinToDb(coin, values);
  } else {
    console.log('Data Not In DB')
    const klines = await getAllCandles(coin, "1m", startTime);
    const values = klines.map((value) => ({
      coin: coin.toLowerCase(),
      open_time: new Date(value.open_time).toISOString(),
      open: value.open,
      high: value.high,
      low: value.low,
      close: value.close,
      volume: value.volume,
      close_time: new Date(value.close_time).toISOString(),
      n_trades: value.n_trades,
    }));
    await coinToDb(coin, values);
  }
}

module.exports = {
  getAllCandles,
  klines1m,
};
