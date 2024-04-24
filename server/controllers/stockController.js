const StockPrice = require("../models/StockPrice");
const mongoose = require("mongoose");

// Function to create a new stock price
async function createStock(symbol = "NRG", price = 100, volume = 10000) {
  try {
    // Check if the stock already exists in the database
    const existingStock = await StockPrice.findOne({ symbol });
    if (existingStock) {
      throw new Error("Stock already exists");
    }

    // Create a new stock price document
    const newStockPrice = new StockPrice({
      symbol,
      price,
      volume,
    });

    // Save the new stock price document to the database
    await newStockPrice.save();

    return newStockPrice;
  } catch (error) {
    throw error;
  }
}

// buySell: True for buy, False for sell
async function modifyVolume(symbol, amount = 0, buySell) {
  try {
    if (isNaN(amount)) {
      throw new Error("Amount must be a valid number");
    }

    // Round the current time to the nearest minute
    const timestamp = new Date();
    timestamp.setSeconds(0);
    timestamp.setMilliseconds(0);

    // Find the stock price document for the specified symbol and timestamp
    let stockPrice = await StockPrice.findOne({ symbol, timestamp });

    // If the stock price document doesn't exist, create it
    if (!stockPrice) {
      throw new Error("Stock does not exist");
    }

    if (!buySell) {
      amount = -1 * amount;
    }

    let result = Number(+stockPrice.volume) + Number(amount);
    stockPrice.volume = result;

    // Save the updated stock price document
    await stockPrice.save();

    console.log(
      `Volume of stock ${symbol} at ${timestamp} modified by ${amount}`
    );
  } catch (error) {
    console.error("Error modifying volume:", error);
    throw error;
  }
}

async function buyStock(symbol, amount = 0) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await modifyVolume(symbol, amount, true);
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Error buying stock:", error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function sellStock(symbol, amount = 0) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await modifyVolume(symbol, amount, false);
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Error selling stock:", error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function updateStockAlgorithm(symbol, timestamp) {
  const session = await mongoose.startSession();
  session.startTransaction();

  const randomnessWeight = 0.1;
  const supplyDemandWeight = 1;

  try {
    const twoMinutesAgo = new Date(timestamp - 2 * 60 * 1000);
    const stockPriceTwoMinutesAgo = await StockPrice.findOne({
      symbol,
      timestamp: twoMinutesAgo,
    });

    const oneMinuteAgo = new Date(timestamp - 1 * 60 * 1000);
    const stockPriceOneMinuteAgo = await StockPrice.findOne({
      symbol,
      timestamp: oneMinuteAgo,
    });

    let volumeChange = 0;
    if (stockPriceTwoMinutesAgo && stockPriceOneMinuteAgo) {
      volumeChange = 1 - stockPriceOneMinuteAgo / stockPriceTwoMinutesAgo;
    }

    const randomness = Math.random() - 0.5;

    const pricePercentChange =
      randomness * randomnessWeight + volumeChange * supplyDemandWeight;

    const newPrice = stockPriceOneMinuteAgo.price * pricePercentChange;
    let newVolume = 10000;

    if (stockPriceOneMinuteAgo) {
      newVolume = stockPriceOneMinuteAgo.volume;
    } else {
      const mostRecentDocument = await StockPrice.findOne({ symbol })
        .sort({ timestamp: -1 })
        .limit(1);
      if (mostRecentDocument) {
        newVolume = mostRecentDocument.volume;
      }
    }

    // Create a new stock price document
    const newStockPrice = new StockPrice({
      symbol,
      newPrice,
      newVolume,
    });

    // Save the new stock price document to the database
    await newStockPrice.save();

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Error updating stock:", error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = { createStock, buyStock, sellStock, updateStockAlgorithm };
