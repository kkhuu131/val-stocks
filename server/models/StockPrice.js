// StockPrice.js
const mongoose = require("mongoose");

// Define the schema for the StockPrice model
const stockPriceSchema = new mongoose.Schema({
  symbol: { type: String, required: true }, // Symbol of the stock
  price: { type: Number, required: true }, // Price of the stock
  volume: { type: Number, required: true }, // Volume of the stock
  timestamp: {
    type: Date,
    default: () => Math.floor(Date.now() / (1000 * 60)) * (1000 * 60),
    required: true,
  }, // Rounded timestamp to the nearest minute
});

stockPriceSchema.index({ timestamp: 1 });

// Create the StockPrice model using the schema
const StockPrice = mongoose.model(
  "StockPrice",
  stockPriceSchema,
  "stockprices"
);

module.exports = StockPrice;
