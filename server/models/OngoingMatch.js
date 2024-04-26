// OngoingMatch.js
const mongoose = require("mongoose");

const ongoingMatchSchema = new mongoose.Schema({});

const CurrentStockPrice = mongoose.model(
  "OngoingMatch",
  currentStockPriceSchema
);

module.exports = CurrentStockPrice;
