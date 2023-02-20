const Binance = require('node-binance-api');
const format = require('pg-format');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tradingmanager',
  password: 'postgres',
  port: 5432,
})

const binance = new Binance().options({
        APIKEY: 'lH0sHdc09QIabXjTmQi5XWsskWLb1bKshUABOu5Nmh3maX15YxNOg1vXVloRRYGu',
        APISECRET: 'Hm4SWeT8824oV9GfiaZbYnSNRLyhYT21YkkK5CfTDktsltms0YLCRSUIiXjBrJ43',
});

const getCoin = (request, response) => {
	pool.query('SELECT * FROM coin_data', (error, results) =>{
	if (error) {
	throw error
	}
	response.status(200).json(results.rows)
	})
}
function customQuery(key){
	pool.query('INSERT INTO coins (name) VALUES ($1) RETURNING *', [key]), (error, results)=>{
        if (error) {
                throw error
        }
        response.status(201).send('Coins added to database: ${key}')
	}
}

const addcoins = async(request, response) => {
	let coindata = await binance.futuresPrices();
	for (const[key, value] of Object.entries(coindata)){
	customQuery(key)
	}
}

module.exports = {
	getCoin,
	addcoins
}
