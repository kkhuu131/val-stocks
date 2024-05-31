const express = require("express");
const cors = require("cors");
const teams = require("./teams.json");
const { updateStockAlgorithm } = require("./controllers/stockController");
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

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
