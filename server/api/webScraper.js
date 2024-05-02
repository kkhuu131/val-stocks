const axios = require("axios");
const cheerio = require("cheerio");

const redditUrl = "https://www.reddit.com";
const valoCompetitiveUrl =
  "https://www.reddit.com/r/ValorantCompetitive/New/?f=flair_name%3A%22Post-Match%20Thread%22";
const VLRUrl = "https://www.vlr.gg/matches/results";
// Define a regular expression to match the scoreline (e.g., "2-1", "1-2", etc.)
const scorelineRegex = /\d+-\d+/;

async function performValoCompetitiveScraping() {
  try {
    const { data } = await axios.get(valoCompetitiveUrl);
    const $ = cheerio.load(data);
    const matchSet = new Set();

    $('a[data-click-id="body"]').each(async (index, element) => {
      const pageUrl = $(element).attr("href");
      if (pageUrl) {
        try {
          const id = pageUrl.split("/")[4];
          if (!matchSet.has(id)) {
            matchSet.add(id);
            const response = await axios.get(redditUrl + pageUrl);

            const pageContent = response.data;
            const page$ = cheerio.load(pageContent);
            // Extract the text of the first child of the div with id "t3-lcgegvu-post-rtjson-content"
            const match = page$("#t3_" + id + "-post-rtjson-content")
              .children()
              .first()
              .text();
            const scoreline = match.match(scorelineRegex)[0];
            const [team1, team2] = match.split(scoreline);
            const team1Name = team1.trim();
            const team2Name = team2.trim();
            console.log("Scoreline:", scoreline);
            console.log("Team 1:", team1Name);
            console.log("Team 2:", team2Name);

            let [team1Games, team2Games] = scoreline.split("-");
            const numGames = Number(team1Games) + Number(team2Games);
            console.log(numGames);

            for (let i = 0; i < numGames; i++) {
              const game = page$("#t3_" + id + "-post-rtjson-content")
                .children()
                .eq(2 + i)
                .text()
                .trim();

              const gameScoreline = game.match(scorelineRegex)[0];

              console.log(gameScoreline);
            }

            console.log("-------------------");
          }
        } catch (error) {
          console.error("Error scraping page:", error);
        }
      }
    });
  } catch (err) {
    console.log(err.message);
  }
}

async function performVLRScraping(page = 1) {
  try {
    const { data } = await axios.get(
      "https://www.vlr.gg/matches/results/?page=" + page
    );
    const $ = cheerio.load(data);

    const divElements = $("div.wf-card");

    const promises = [];

    divElements.each((index, divElement) => {
      $(divElement)
        .children()
        .each((childIndex, childElement) => {
          promises.push(getVLRMatchData($(childElement).attr("href")));
        });
    });

    // Wait for all promises to resolve
    const result = await Promise.all(promises);

    return result;
  } catch (err) {
    console.log(err.message);
  }
}

async function getVLRMatchData(url) {
  try {
    const { data } = await axios.get("https://www.vlr.gg" + url);
    const $ = cheerio.load(data);

    const match_event = $('div[style="font-weight: 700;"]').text().trim();
    const match_series = $(".match-header-event-series")
      .text()
      .trim()
      .replace(/[\n\t]/g, "");

    const team1_name = $('div[class="match-header-link-name mod-1"]')
      .children()
      .first()
      .text()
      .trim();

    const team2_name = $('div[class="match-header-link-name mod-2"]')
      .children()
      .first()
      .text()
      .trim();

    const team1_score = Number(
      $('div[class="match-header-vs-score"]')
        .children()
        .eq(1)
        .children()
        .first()
        .children()
        .first()
        .text()
        .trim()
    );

    const team2_score = Number(
      $('div[class="match-header-vs-score"]')
        .children()
        .eq(1)
        .children()
        .first()
        .children()
        .last()
        .text()
        .trim()
    );

    const team1MapScoreline = [];
    const team2MapScoreline = [];
    let team1_rounds_scored = 0;
    let team2_rounds_scored = 0;

    let i = 0;
    $('div[class="team"]').each((index, element) => {
      const text = $(element).children().first().text().trim();
      if (text) {
        team1MapScoreline[i] = Number(
          $(element).children().first().text().trim()
        );
        team1_rounds_scored += team1MapScoreline[i];
        i++;
      }
    });

    i = 0;
    $('div[class="team mod-right"]').each((index, element) => {
      const text = $(element).children().first().text().trim();
      if (text) {
        team2MapScoreline[i] = Number(
          $(element).children().last().text().trim()
        );
        team2_rounds_scored += team2MapScoreline[i];
        i++;
      }
    });

    const matchData = {
      match_event: match_event,
      match_series: match_series,
      team1_name: team1_name,
      team2_name: team2_name,
      best_of: Math.max(team1_score, team2_score) * 2 - 1,
      team1_score: team1_score,
      team2_score: team2_score,
      num_maps: team1_score + team2_score,
      team1_rounds_scored: team1_rounds_scored,
      team2_rounds_scored: team2_rounds_scored,
    };

    if (team1_score > team2_score) {
      matchData["matchWinner"] = team1_name;
    } else {
      matchData["matchWinner"] = team2_name;
    }

    for (
      let i = 0;
      i < Math.min(team1MapScoreline.length, team2MapScoreline.length);
      i++
    ) {
      matchData["map" + (i + 1) + "Scoreline"] = {
        team1: team1MapScoreline[i],
        team2: team2MapScoreline[i],
      };
    }

    return matchData;
  } catch (err) {}
}

async function testGetVLRMatchData() {
  try {
    const matchData = await getVLRMatchData(
      "/325990/arena-internet-cafe-vs-jijiehao-challengers-league-oceania-stage-1-uf"
    );
    console.log(matchData);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

module.exports = { performVLRScraping };
