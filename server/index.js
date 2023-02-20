const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const db = require('./queries')
const console = require('console');

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/coindata/:coin', db.getCoin)
app.get('/createtables', db.createTables)
app.get('/klines/:coin/:interval/:startTime', db.getKlines)
app.listen(port, () => {
  //binance.futuresChart( 'BTCUSDT', '1m', console.log );
  console.log(`App running on port ${port}.`)
})
