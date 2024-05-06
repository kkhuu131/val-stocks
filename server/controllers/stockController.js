const StockPrice = require("../models/StockPrice");
const CurrentStockPrice = require("../models/CurrentStockPrice");
const mongoose = require("mongoose");

// Function to create a new stock price
async function createStock(
  symbol = "NRG",
  price = 1000,
  demand = 0,
  elo = 1000
) {
  try {
    // Check if the stock already exists in the database
    const existingStock = await CurrentStockPrice.findOne({ symbol });
    if (existingStock) {
      throw new Error("Stock already exists");
    }

    const formattedPrice = Math.round((price + Number.EPSILON) * 100) / 100;

    // Create a new stock price document
    const newStockPrice = new CurrentStockPrice({
      symbol,
      price: formattedPrice,
      demand,
      elo: elo,
    });

    // Save the new stock price document to the database
    await newStockPrice.save();

    return newStockPrice;
  } catch (error) {
    throw error;
  }
}

async function getAllStocks() {
  // Check if the stock exists in the database
  const stockData = await CurrentStockPrice.find();

  if (stockData.length === 0) {
    throw new Error("Stock data not found");
  }

  return stockData;
}

async function getStockData(symbol = "NRG") {
  // Check if the stock exists in the database
  const stockData = await StockPrice.find({ symbol }).sort({
    timestamp: 1,
  });

  // if (stockData.length === 0) {
  //   throw new Error("Stock data not found");
  // }

  return stockData;
}

async function getCurrentStockData(symbol = "NRG") {
  // Check if the stock exists in the database
  const stockData = await CurrentStockPrice.findOne({ symbol });

  if (stockData.length === 0) {
    throw new Error("Stock data not found");
  }

  return stockData;
}

// buySell: True for buy, False for sell
async function modifyDemand(symbol, amount = 0, buySell) {
  try {
    if (isNaN(amount)) {
      throw new Error("Amount must be a valid number");
    }

    // Find the stock price document for the specified symbol and timestamp
    let currentStockPrice = await CurrentStockPrice.findOne({ symbol });

    // If the stock price document doesn't exist, create it
    if (!currentStockPrice) {
      throw new Error("Stock does not exist");
    }

    if (!buySell) {
      amount = -1 * amount;
    }

    let result = Number(+currentStockPrice.demand) + Number(amount);
    currentStockPrice.demand = result;

    // Save the updated stock price document
    await currentStockPrice.save();

    console.log(`Demand of stock ${symbol} modified by ${amount}`);
  } catch (error) {
    console.error("Error modifying demand:", error);
    throw error;
  }
}

async function buyStock(symbol, amount = 0) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await modifyDemand(symbol, amount, true);
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
    await modifyDemand(symbol, amount, false);
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Error selling stock:", error);
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function updateStockAlgorithm(io, timestamp) {
  const randomnessWeight = 0.007;
  const demandWeight = 0.01;

  try {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const currentStocks = await CurrentStockPrice.find({});
    const previousMinute = new Date(timestamp - 60 * 1000);

    for (const stock of currentStocks) {
      // Update the price for each document

      // Compare how demand changed % from minute-to-minute
      let demand = stock.demand;

      let randomness = Math.random() - 0.5;

      const priceChange = demand * demandWeight + randomness * randomnessWeight;

      let newPrice = Number(stock.price) * Number(1 + priceChange);
      newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

      stock.price = newPrice;

      // Save current stock price as a document in StockPrice
      const newArchivedStockPrice = new StockPrice({
        symbol: stock.symbol,
        price: stock.price,
        demand: stock.demand,
        previousMinute,
      });
      await newArchivedStockPrice.save();
      io.emit("newStockData", newArchivedStockPrice);

      stock.demand = 0;

      try {
        await stock.save();
        console.log(`Updated stock ${stock.symbol}`);
      } catch (error) {
        console.error(`Error updating stock ${stock.symbol}:`, error);
        // Rollback the transaction if any error occurs
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }

    // Commit the transaction if all updates are successful
    await session.commitTransaction();
    session.endSession();
    console.log("Transaction committed successfully.");
  } catch (error) {
    console.error("Error finding or updating stocks:", error);
  }
}

module.exports = {
  createStock,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  buyStock,
  sellStock,
  updateStockAlgorithm,
};
