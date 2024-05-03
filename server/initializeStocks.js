const { createStock } = require("./controllers/stockController");
const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/ValorantStocksTest1";
const { performVLRScraping } = require("./api/webScraper");
const teamData = require("../src/teamMappings.json");
const CurrentStockPrice = require("./models/CurrentStockPrice");

mongoose
  .connect(mongoURI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const teams = [
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

const S0 = 1000; // Starting Elo

async function initializeStocks() {
  for (const symbol of teams) {
    const newStock = await createStock(symbol, 1000, 0, S0);
  }
}

async function initializeElo() {
  try {
    const allStocks = await CurrentStockPrice.find({});
    for (const stocks of allStocks) {
      stocks.elo = S0;
      await stocks.save();
    }

    const matchData = await getAndFilterMatches();

    for (let i = matchData.length - 1; i >= 0; i--) {
      const match = matchData[i];

      if (!match) {
        continue;
      }

      const team1Data = teamData["teamByNameMap"][match.team1_name];
      const team2Data = teamData["teamByNameMap"][match.team2_name];

      if (!team1Data && !team2Data) {
        continue;
      }

      const team1Stock = team1Data
        ? await CurrentStockPrice.findOne({ symbol: team1Data.symbol })
        : undefined;
      const team2Stock = team2Data
        ? await CurrentStockPrice.findOne({ symbol: team2Data.symbol })
        : undefined;

      if (!team1Stock && !team2Stock) {
        continue;
      }

      // https://stanislav-stankovic.medium.com/elo-rating-system-6196cc59941e#:~:text=After%20each%20match%2C%20the%20Elo,the%20match%20and%20SA%20is
      const c = 400;
      const K = 90;
      const L = 50;
      let V = 16;

      if (match["match_series"].includes("Semifinals")) {
        V *= 1.5;
      } else if (
        match["match_series"].includes("Upper Final") ||
        match["match_series"].includes("Lower Final")
      ) {
        V *= 4;
      } else if (match["match_series"].includes("Grand Final")) {
        V *= 8;
      }

      let Ra = 1000;
      let Rb = 1000;

      if (team1Stock) {
        Ra = Number(team1Stock.elo);
      }
      if (team2Stock) {
        Rb = Number(team2Stock.elo);
      }
      const Sa = match.team1_score > match.team2_score ? 1 : 0;
      const Sb = match.team2_score > match.team1_score ? 1 : 0;
      const Pa =
        match.team1_rounds_scored /
        (match.team1_rounds_scored + match.team2_rounds_scored);
      const Pb =
        match.team2_rounds_scored /
        (match.team1_rounds_scored + match.team2_rounds_scored);
      const Qa = Math.pow(10, Ra / c);
      const Qb = Math.pow(10, Rb / c);
      const Ea = Qa / (Qa + Qb);
      const Eb = Qb / (Qa + Qb);

      const newRa = Ra + K * (Sa - Ea) + L * Pa + Sa * V;
      const newRb = Rb + K * (Sb - Eb) + L * Pb + Sb * V;

      if (team1Stock) {
        team1Stock.elo = Math.round(newRa);
        team1Stock.price =
          Math.round(((team1Stock.price * newRa) / Ra) * 100) / 100; // ** EXPERIMENT **
        await team1Stock.save();
      }

      if (team2Stock) {
        team2Stock.elo = Math.round(newRb);
        team2Stock.price =
          Math.round(((team2Stock.price * newRb) / Rb) * 100) / 100; // ** EXPERIMENT **
        await team2Stock.save();
      }
    }

    console.log("DONE");

    const updatedStocks = await CurrentStockPrice.find({}).sort({ elo: -1 });

    for (const stock of updatedStocks) {
      console.log(stock.symbol + ": " + stock.elo);
    }

    return;
  } catch (error) {
    throw error;
  }
}

async function getAndFilterMatches() {
  const page = 10;
  const matchData = [];

  for (let i = 1; i < page + 1; i++) {
    const curr = await performVLRScraping(i);
    matchData.push(...curr);
  }

  const filteredMatchData = [];

  for (let i = 0; i < matchData.length; i++) {
    if (
      matchData[i] &&
      ((teamData.teamByNameMap[matchData[i].team1_name] &&
        teams.includes(
          teamData.teamByNameMap[matchData[i].team1_name].symbol
        )) ||
        (teamData.teamByNameMap[matchData[i].team2_name] &&
          teams.includes(
            teamData.teamByNameMap[matchData[i].team2_name].symbol
          )))
    ) {
      filteredMatchData.push(matchData[i]);
    }
  }

  return filteredMatchData;
}

initializeStocks();
initializeElo();
