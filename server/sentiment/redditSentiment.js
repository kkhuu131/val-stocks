const Snoowrap = require("snoowrap");
const dayjs = require("dayjs");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
require("dotenv").config();

const reddit = new Snoowrap({
  userAgent: "ValCompSentimentAnalyzer/0.1 by kkhuu131",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const subredditName = "ValorantCompetitive";

const teams = require("../teams.json");
const teamMappings = require("../../src/teamMappings.json");
const { getPlayersOnTeam } = require("../api/webScraper");
const fs = require("fs");
const path = require("path");
const teamKeywords = require("./teamKeywords.json");

async function fetchAllTeamKeywords() {
  const teamKeywords = {};

  for (const team of teams) {
    let keywords = [];
    keywords.push(team);

    if (teamMappings.teamBySymbolMap[team]?.name)
      keywords.push(teamMappings.teamBySymbolMap[team]?.name);

    if (teamMappings.teamBySymbolMap[team]?.url) {
      // add all player names to keywords
      let players = await getPlayersOnTeam(
        teamMappings.teamBySymbolMap[team].url
      );
      keywords = keywords.concat(players);
    }
    teamKeywords[team] = keywords.map((keyword) => keyword.toLowerCase());
  }

  const filePath = path.join(__dirname, "teamKeywords.json");
  fs.writeFileSync(filePath, JSON.stringify(teamKeywords, null, 2));
}

// Fetch all comments within the last minutes, up to 1000 comments
async function fetchCommentsFrom(minutes) {
  const comments = [];
  let lastComment;

  const timeFrom = dayjs().subtract(minutes, "minute");

  while (true) {
    const options = { limit: 100 };
    if (lastComment) options.after = lastComment;

    const newComments = await reddit
      .getSubreddit(subredditName)
      .getNewComments(options);

    for (const comment of newComments) {
      const commentTime = dayjs.unix(comment.created_utc);
      // Check if the comment is older than the specified time frame
      if (commentTime.isBefore(timeFrom)) {
        return comments; // Stop fetching if older comments are found
      }
      comments.push(comment.body);
      lastComment = comment.name;
    }

    if (newComments.length < 100) {
      break;
    }
  }

  return comments;
}

function analyzeComment(comment, teamKeywords) {
  const sentiments = Object.keys(teamKeywords).reduce((acc, team) => {
    acc[team] = [];
    return acc;
  }, {});

  comment = comment.toLowerCase();

  Object.keys(teamKeywords).forEach((team) => {
    const keywords = teamKeywords[team];
    for (const keyword of keywords) {
      const pattern = new RegExp(`\\b${keyword}\\b`, "i");
      if (pattern.test(comment)) {
        const sentimentScore = sentiment.analyze(comment).comparative - 0.02;
        console.log(
          `Comment: ${comment} | Team: ${team} | Score: ${sentimentScore}`
        );
        sentiments[team].push(sentimentScore);
        break;
      }
    }
  });

  return sentiments;
}

function calculateSentiments(allSentiments) {
  const calculatedSentiments = new Map();

  Object.keys(allSentiments).forEach((team) => {
    const scores = allSentiments[team];
    if (scores.length > 0) {
      const sumSentiment = scores.reduce((a, b) => a + b, 0);
      calculatedSentiments[team] = Number(sumSentiment.toFixed(6));
    } else {
      calculatedSentiments[team] = 0;
    }
  });

  return calculatedSentiments;
}

// Fetchs all the comments from the last 'interval' minutes and find the current sentiment of each team
async function getSentiments(interval = 1) {
  const comments = await fetchCommentsFrom(interval);

  const allSentiments = teams.reduce((acc, team) => {
    acc[team] = [];
    return acc;
  }, {});

  comments.forEach((comment) => {
    const commentSentiments = analyzeComment(comment, teamKeywords);
    Object.keys(commentSentiments).forEach((team) => {
      allSentiments[team].push(...commentSentiments[team]);
    });
  });

  const calculatedSentiments = calculateSentiments(allSentiments);

  return calculatedSentiments;
}

module.exports = {
  getSentiments,
};
