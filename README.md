# ALPHATRADE

Проект состоит в том, чтобы создать веб-страницу, на которой трейдеры могли бы создавать автоматизированные торговые стратегии для криптовалют и тестировать их на основе прошлых рыночных данных, некоторые трейдеры следуют торговым шаблонам, например:
- покупать, когда RSI находится ниже 20 пунктов.
- продавать, когда индекс RSI превышает 80 пунктов.
Это пример базовой "стратегии", которую используют некоторые трейдеры, цель проекта-протестировать эти стратегии на прошлых данных, чтобы узнать, будет ли она прибыльной в будущем.

## Initialize Project

- 'pacman -S node' - install node.js to run the server
- 'npm install' - install node.js packages and dependencies
- please create a file called keys.js in the root directory with the variables PUBLIC_KEY, PRIVATE_KEY, POSTGRES_USER, DATABASE_NAME, DATABASE_PASSWD like that
```javascript
const PUBLIC_KEY = "xxxxxxx" // Binance Public Api Key
const PRIVATE_KEY = "xxxxxx" // Binance Private Api Key
const POSTGRES_USER = "xxxx" //Postgres User
const DATABASE_NAME = "xxxx" //Postgres Database Name
const DATABASE_PASSWD = "postgres" // Postgres Password

//Export The Modules
module.exports = {
    PUBLIC_KEY,
    PRIVATE_KEY,
    POSTGRES_USER,
    DATABASE_NAME,
    DATABASE_PASSWD
};

- 'node index.js' - run node.js server
