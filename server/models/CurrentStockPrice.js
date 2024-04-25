// CurrentStockPrice.js
const mongoose = require("mongoose");

const currentStockPriceSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // Symbol of the stock
  price: { type: Number, required: true }, // Price of the stock
  volume: { type: Number, required: true }, // Volume of the stock
});

const CurrentStockPrice = mongoose.model(
  "CurrentStockPrice",
  currentStockPriceSchema
);

module.exports = CurrentStockPrice;
