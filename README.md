# ALPHATRADE


Could be a comprehensive platform for traders and investors to develop, test, and execute their trading strategies using sophisticated tools and analytics. Here are some key features and components that could be included in such a project:

Backtesting: Users could test their trading strategies using historical market data to see how their strategies would have performed in the past. The platform could provide sophisticated backtesting tools, such as Monte Carlo simulations, to help users evaluate their strategies' performance in different market conditions.

Real-time market data: The platform could integrate with multiple data providers to provide users with real-time market data, such as stock prices, news, and social media sentiment.

Risk management: The platform could include risk management tools to help traders manage their portfolios and mitigate risk. These tools could include stop-loss orders, position sizing, and portfolio optimization.

Reporting and analytics: The platform could provide users with detailed reporting and analytics on their trading performance, including metrics such as P&L, Sharpe ratio, and drawdown.

## Initialize Project

- install node.js to run the server
- `npm install` - install node.js packages and dependencies
- `docker-compose up -d` - create the database docker volumes and run it, you can check the state of the databases with `docker-compose ps`, please check if postgres is runnig in the port 5432 and mongo in 27017.
- Please create a file called .env inside the /server directory like that:
```javascript
API_PORT=3000

MONGO_URI= mongodb://holdandup:4200@localhost:27017
TOKEN_KEY = secret

PUBLIC_KEY = "xxxxx"
PRIVATE_KEY = "xxxx"
POSTGRES_USER = "tradingmanager"
DATABASE_NAME = "tradingmanager"
DATABASE_PASSWD = "tradingmanager"
```
- `node index.js` - run node.js server
- Send the request `curl -X GET "localhost:3000/createtables"`to the node server to generate the tables in the database, the response have to be `Tables Created Correctly`
- Create the function delete_old_records in the database, there is the postgres code to to that:
```sql

create function delete_old_records() returns void
    language plpgsql
as
$$
DECLARE
  table_name text;
BEGIN
<<<<<<< HEAD
=======
>>>>>>> feature/ReadMeChanges
  FOR table_name IN 
    SELECT quote_ident(tablename)
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE '
      DELETE FROM ' || table_name || ' 
      WHERE ctid IN (
        SELECT ctid FROM (
          SELECT ctid, row_number() OVER (ORDER BY open_time DESC) as row_num
          FROM ' || table_name || '
        ) subquery
        WHERE row_num > 500000
      );
    ';
  END LOOP;
END;
$$;

alter function delete_old_records() owner to tradingmanager;

```
- You can get the data from the database and the server with the request `/klines/:coin/:interval/:startTime`, where :coin is the pair to extract for example: (btcusdt, bnbusdt, adausdt, ...), :interval is the separation time of the candles, can be (1m, 5m, 15m, 30m, 1h, 2h, 4h, 1d, ...), :startTime is the start time of the query, it have to be a unix time, for example: (1676977380000), please add miliseconds, you can use https://www.unixtimestamp.com/ to convert the times, this request can take to long in the first time if you try with a old time, after that, all the data automatically I'll be saved in the database and is going to be fast. There is an example how to use it `curl -X GET "localhost:3000/klines/BTCUSDT/1m/1676991240000"`, the response from the server is going to be like that 
```javascript
[{"open_time":"2023-02-21T14:55:00.000Z","open":24703.1,"high":24727.4,"low":24695.1,"close":24707.1,"volume":346.937,"close_time":"2023-02-21T14:55:59.999Z","n_trades":2527}]
```
