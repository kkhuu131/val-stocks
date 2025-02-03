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
  const decayFactor = 0.998;

  for (const team in newSentiments) {
    const newSentiment = newSentiments[team] * 5;

    if (newSentiment !== 0) {
      console.log(`New sentiment for ${team}: ${newSentiment}`);
    }

    // Fetch the current sentiment from database
    const { data, error } = await supabase
      .from("current_stock_prices")
      .select("sentiment")
      .eq("symbol", team)
      .single();

    if (error) {
      console.error(`Error fetching current stock for ${team}:`, error);
      continue;
    }

    // Add some noise to the sentiment range [-0.5, 0.5]
    const noise = Math.random() ** 2 * 0.5 * (Math.random() > 0.5 ? 1 : -1);

    const currentSentiment = data?.sentiment || 0;
    const updatedSentiment = Number(
      (currentSentiment * decayFactor + newSentiment + noise).toFixed(6)
    );

    // Update sentiment in database
    const { error: updateError } = await supabase
      .from("current_stock_prices")
      .update({ sentiment: updatedSentiment })
      .eq("symbol", team);

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

  try {
    // update sentiments before prices
    await updateSentiments();

    // update stock prices
    await updateStockAlgorithm(now);
  } catch (error) {
    console.error(`Error updating stocks: `, error);
  }

  console.log("Stocks updated successfully at ", now);
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
      // console.log("Delete operation completed successfully.");
    }

    // console.log("Successfully updated matches data!");
  } catch (error) {
    console.error("Error updating matches:", error);
  }
}

// CRON SCHEDULE
// updateMatches();
// updateStocks();

cron.schedule("*/10 * * * *", async () => {
  try {
    await updateMatches();
  } catch (error) {
    console.error("Error updating matches:", error);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    await updateStocks();
  } catch (error) {
    console.error("Error updating stocks:", error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
