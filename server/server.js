const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {
  createStock,
  buyStock,
  sellStock,
  updateStockAlgorithm,
} = require("./controllers/stockController");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = "mongodb://localhost:27017/ValorantStocksTest";

mongoose
  .connect(mongoURI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const cronSchedule = "* * * * *";

async function updateStocks() {
  const symbols = ["NRG, SEN"];
  const timestamp = new Date();
  timestamp.setSeconds(0);
  timestamp.setMilliseconds(0);

  const updatePromises = symbols.map(async (symbol) => {
    try {
      await updateStockAlgorithm(symbol, timestamp);
      console.log("Stock update for ${symbol} completed successfully.");
    } catch (error) {
      console.error(`Error updating stock ${symbol}:`, error);
    }
  });

  // Wait for all update operations to complete
  await Promise.all(updatePromises);

  console.log("All stock updates completed successfully.");
}

// cron.schedule(cronSchedule, async () => {
//   try {
//     await updateStocks();
//   } catch (error) {
//     console.error("Error updating stocks:", error);
//   }
// });

// Route to create a new stock
app.post("/create", async (req, res) => {
  const { symbol, price, volume } = req.body;
  try {
    const newStock = await createStock(symbol, price, volume);
    res.status(201).json(newStock);
  } catch (error) {
    console.error("Error creating stock:", error);
    res.status(500).json({ error: "Failed to create stock" });
  }
});

// Route to buy a stock
app.post("/buy", async (req, res) => {
  const { symbol, amount } = req.body;
  try {
    const newStock = await buyStock(symbol, amount);
    res.status(201).json();
  } catch (error) {
    console.error("Error buying stock:", error);
    res.status(500).json({ error: "Failed to buy stock" });
  }
});

// Route to sell a stock
app.post("/sell", async (req, res) => {
  const { symbol, amount } = req.body;
  try {
    const newStock = await sellStock(symbol, amount);
    res.status(201).json();
  } catch (error) {
    console.error("Error selling stock:", error);
    res.status(500).json({ error: "Failed to sell stock" });
  }
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
