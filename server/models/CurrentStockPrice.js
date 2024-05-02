// CurrentStockPrice.js
const mongoose = require("mongoose");

const currentStockPriceSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // Symbol of the stock
  price: { type: Number, required: true }, // Price of the stock
  demand: { type: Number, required: true }, // Net demand of the stock
  elo: { type: Number, required: true },
});

const CurrentStockPrice = mongoose.model(
  "CurrentStockPrice",
  currentStockPriceSchema
);

module.exports = CurrentStockPrice;
