const express = require("express");
const cors = require("cors");
const {
  createStock,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  buyStock,
  sellStock,
  updateStockAlgorithm,
} = require("./controllers/stockController");
const cron = require("node-cron");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected.");
  });
});

const cronSchedule = "* * * * *";

async function updateStocks() {
  const timestamp = new Date();
  timestamp.setSeconds(0);
  timestamp.setMilliseconds(0);

  try {
    await updateStockAlgorithm(io, timestamp);
    console.log("Stock update completed successfully.");
  } catch (error) {
    console.error(`Error updating stocks: `, error);
  }

  console.log("All stock updates completed successfully.");
}

cron.schedule(cronSchedule, async () => {
  try {
    await updateStocks();
  } catch (error) {
    console.error("Error updating stocks:", error);
  }
});

// Route to create a new stock
app.post("/create", async (req, res) => {
  const { symbol, price, demand } = req.body;
  try {
    const newStock = await createStock(symbol, price, demand);
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

// Route to get all current stocks
app.get("/stocks", async (req, res) => {
  try {
    const stocks = await getAllStocks();
    res.json(stocks);
  } catch (error) {
    console.error("Error getting all current stocks:", error);
    res.status(500).json({ error: "Failed getting all current stocks" });
  }
});

const stockRouter = express.Router();

// Route to fetch stock data
stockRouter.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  try {
    // Fetch stock data from the database
    stockData = await getStockData(symbol);

    // Send the stock data as JSON response
    res.json(stockData);
  } catch (error) {
    console.error("Error fetching " + symbol + " stock data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch " + symbol + " stock data" });
  }
});

app.use("/stockData", stockRouter);

const currentStockRouter = express.Router();

// Route to fetch stock data
currentStockRouter.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  try {
    // Fetch stock data from the database
    stockData = await getCurrentStockData(symbol);

    // Send the stock data as JSON response
    res.json(stockData);
  } catch (error) {
    console.error("Error fetching " + symbol + " stock data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch " + symbol + " stock data" });
  }
});

app.use("/currentStockData", currentStockRouter);

// Start the server and listen for incoming requests
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
