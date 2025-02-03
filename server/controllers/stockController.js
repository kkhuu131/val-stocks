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

function calculateEloToPrice(elo) {
  const A = 2.54;
  const B = 0.00000012;

  return Number((Math.pow(elo, A) * B).toFixed(2));
}

function calculateDemandToPrice(demand) {
  const A = 1.2;
  const B = 0.035;

  return Number(
    (Math.sign(demand) * Math.pow(Math.abs(demand), A) * B).toFixed(2)
  );
}

function calculateSentimentToPrice(sentiment) {
  const B = 0.14;

  return Number(
    (Math.sign(sentiment) * (Math.abs(sentiment) + 1) * B).toFixed(2)
  );
}

function calculatePrice(stock) {
  let elo = stock.elo ? Number(stock.elo) : 0;
  let demand = stock.demand ? Number(stock.demand) : 0;
  let sentiment = stock.sentiment ? Number(stock.sentiment) : 0;

  const w1 = 3.5; // Elo Weight
  const w2 = 2; // Demand Weight
  const w3 = 0.18; // Sentiment Weight
  const basePrice = 100 / Math.pow(1000, w1);

  const eloFactor = Math.pow(elo, w1);
  const demandFactor = 1 + 0.0005 * demand + 0.5 * Math.pow(demand / 2000, w2);
  const sentimentFactor = Math.pow(Math.exp(sentiment / 20), w3);

  const price = basePrice * eloFactor * demandFactor * sentimentFactor;

  return Math.round(price * 100) / 100;
}

/**
 * Updates stock data in the database marked by the given timestamp.
 *
 * This function fetches all the current stock data, calculates their new prices, updates the
 * locked status if needed, and inserts the updated stock prices into the `stock_prices`
 * table with the given timestamp. It also updates the `current_stock_prices` table
 * with the newest stock price information.
 *
 * @param {string} timestamp - The timestamp of when the stock price was updated.
 */
async function updateStockAlgorithm(timestamp) {
  try {
    // Fetch all current stock data from the database
    const currentStocks = await getAllStocks();
    console.log(currentStocks);

    // Updated stock data array
    const stockUpdates = [];

    // Loop through every stock, calculating new updates
    for (const stock of currentStocks) {
      // Calculate new price based on stock data
      const newPrice = calculatePrice(stock);

      // Reset 'locked' status
      if (stock.locked == 2) stock.locked = 0;

      // Create updated stock object
      const stockUpdate = {
        symbol: stock.symbol,
        price: newPrice,
        locked: stock.locked,
      };
      stockUpdates.push(stockUpdate);

      // Create updated stock object for 'stock_prices' table
      const updatedStockPrice = {
        symbol: stock.symbol,
        price: newPrice,
        timestamp,
        interval_type: "minute",
      };

      // Insert updated stock price into 'stock_prices'  table
      const { error } = await supabase
        .from("stock_prices")
        .insert([updatedStockPrice]);

      // Check for errors from insert operation
      if (error) {
        console.error("Error creating new stock timestamp:", error);
        throw error;
      }
    }

    // Upsert the stock updates into 'current_stock_prices' table
    const { error: updateError } = await supabase
      .from("current_stock_prices")
      .upsert(stockUpdates, { onConflict: ["symbol"] });

    // Check for errors from upsert operation
    if (updateError) {
      console.error("Error updating stock price:", updateError);
    }
  } catch (error) {
    // Handle and output any errors during function
    console.error("Error finding or updating stocks:", error);
  }
}

function calculateElo(match, elo1, elo2) {
  // https://stanislav-stankovic.medium.com/elo-rating-system-6196cc59941e#:~:text=After%20each%20match%2C%20the%20Elo,the%20match%20and%20SA%20is
  const c = 400; // Sensitivity based on Rating difference (higher c -> difference in ratings is less significant)
  const K = 90; // Sensitivity
  const L = 40; // Volatility of Score Differential (higher L -> a 3-0 would have way more gain than a 3-2)
  let V = 16; // Volatility (of Match Outcome, higher V -> higher match importance)
  let Ra = elo1;
  let Rb = elo2;

  if (match["match_series"].includes("Quarterfinals")) {
    V *= 1.25;
  } else if (match["match_series"].includes("Semifinals")) {
    V *= 1.5;
  } else if (
    match["match_series"].includes("Upper Final") ||
    match["match_series"].includes("Lower Final")
  ) {
    V *= 3;
  } else if (match["match_series"].includes("Grand Final")) {
    V *= 6;
  }

  const Sa = match.team1_score > match.team2_score ? 1 : 0;
  const Sb = match.team2_score > match.team1_score ? 1 : 0;
  const Pa = match.team1_score / (match.team1_score + match.team2_score);
  const Pb = match.team2_score / (match.team1_score + match.team2_score);
  const Qa = Math.pow(10, Ra / c);
  const Qb = Math.pow(10, Rb / c);
  const Ea = Qa / (Qa + Qb);
  const Eb = Qb / (Qa + Qb);

  let Ka = K;
  let Kb = K;

  if (Sa - Ea < 0) {
    if (match["match_series"].includes("Lower Round")) {
      Ka *= 2;
    } else if (match["match_series"].includes("Elimination")) {
      Ka *= 4;
    } else if (match["match_series"].includes("Lower Final")) {
      Ka *= 5;
    }
  }

  if (Sb - Eb < 0) {
    if (match["match_series"].includes("Lower Round")) {
      Kb *= 2;
    } else if (match["match_series"].includes("Elimination")) {
      Kb *= 4;
    } else if (match["match_series"].includes("Lower Final")) {
      Kb *= 5;
    }
  }

  const newRa = Math.round(Ra + K * (Sa - Ea) + L * Pa + Sa * V);
  const newRb = Math.round(Rb + K * (Sb - Eb) + L * Pb + Sb * V);

  // console.log(newRa);
  // console.log(newRb);

  return [newRa, newRb];
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

  let Ra = 1000;
  let Rb = 1000;

  if (team1Stock) {
    Ra = Number(team1Stock.elo);
  }
  if (team2Stock) {
    Rb = Number(team2Stock.elo);
  }

  let [newRa, newRb] = calculateElo(match, Ra, Rb);

  if (team1Stock) {
    const { error } = await supabase
      .from("current_stock_prices")
      .update({ elo: Math.round(newRa) })
      .eq("symbol", team1Stock.symbol);

    if (error) {
      console.error("Error processing match: ", error);
    }

    console.log("Elo updated for " + match.team1_name);
  }

  if (team2Stock) {
    const { error } = await supabase
      .from("current_stock_prices")
      .update({ elo: Math.round(newRb) })
      .eq("symbol", team2Stock.symbol);

    if (error) {
      console.error("Error processing match: ", error);
    }

    console.log("Elo updated for " + match.team2_name);
  }
}

module.exports = {
  createStock,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  updateStockElo,
  updateStockEloPrice,
  updateStockAlgorithm,
  processCompletedMatch,
  calculateElo,
  calculateEloToPrice,
  calculateDemandToPrice,
  calculateSentimentToPrice,
};
