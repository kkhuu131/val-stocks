const StockPrice = require("../models/StockPrice");

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

async function buyStock(symbol, amount = 0) {
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

    stockPrice.volume += amount;

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

module.exports = { createStock, buyStock };
