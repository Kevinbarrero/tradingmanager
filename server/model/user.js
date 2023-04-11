const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: null },
  lastname: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  strategies: [{
    name: { type: String, unique: true },
    indicators: [{
      id: { type: String },
      value: { type: Number }
    }],
    buyConditions: [String],
    sellConditions: [String],
  }]
});


module.exports = mongoose.model("user", userSchema);