const express = require("express");
const cors = require("cors");
const teams = require("./teams.json");
const teamData = require("../src/teamMappings.json");
const {
  updateStockElo,
  updateStockEloPrice,
  getCurrentStockData,
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

// Health check route
app.get("/healthcheck", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is alive!" });
});

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

  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const utcNow = now.toISOString();

  try {
    await updateStockAlgorithm(io, now);
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

    await deleteOldNonIntervalRecords();
  } catch (error) {
    console.error(`Error updating stocks: `, error);
  }

  console.log("All stock updates completed successfully.");
}

async function deleteOldNonIntervalRecords() {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  try {
    const { data: oldRecords, error } = await supabase
      .from("stock_prices")
      .select("symbol, timestamp")
      .lt("timestamp", oneHourAgo);

    if (error) {
      throw error;
    }

    const recordsToDelete = oldRecords.filter((record) => {
      const date = new Date(record.timestamp);
      const minutes = date.getMinutes();
      return minutes % 30 !== 0;
    });

    if (recordsToDelete.length > 0) {
      const deleteConditions = recordsToDelete.map(
        (record) => record.timestamp
      );

      const { error: bulkDeleteError } = await supabase
        .from("stock_prices")
        .delete()
        .in("timestamp", deleteConditions);

      if (bulkDeleteError) {
        console.error(
          "Error occurred during bulk non-interval deletion: ",
          bulkDeleteError
        );
      } else {
        console.log("Non interval records delete successfully");
      }
    }
  } catch (error) {
    console.error("Error deleting non-interval records", error);
  }
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

    // // Process completed matches and update team elo and apply stock price changes
    // const { data: completedMatches, error: matchesError } = await supabase
    //   .from("matches")
    //   .select()
    //   .eq("status", "completed");

    // if (matchesError) {
    //   console.error("Error fetching completed matches: ", matchesError);
    // }

    // for (const match of completedMatches) {
    //   processCompletedMatch(match);
    // }

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

// async function processCompletedMatch(match) {
//   const team1Data = teamData["teamByNameMap"][match.team1_name];
//   const team2Data = teamData["teamByNameMap"][match.team2_name];

//   const team1Stock = team1Data
//     ? await getCurrentStockData(team1Data.symbol)
//     : undefined;
//   const team2Stock = team2Data
//     ? await getCurrentStockData(team2Data.symbol)
//     : undefined;

//   // https://stanislav-stankovic.medium.com/elo-rating-system-6196cc59941e#:~:text=After%20each%20match%2C%20the%20Elo,the%20match%20and%20SA%20is
//   const c = 400;
//   const K = 90;
//   const L = 50;
//   let V = 16;

//   if (match["match_series"].includes("Quarterfinals")) {
//     V *= 1.25;
//   } else if (match["match_series"].includes("Semifinals")) {
//     V *= 1.5;
//   } else if (
//     match["match_series"].includes("Upper Final") ||
//     match["match_series"].includes("Lower Final")
//   ) {
//     V *= 4;
//   } else if (match["match_series"].includes("Grand Final")) {
//     V *= 8;
//   }

//   let Ra = 1000;
//   let Rb = 1000;

//   if (team1Stock) {
//     Ra = Number(team1Stock.elo);
//   }
//   if (team2Stock) {
//     Rb = Number(team2Stock.elo);
//   }

//   const Sa = match.team1_score > match.team2_score ? 1 : 0;
//   const Sb = match.team2_score > match.team1_score ? 1 : 0;
//   const Pa = match.team1_score / (match.team1_score + match.team2_score);
//   const Pb = match.team2_score / (match.team1_score + match.team2_score);
//   const Qa = Math.pow(10, Ra / c);
//   const Qb = Math.pow(10, Rb / c);
//   const Ea = Qa / (Qa + Qb);
//   const Eb = Qb / (Qa + Qb);

//   const newRa = Ra + K * (Sa - Ea) + L * Pa + Sa * V;
//   const newRb = Rb + K * (Sb - Eb) + L * Pb + Sb * V;

//   if (team1Stock) {
//     const { data, error } = await supabase
//       .from("current_stock_prices")
//       .update({ elo: Math.round(newRa), price })
//       .eq("symbol", team1Stock.symbol);

//     const team1_price_change = Math.round(((1 + newRa / Ra) * 100) / 100);
//   }

//   if (team2Stock) {
//     updateStockEloPrice(
//       team2Stock.symbol,
//       Math.round(newRb),
//       Math.round(((team2Stock.price * newRb) / Rb) * 100) / 100
//     );
//   }
// }

updateMatches();

cron.schedule("*/10 * * * *", async () => {
  try {
    await updateMatches();
  } catch (error) {
    console.error("Error updating matches:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
