const express = require("express");
const cors = require("cors");
const teams = require("./teams.json");
const {
  createStock,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  buyStock,
  sellStock,
  updateStockAlgorithm,
} = require("./controllers/stockController");
const {
  getRelevantUpcomingMatches,
  getMatchData,
} = require("./api/webScraper");
const { supabase } = require("./supabase");
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

async function updateStocks() {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  const utcNow = now.toISOString();

  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    await updateStockAlgorithm(io, utcNow);
    const { error } = await supabase.rpc("update_user_net_worth");
    if (error) {
      throw error;
    } else {
      console.log("Stock update completed successfully.");
    }

    // delete stock records that were more than 24 hours ago
    const { error: deleteError } = await supabase
      .from("stock_prices")
      .delete()
      .lt("timestamp", oneWeekAgo);

    if (deleteError) {
      console.error("Error deleting old stock prices: ", deleteError);
    } else {
      console.log("Delete operation completed successfully.");
    }
  } catch (error) {
    console.error(`Error updating stocks: `, error);
  }

  console.log("All stock updates completed successfully.");
}

cron.schedule("* * * * *", async () => {
  try {
    await updateStocks();
  } catch (error) {
    console.error("Error updating stocks:", error);
  }
});

async function updateMatches() {
  try {
    const matchLinks = await getRelevantUpcomingMatches();

    const { data, error } = await supabase.from("matches").select("match_link");

    if (error) {
      console.error("Error fetching matches table: ", error);
    }
    const linksData = data.map((match) => match.match_link);

    const allLinks = [...new Set([...matchLinks, ...linksData])];

    const matchesData = [];

    const twentyFourHoursAgo = new Date(
      new Date().getTime() - 24 * 60 * 60 * 1000
    ).toISOString();

    for (const link of allLinks) {
      if (!link) {
        continue;
      }
      const matchData = await getMatchData(link);
      matchesData.push(matchData);
    }

    // update existing or insert new matches
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert(matchesData, { onConflict: "match_link" })
      .select();

    if (upsertError) {
      console.error("Error upserting matches: ", upsertError);
    } else {
      console.log("Upsert operation completed successfully.");
    }

    // delete matches that were more than 24 hours ago
    const { error: deleteError } = await supabase
      .from("matches")
      .delete()
      .lt("match_date", twentyFourHoursAgo);

    if (deleteError) {
      console.error("Error deleting old matches: ", deleteError);
    } else {
      console.log("Delete operation completed successfully.");
    }

    console.log("Successfully updated matches data!");
  } catch (error) {
    console.error("Error updating matches:", error);
  }
}

updateMatches();

cron.schedule("*/10 * * * *", async () => {
  try {
    await updateMatches();
  } catch (error) {
    console.error("Error updating matches:", error);
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

// Route to get all upcoming relevant matches
app.get("/upcomingMatches", async (req, res) => {
  try {
    const matches = await performVLRUpcomingScraping(1, teams);
    res.json(matches);
  } catch (error) {
    console.error("Error getting upcoming matches:", error);
    res.status(500).json({ error: "Failed getting upcoming matches" });
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
