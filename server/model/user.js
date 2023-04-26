const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: null },
  lastname: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  status: { type: String, enum: ['working', 'online', 'offline'], default: 'offline' },
  strategies: [{
    name: { type: String },
    indicators: [{
      id: { type: String },
      value: { type: Number }
    }],
    buyConditions: [String],
    sellConditions: [String],
  }]
});

const defaultStrategy = {
  name: 'default',
  indicators: [
    { id: 'ema', value: 30 },
    { id: 'ema', value: 90 },
    { id: 'rsi', value: 6 }
  ],
  buyConditions: ['ema30>ema90', 'rsi6>70'],
  sellConditions: ['ema30<ema90', 'rsi6<30']
};

userSchema
  .path('strategies')
  .default(() => [defaultStrategy]);

module.exports = mongoose.model("user", userSchema);
