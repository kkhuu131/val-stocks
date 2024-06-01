const {
  createStock,
  updateStockElo,
  updateStockEloPrice,
  getAllStocks,
  getCurrentStockData,
} = require("./controllers/stockController");
const { performVLRScraping } = require("./api/webScraper");
const teamData = require("../src/teamMappings.json");
const teams = require("./teams.json");
const { supabase } = require("../supabase");

const S0 = 1000; // Starting Elo

async function initializeStocks() {
  for (const symbol of teams) {
    const newStock = await createStock(symbol, 1000, 0, S0);
  }
}

async function initializeElo() {
  try {
    const allStocks = await getAllStocks();
    console.log(allStocks);
    for (const stocks of allStocks) {
      updateStockElo(stocks.symbol, S0);
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
        ? await getCurrentStockData(team1Data.symbol)
        : undefined;
      const team2Stock = team2Data
        ? await getCurrentStockData(team2Data.symbol)
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
        updateStockEloPrice(
          team1Stock.symbol,
          Math.round(newRa),
          Math.round(((team1Stock.price * newRa) / Ra) * 100) / 100
        );
      }

      if (team2Stock) {
        updateStockEloPrice(
          team2Stock.symbol,
          Math.round(newRb),
          Math.round(((team2Stock.price * newRb) / Rb) * 100) / 100
        );
      }
    }

    console.log("DONE");

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
