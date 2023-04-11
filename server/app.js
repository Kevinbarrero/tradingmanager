require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
let bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const bodyParser = require("body-parser");
const db = require("./queries");
const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, _id, token"
  );
  next();
});
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const User = require("./model/user");

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/saveStrategy", async (req, res) => {
  console.log(req.headers);
  try {
    const { name, indicators, buyConditions, sellConditions } = req.body;
    if (!(name && indicators && buyConditions && sellConditions)) {
      res.status(400).send("All input is required");
    } else {
      const token = req.headers.token;
      const user_id = req.headers._id;
      if (!token && !user_id) {
        res.status(401).send("Unauthorized");
      } else {
        const user = await User.findOne({ _id: user_id });
        user.strategies.push({
          name: name,
          indicators: indicators,
          buyConditions: buyConditions,
          sellConditions: sellConditions,
        });
        await user.save();
        res.status(200).send("Strategy saved successfully");
      }
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});
app.get("/getStrategies", async (req, res) => {
  try {
    const token = req.headers.token;
    const user_id = req.headers._id;
    if (!token && !user_id) {
      res.status(401).send("Unauthorized");
    } else {
      const user = await User.findOne({ _id: user_id });
      res.status(200).json(user.strategies);
    }
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.post("/deleteStrategy", async (req, res) => {
  try {
    const token = req.headers.token;
    const user_id = req.headers._id;
    const strategyid = req.body.strategy._id
    if (!token && !user_id) {
      res.status(401).send("Unauthorized");
    } else {
      User.findByIdAndUpdate(
        user_id,
        {
          $pull: {
            strategies: {
              _id: strategyid,
            },
          },
        },
        { new: true }
      ).then(user => {
      }).catch(err => {
        console.log(err)
      })
      res.status(200).send("Strategy Deleted")
    }
  } catch (err) {
    console.log(err)
    res.status(500).send("Server error");
  }
});
/*
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})
*/
app.get("/coins", db.getCoins);
app.get("/createtables", db.createTables);
app.get("/klines/:coin/:interval/:startTime", db.getKlines);

module.exports = app;
