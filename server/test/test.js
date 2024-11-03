const teams = require("../teams.json");
const teamData = require("../../src/teamMappings.json");
const matchesData = require("./matches2024Data.json");
const {
  calculateElo,
  calculateEloToPrice,
  calculateDemandToPrice,
  calculateSentimentToPrice,
} = require("../controllers/stockController");
const { getSentiments } = require("../sentiment/redditSentiment");
const { getMatchData, getMatchLinksFromEvent } = require("../api/webScraper");

const fs = require("fs");

async function testProcessMatch() {
  const matchData = await getMatchData("https://www.vlr.gg/312779");
  console.log(matchData);

  await testProcessCompletedMatch(matchData);
  console.log("Done");
}

async function fetch2024MatchData() {
  const events2024 = [
    "https://www.vlr.gg/event/matches/1924/champions-tour-2024-pacific-kickoff/?series_id=all",
    "https://www.vlr.gg/event/matches/1925/champions-tour-2024-emea-kickoff/?series_id=all",
    "https://www.vlr.gg/event/matches/1926/champions-tour-2024-china-kickoff/?series_id=all",
    "https://www.vlr.gg/event/matches/1923/champions-tour-2024-americas-kickoff/?series_id=all",
    "https://www.vlr.gg/event/matches/1921/champions-tour-2024-masters-madrid/?series_id=all",
    "https://www.vlr.gg/event/matches/2002/champions-tour-2024-pacific-stage-1/?series_id=all",
    "https://www.vlr.gg/event/matches/1998/champions-tour-2024-emea-stage-1/?series_id=all",
    "https://www.vlr.gg/event/matches/2004/champions-tour-2024-americas-stage-1/?series_id=all",
    "https://www.vlr.gg/event/matches/2006/champions-tour-2024-china-stage-1/?series_id=all",
    "https://www.vlr.gg/event/matches/1999/champions-tour-2024-masters-shanghai/?series_id=all",
    "https://www.vlr.gg/event/matches/2094/champions-tour-2024-emea-stage-2/?series_id=all",
    "https://www.vlr.gg/event/matches/2005/champions-tour-2024-pacific-stage-2/?series_id=all",
    "https://www.vlr.gg/event/matches/2096/champions-tour-2024-china-stage-2/?series_id=all",
    "https://www.vlr.gg/event/matches/2095/champions-tour-2024-americas-stage-2/?series_id=all",
    "https://www.vlr.gg/event/matches/2097/valorant-champions-2024/?series_id=all",
  ];

  let matches2024 = [];

  for (const event of events2024) {
    matches2024 = matches2024.concat(await getMatchLinksFromEvent(event));
  }

  const matches2024Data = [];

  for (const match of matches2024) {
    const matchData = await getMatchData(match);
    matches2024Data.push(matchData);
  }

  try {
    const jsonMappings = JSON.stringify(matches2024Data);

    const filePath = "./server/test/matches2024Data.json";
    fs.writeFileSync(filePath, jsonMappings);

    console.log("Mappings saved to", filePath);
  } catch (error) {
    console.error("Error saving mappings:", error);
  }
}

const baseElo = 1000;

async function simulate2024() {
  const teamElos = new Map();
  for (const team of teams) {
    teamElos.set(team, baseElo);
  }

  for (const matchData of matchesData) {
    const team1 = matchData.team1_symbol;
    const team2 = matchData.team2_symbol;

    let Ra = baseElo;
    let Rb = baseElo;

    if (teams.includes(team1)) {
      if (!teamElos.has(team1)) {
        console.log(team1);
        teamElos.set(team1, 1000);
      }

      Ra = teamElos.get(team1);
    }

    if (teams.includes(team2)) {
      if (!teamElos.has(team2)) {
        console.log(team2);
        teamElos.set(team2, 1000);
      }

      Rb = teamElos.get(team2);
    }

    let [newRa, newRb] = await calculateElo(matchData, Ra, Rb);

    if (teams.includes(team1)) {
      teamElos.set(team1, newRa);
    }

    if (teams.includes(team2)) {
      teamElos.set(team2, newRb);
    }
  }

  return teamElos;
}

async function test_simulate2024() {
  const teamElos = await simulate2024();

  const teamEloPrices = new Map();

  const entries = Array.from(teamElos.entries());
  entries.sort((a, b) => b[1] - a[1]);
  const sortedMap = new Map(entries);

  sortedMap.forEach((elo, team) => {
    const price = parseFloat(calculateEloToPrice(elo));
    teamEloPrices.set(team, price);
  });

  const combined = Array.from(sortedMap.keys()).map((key) => ({
    Team: key,
    Elo: sortedMap.get(key),
    Price: teamEloPrices.get(key),
  }));

  // Use console.table to print them side by side
  console.table(combined);
}

async function test_simulateDemand() {
  const demandPrices = new Map();

  for (let i = 0; i < 20; i++) {
    let demand = (i + 1) * 10;
    let price = parseFloat(calculateDemandToPrice(demand));
    demandPrices.set(demand, price);
  }

  const combined = Array.from(demandPrices.keys()).map((key) => ({
    Demand: key,
    Price: demandPrices.get(key),
  }));

  console.table(combined);
}

async function test_simulateSentiment() {
  const sentimentPrices = new Map();

  for (let i = 0; i < 10; i++) {
    let sentiment = i - 5;
    let price = parseFloat(calculateSentimentToPrice(sentiment));
    sentimentPrices.set(sentiment, price);
  }

  const combined = Array.from(sentimentPrices.keys()).map((key) => ({
    Sentiment: key,
    Price: sentimentPrices.get(key),
  }));

  console.table(combined);
}

// test_simulate2024();
// test_simulateDemand();
test_simulateSentiment();
// fetch2024MatchData();
