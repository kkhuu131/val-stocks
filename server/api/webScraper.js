const axios = require("axios");
const cheerio = require("cheerio");
const teamData = require("../../src/teamMappings.json");
const teams = require("../teams.json");
const redditUrl = "https://www.reddit.com";
const valoCompetitiveUrl =
  "https://www.reddit.com/r/ValorantCompetitive/New/?f=flair_name%3A%22Post-Match%20Thread%22";
const VLRUrl = "https://www.vlr.gg/matches/results";
// Define a regular expression to match the scoreline (e.g., "2-1", "1-2", etc.)
const scorelineRegex = /\d+-\d+/;

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

async function performVLRUpcomingScraping(page = 1, teamFilter = []) {
  try {
    const { data } = await axios.get(
      "https://www.vlr.gg/matches/?page=" + page
    );
    const $ = cheerio.load(data);

    const divElements = $("div.wf-card");

    const promises = [];

    divElements.each((index, divElement) => {
      $(divElement)
        .children()
        .each((childIndex, childElement) => {
          promises.push(getMatchData($(childElement).attr("href")));
        });
    });

    // Wait for all promises to resolve
    const result = await Promise.all(promises);

    if (teamFilter.length == 0) {
      return result;
    }

    const filteredResult = [];

    result.forEach((match) => {
      if (match) {
        let team1_symbol = "";
        if (teamData.teamByNameMap[match.team1_name]) {
          team1_symbol = teamData.teamByNameMap[match.team1_name].symbol;
        }

        let team2_symbol = "";
        if (teamData.teamByNameMap[match.team2_name]) {
          team2_symbol = teamData.teamByNameMap[match.team2_name].symbol;
        }

        if (
          teamFilter.length == 0 ||
          teamFilter.includes(match.team1_name) ||
          teamFilter.includes(match.team2_name) ||
          teamFilter.includes(team1_symbol) ||
          teamFilter.includes(team2_symbol)
        ) {
          filteredResult.push(match);
        }
      }
    });

    return filteredResult;
  } catch (err) {
    console.log(err.message);
  }
}

async function getRelevantUpcomingMatches() {
  try {
    const { data } = await axios.get("https://www.vlr.gg/matches/?page=" + 1);
    const $ = cheerio.load(data);

    const divElements = $("div.wf-card");

    const res = [];

    divElements.each((index, element) => {
      const links = $(element).children("a");
      links.each((i, link) => {
        const href = "https://www.vlr.gg" + $(link).attr("href");
        const parsedHref = href.split("/").slice(0, 5).join("/");
        const team1_name = $(link)
          .children()
          .eq(1)
          .children()
          .first()
          .children()
          .first()
          .children()
          .first()
          .text()
          .trim();
        const team1_symbol = teamData.teamByNameMap[team1_name]
          ? teamData.teamByNameMap[team1_name].symbol
          : null;

        const team2_name = $(link)
          .children()
          .eq(1)
          .children()
          .last()
          .children()
          .first()
          .children()
          .first()
          .text()
          .trim();
        const team2_symbol = teamData.teamByNameMap[team2_name]
          ? teamData.teamByNameMap[team2_name].symbol
          : null;

        if (
          teams.includes(team1_name) ||
          teams.includes(team2_name) ||
          teams.includes(team1_symbol) ||
          teams.includes(team2_symbol)
        ) {
          res.push(parsedHref);
        }
      });
    });

    return res;
  } catch (err) {
    console.log(err.message);
  }
}

async function getMatchData(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const match_event_img = $('div[class="match-header-super"]')
      .children()
      .first()
      .children()
      .first()
      .children()
      .first()
      .attr("src");

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

    const eta = $('div[class="match-header-vs-score"]')
      .children()
      .first()
      .children()
      .first()
      .text()
      .trim();

    const best_of = Number(
      $('div[class="match-header-vs-score"] div[class="match-header-vs-note"]')
        .eq(1)
        .text()
        .trim()
        .replace("Bo", "")
    );

    const match_date = new Date(
      $('div[class="match-header-date"]').children().first().attr("data-utc-ts")
    );

    match_date.setHours(match_date.getHours() + 4);

    const matchData = {
      match_link: url,
      match_event: match_event,
      match_series: match_series,
      match_event_img: match_event_img,
      team1_name: team1_name,
      team2_name: team2_name,
      match_date: match_date.toISOString(),
      best_of: best_of,
      team1_score: 0,
      team2_score: 0,
    };

    switch (eta) {
      case "live":
        matchData.status = "live";
        break;
      case "":
        matchData.status = "completed";
        break;
      default:
        matchData.status = "upcoming";
    }

    if (eta === "live" || eta === "") {
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

      matchData.team1_score = team1_score;
      matchData.team2_score = team2_score;
    }

    return matchData;
  } catch (err) {}
}

module.exports = {
  performVLRScraping,
  getRelevantUpcomingMatches,
  getMatchData,
};
