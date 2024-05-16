const { supabase } = require("../supabase");

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
    .single();

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

async function buyStock(userId, symbol, amount = 0) {
  console.log(userId);

  const { data: currentStockData, error: fetchStockError } = await supabase
    .from("current_stock_prices")
    .select("*")
    .eq("symbol", symbol)
    .single();

  if (fetchStockError) {
    console.error("Error fetching current demand:", fetchStockError);
    throw fetchStockError;
  }

  const stockPrice = currentStockData.price;

  const { data: userProfile, error: fetchUserError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchUserError) {
    console.error("Error fetching profile:", fetchUserError);
    throw fetchUserError;
  }

  let userBalance = userProfile.balance;
  let chargeAmount = amount * stockPrice;

  if (chargeAmount > userBalance) {
    console.log("Insufficient balance.");
    return;
  }

  userBalance = Math.round((userBalance - chargeAmount) * 100) / 100;

  let userStocks = userProfile.stocks || {};

  if (userStocks[symbol]) {
    userStocks[symbol] += amount;
  } else {
    userStocks[symbol] = amount;
  }

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({ balance: userBalance, stocks: userStocks })
    .eq("id", userId);

  if (updateProfileError) {
    throw updateProfileError;
  }

  const { error: updateStockError } = await supabase
    .from("current_stock_prices")
    .update({ demand: currentStockData.demand + amount })
    .eq("symbol", symbol);

  if (updateStockError) {
    throw updateStockError;
  }

  console.log("Completed stock transaction successfully.");
}

async function sellStock(userId, symbol, amount = 0) {
  return modifyDemand(symbol, Number(amount), false);
}

async function updateStockAlgorithm(io, timestamp) {
  const randomnessWeight = 0.007;
  const demandWeight = 0.01;

  try {
    const currentStocks = await getAllStocks();
    const previousMinute = new Date(timestamp - 60 * 1000);

    for (const stock of currentStocks) {
      // Update the price for each document

      // Compare how demand changed % from minute-to-minute
      let demand = stock.demand;

      let randomness = Math.random() - 0.5;

      const priceChange = demand * demandWeight + randomness * randomnessWeight;

      let newPrice = Number(stock.price) * Number(1 + priceChange);
      newPrice = Math.round((newPrice + Number.EPSILON) * 100) / 100;

      const { data, error } = await supabase.from("stock_prices").insert([
        {
          symbol: stock.symbol,
          price: stock.price,
          timestamp: previousMinute,
        },
      ]);

      if (error) {
        console.error("Error creating new stock timestamp:", error);
        throw error;
      }

      const { updatedData, updateError } = await supabase
        .from("current_stock_prices")
        .update({ price: newPrice, demand: 0 })
        .eq("symbol", stock.symbol);

      if (updateError) {
        console.error("Error updating stock price:", updateError);
      }

      console.log(`Updated stock ${stock.symbol}`);
    }
  } catch (error) {
    console.error("Error finding or updating stocks:", error);
  }
}

module.exports = {
  createStock,
  getStockData,
  getCurrentStockData,
  getAllStocks,
  updateStockElo,
  updateStockEloPrice,
  buyStock,
  sellStock,
  updateStockAlgorithm,
};
