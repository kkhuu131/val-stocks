const express = require("express");
const cors = require("cors");
const teams = require("./teams.json");
const teamData = require("../src/teamMappings.json");
const {
  processCompletedMatch,
  updateStockAlgorithm,
} = require("./controllers/stockController");
const { getSentiments } = require("./sentiment/redditSentiment.js");
const {
  getRelevantUpcomingMatches,
  getMatchData,
} = require("./api/webScraper");
const { supabase } = require("./supabase");
const cron = require("node-cron");
const http = require("http");

// SERVER INITIALIZATION

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/healthcheck", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is alive!" });
});

const server = http.createServer(app);

// UPDATE FUNCTIONS

async function updateSentiments() {
  const newSentiments = await getSentiments();

  for (const [team, newSentiment] of Object.entries(newSentiments)) {
    // Fetch the current sentiment from database
    const { data, error } = await supabase
      .from("current_stock_prices")
      .select("sentiment")
      .eq("symbol", symbol)
      .single();

    if (error) {
      console.error("Error fetching current stock for ${team}:", error);
      continue;
    }

    const currentSentiment = data?.sentiment || 0;
    const updatedSentiment = currentSentiment + newSentiment;

    // Update sentiment in database
    const { error: updateError } = await supabase
      .from("teams")
      .update({ sentiment: updatedSentiment })
      .eq("team_name", team);

    if (updateError) {
      console.error(`Error updating sentiment for ${team}:`, updateError);
    }
  }
}

async function updateStocks() {
  // Get current time
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  // Get date to start deleting stock records
  const daysToDeleteStockRecords = 10;
  const deleteTime = new Date(
    now - daysToDeleteStockRecords * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    // update sentiments before prices
    await updateSentiments();

    // update stock prices
    await updateStockAlgorithm(now);

    // update all user's networths using new stock prices
    const { error } = await supabase.rpc("update_user_net_worth");
    if (error) {
      throw error;
    } else {
      console.log("Stock update completed successfully.");
    }

    // delete stock records that are before the delete date
    const { error: deleteError } = await supabase
      .from("stock_prices")
      .delete()
      .lt("timestamp", deleteTime);

    if (deleteError) {
      console.error("Error deleting old stock prices: ", deleteError);
    } else {
      console.log("Delete operation completed successfully.");
    }

    // delete more unneeded records
    await deleteOldNonIntervalRecords();
  } catch (error) {
    console.error(`Error updating stocks: `, error);
  }

  console.log("All stock updates completed successfully.");
}

async function deleteOldNonIntervalRecords() {
  // Get current time
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  try {
    const { data: oldRecords, error } = await supabase
      .from("stock_prices")
      .select("symbol, timestamp")
      .lt("timestamp", oneHourAgo)
      .order("timestamp", { ascending: false });

    if (error) {
      throw error;
    }

    if (!oldRecords || oldRecords.length === 0) {
      console.log("No old records found for deletion.");
      return;
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
        throw bulkDeleteError;
      } else {
        console.log("Non interval records delete successfully");
      }
    } else {
      console.log("No old non-interval records found for deletion.");
    }
  } catch (error) {
    console.error("Error deleting non-interval records", error);
    throw error;
  }
}

async function updateMatches() {
  try {
    // Fetch upcoming matches and union with matches already known
    const matchLinks = await getRelevantUpcomingMatches();

    const { data, error } = await supabase
      .from("matches")
      .select("match_link, status");

    if (error) {
      console.error("Error fetching matches table: ", error);
    }
    const linksData = data.map((match) => match.match_link);
    const allLinks = [...new Set([...matchLinks, ...linksData])];

    let matchesData = [];

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

    // filter out matches already known to be finished as they do not need to be updated anymore
    const finishedMatches = new Set(
      data
        .filter(
          (match) => match.status == "completed" || match.status == "processed"
        )
        .map((match) => match.match_link)
    );
    matchesData = matchesData.filter(
      (match) => !finishedMatches.has(match.match_link)
    );

    // update existing or insert new matches
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert(matchesData, { onConflict: "match_link" })
      .select();

    if (upsertError) {
      console.error("Error upserting matches: ", upsertError);
    }

    // Process completed matches and update team elo and apply stock price changes
    const { data: completedMatches, error: matchesError } = await supabase
      .from("matches")
      .select()
      .eq("status", "completed");

    if (matchesError) {
      console.error("Error fetching completed matches: ", matchesError);
    }

    for (const match of completedMatches) {
      await processCompletedMatch(match);

      const { error: matchStatusError } = await supabase
        .from("matches")
        .update({ status: "processed" })
        .eq("match_link", match.match_link);

      if (matchStatusError) {
        console.error("Error updating match status: ", matchStatusError);
      }
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

// CRON SCHEDULE

updateMatches();
updateStocks();

cron.schedule("*/10 * * * *", async () => {
  try {
    await updateMatches();
  } catch (error) {
    console.error("Error updating matches:", error);
  }
});

cron.schedule("0 * * * *", async () => {
  try {
    await updateStocks();
  } catch (error) {
    console.error("Error updating stocks:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
