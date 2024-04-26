const { createStock } = require("./controllers/stockController");
const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/ValorantStocksTest";

mongoose
  .connect(mongoURI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const franchisedTeams = [
  "100T",
  "C9",
  "EG",
  "FUR",
  "KRÜ",
  "LEV",
  "LOUD",
  "MIBR",
  "NRG",
  "SEN",
  "G2",
];

async function initializeStocks() {
  for (const symbol of franchisedTeams) {
    console.log(symbol);
    const newStock = await createStock(symbol, 1000, 0);
  }
}

initializeStocks();
