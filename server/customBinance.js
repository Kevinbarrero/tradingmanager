const axios = require('axios');

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

    // Add the candles to the list
    
    candles = candles.concat(response.data);
    // Get the timestamp of the last candle retrieved
    const lastCandleTimestamp = response.data[response.data.length - 1][0];

    // Set the start time for the next request to the timestamp of the last candle + 1
    startTimeTemp = lastCandleTimestamp + 1;
  } while (response.data.length === limit);

  return candles;
}

module.exports = {
  getAllCandles,
};
