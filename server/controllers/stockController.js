const { supabase } = require("../supabase");
const teams = require("../teams.json");
const teamData = require("../../src/teamMappings.json");

async function checkSymbolExists(symbol = "NRG") {
  const { data, error } = await supabase
    .from("current_stock_prices")
    .select("symbol")
    .eq("symbol", symbol)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// Function to create a new stock price
async function createStock(
  symbol = "NRG",
  price = 1000,
  demand = 0,
  elo = 1000
) {
  // check if this stock already exists
  const exists = await checkSymbolExists(symbol);
  if (exists) {
    return null;
  }

  price = Math.round((price + Number.EPSILON) * 100) / 100;

  const { data, error } = await supabase
    .from("current_stock_prices")
    .insert([{ symbol, price, demand, elo }]);

  if (error) {
    console.error("Error creating new stock:", error);
    throw error;
  }

  return data;
}

async function getAllSchedules() {
  const { data, error } = await supabase
    .from("stock_schedules")
    .select("symbol, percentage, duration");

  if (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }

  return data;
}

async function getAllStocks() {
  const { data, error } = await supabase
    .from("current_stock_prices")
    .select("*");

  if (error) {
    console.error("Error fetching all stock prices:", error);
    throw error;
  }

  return data;
}

// get all the stock prices associated with one symbol (all timestamps)
async function getStockData(symbol = "NRG") {
  const { data, error } = await supabase
    .from("stock_prices")
    .select("*")
    .eq("symbol", symbol)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching stock price:", error);
    throw error;
  }
  return data;
}

async function getCurrentStockData(symbol = "NRG") {
  const { data, error } = await supabase
    .from("current_stock_prices")
    .select("*")
    .eq("symbol", symbol)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching current stock price:", error);
    throw error;
  }
  return data;
}

async function updateStockElo(symbol, elo = 1000) {
  const { data, error } = await supabase
    .from("current_stock_prices")
    .update({ elo })
    .eq("symbol", symbol);

  if (error) {
    console.error("Error updating stock elo:", error);
    throw error;
  }

  return data;
}

async function updateStockEloPrice(symbol, elo, price) {
  const { data, error } = await supabase
    .from("current_stock_prices")
    .update({ elo, price })
    .eq("symbol", symbol);

  if (error) {
    console.error("Error updating stock elo and price:", error);
    throw error;
  }

  return data;
}

async function updateStockAlgorithm(timestamp) {
  const randomnessWeight = 0.005;
  const demandWeight = 0.005;

  try {
    const currentStocks = await getAllStocks();
    const schedules = await getAllSchedules();

    const stockUpdates = {};

    for (const stock of currentStocks) {
      let demand = stock.demand;
      let randomness = Math.random() - 0.5;

      const priceChange = demand * demandWeight + randomness * randomnessWeight;

      stockUpdates[stock.symbol] = priceChange;
    }

    for (const schedule of schedules) {
      stockUpdates[schedule.symbol] += schedule.percentage;
    }

    for (const stock of currentStocks) {
      let newPrice =
        Math.round(
          Number(stock.price) * Number(1 + stockUpdates[stock.symbol]) * 100
        ) / 100;

      const updatedStockPrice = {
        symbol: stock.symbol,
        price: newPrice,
        timestamp,
      };

      const { error } = await supabase
        .from("stock_prices")
        .insert([updatedStockPrice]);

      if (error) {
        console.error("Error creating new stock timestamp:", error);
        throw error;
      }

      const { error: updateError } = await supabase
        .from("current_stock_prices")
        .update({ price: newPrice, demand: 0 })
        .eq("symbol", stock.symbol);

      if (updateError) {
        console.error("Error updating stock price:", updateError);
      }
    }

    // call rpc that decrements and removes any finished durations
    const { applyStockSchedulesError } = await supabase.rpc(
      "apply_stock_schedules"
    );

    if (applyStockSchedulesError) {
      console.error("Error updating schedules:", applyStockSchedulesError);
    }
  } catch (error) {
    console.error("Error finding or updating stocks:", error);
  }
}

async function processCompletedMatch(match) {
  console.log(
    "Processing " + match.team1_name + " vs " + match.team2_name + "..."
  );

  const team1Data = teamData["teamByNameMap"][match.team1_name];
  const team2Data = teamData["teamByNameMap"][match.team2_name];

  const team1Stock = team1Data
    ? await getCurrentStockData(team1Data.symbol)
    : undefined;
  const team2Stock = team2Data
    ? await getCurrentStockData(team2Data.symbol)
    : undefined;

  // https://stanislav-stankovic.medium.com/elo-rating-system-6196cc59941e#:~:text=After%20each%20match%2C%20the%20Elo,the%20match%20and%20SA%20is
  const c = 600;
  const K = 90;
  const L = 35;
  let V = 16;

  if (match["match_series"].includes("Quarterfinals")) {
    V *= 1.25;
  } else if (match["match_series"].includes("Semifinals")) {
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
  const Pa = match.team1_score / (match.team1_score + match.team2_score);
  const Pb = match.team2_score / (match.team1_score + match.team2_score);
  const Qa = Math.pow(10, Ra / c);
  const Qb = Math.pow(10, Rb / c);
  const Ea = Qa / (Qa + Qb);
  const Eb = Qb / (Qa + Qb);

  const newRa = Ra + K * (Sa - Ea) + L * Pa + Sa * V;
  const newRb = Rb + K * (Sb - Eb) + L * Pb + Sb * V;

  const updatedSchedule = [];
  const priceChangeDuration = 60;

  if (team1Stock) {
    const totalPriceChange = newRa / Ra - 1;
    const basePriceChange = parseFloat(
      (totalPriceChange / priceChangeDuration).toFixed(6)
    );

    updatedSchedule.push({
      symbol: team1Stock.symbol,
      percentage: Number(basePriceChange * 2),
      duration: Number(priceChangeDuration),
    });

    updatedSchedule.push({
      symbol: team1Stock.symbol,
      percentage: Number(basePriceChange),
      duration: Number(priceChangeDuration * 2),
    });

    updatedSchedule.push({
      symbol: team1Stock.symbol,
      percentage: Number(priceChange / 8),
      duration: Number(priceChangeDuration * 12),
    });

    const { error } = await supabase
      .from("current_stock_prices")
      .update({ elo: Math.round(newRa) })
      .eq("symbol", team1Stock.symbol);

    if (error) {
      console.error("Error processing match: ", error);
    }

    console.log("Schedule and elo updated for " + match.team1_name);
  }

  if (team2Stock) {
    const totalPriceChange = newRb / Rb - 1;
    const priceChange = parseFloat(
      (totalPriceChange / priceChangeDuration).toFixed(6)
    );

    updatedSchedule.push({
      symbol: team2Stock.symbol,
      percentage: Number(priceChange * 2),
      duration: Number(priceChangeDuration),
    });

    updatedSchedule.push({
      symbol: team2Stock.symbol,
      percentage: Number(priceChange),
      duration: Number(priceChangeDuration * 2),
    });

    updatedSchedule.push({
      symbol: team2Stock.symbol,
      percentage: Number(priceChange / 8),
      duration: Number(priceChangeDuration * 12),
    });

    const { error } = await supabase
      .from("current_stock_prices")
      .update({ elo: Math.round(newRb) })
      .eq("symbol", team2Stock.symbol);

    if (error) {
      console.error("Error processing match: ", error);
    }

    console.log("Schedule and elo updated for " + match.team2_name);
  }

  const { error: insertScheduleError } = await supabase
    .from("stock_schedules")
    .insert(updatedSchedule);

  if (insertScheduleError) {
    console.error("Error adding schedule entry:", insertScheduleError);
  }
}

module.exports = {
  createStock,
  getAllSchedules,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  updateStockElo,
  updateStockEloPrice,
  updateStockAlgorithm,
  processCompletedMatch,
};
