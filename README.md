# ALPHATRADE

Could be a comprehensive platform for traders and investors to develop, test, and execute their trading strategies using sophisticated tools and analytics. Here are some key features and components that could be included in such a project:

Backtesting: Users could test their trading strategies using historical market data to see how their strategies would have performed in the past. The platform could provide sophisticated backtesting tools, such as Monte Carlo simulations, to help users evaluate their strategies' performance in different market conditions.

Real-time market data: The platform could integrate with multiple data providers to provide users with real-time market data, such as stock prices, news, and social media sentiment.

Risk management: The platform could include risk management tools to help traders manage their portfolios and mitigate risk. These tools could include stop-loss orders, position sizing, and portfolio optimization.

Reporting and analytics: The platform could provide users with detailed reporting and analytics on their trading performance, including metrics such as P&L, Sharpe ratio, and drawdown.

## Initialize Project

- install node.js to run the server
- `npm install` - install node.js packages and dependencies
- `docker-compose up -d` - create the database docker volumes and run it.
- please create a file called keys.js inside the /server directory with the variables PUBLIC_KEY, PRIVATE_KEY, POSTGRES_USER, DATABASE_NAME, DATABASE_PASSWD like that
```javascript
const PUBLIC_KEY = "xxxxxxx" // Binance Public Api Key
const PRIVATE_KEY = "xxxxxx" // Binance Private Api Key
const POSTGRES_USER = "xxxx" //Postgres User
const DATABASE_NAME = "xxxx" //Postgres Database Name
const DATABASE_PASSWD = "xx" // Postgres Password

//Export The Modules
module.exports = {
    PUBLIC_KEY,
    PRIVATE_KEY,
    POSTGRES_USER,
    DATABASE_NAME,
    DATABASE_PASSWD
};
```
- `node index.js` - run node.js server
- send the request `curl -X GET "localhost:3000/createtables"`to the node server to generate the tables in the database, the response have to be `Tables Created Correctly`
- You can get the data from the database and the server with the request `/klines/:coin/:interval/:startTime`, where :coin is the pair to extract for example: (btcusdt, bnbusdt, adausdt, ...), :interval is the separation time of the candles, can be (1m, 5m, 15m, 30m, 1h, 2h, 4h, 1d, ...), :startTime is the start time of the query, it have to be a unix time, for example: (1676977380000), please add miliseconds, you can use https://www.unixtimestamp.com/ to convert the times, this request can take to long in the first time if you try with a old time, after that, all the data automatically I'll be saved in the database and is going to be fast. There is an example how to use it `curl -X GET "localhost:3000/klines/BTCUSDT/1m/1676991240000"`, the response from the server is going to be like that 
```javascript
[{"open_time":"2023-02-21T14:55:00.000Z","open":24703.1,"high":24727.4,"low":24695.1,"close":24707.1,"volume":346.937,"close_time":"2023-02-21T14:55:59.999Z","n_trades":2527}]
```