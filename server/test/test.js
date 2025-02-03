const teams = require("../teams.json");
const teamData = require("../../src/teamMappings.json");
const matches2024Data = require("./matches2024Data.json");
const matches2025Data = require("./matches2025Data.json");
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
  const matchData = await getMatchData("https://www.vlr.gg/430857");
  console.log(matchData);
}

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

const events2025 = [
  "https://www.vlr.gg/event/matches/2276/champions-tour-2025-emea-kickoff/?group=completed&series_id=all",
  "https://www.vlr.gg/event/matches/2274/champions-tour-2025-americas-kickoff/?group=completed&series_id=all",
  "https://www.vlr.gg/event/matches/2277/champions-tour-2025-pacific-kickoff/?group=completed&series_id=all",
  "https://www.vlr.gg/event/matches/2275/champions-tour-2025-china-kickoff/?group=completed&series_id=all",
];

async function fetchData(events, filePath) {
  let matchLinks = [];

  for (const event of events) {
    matchLinks = matchLinks.concat(await getMatchLinksFromEvent(event));
  }

  console.log("match links:", matchLinks);

  const allMatchData = [];

  for (const match of matchLinks) {
    const matchData = await getMatchData(match);
    allMatchData.push(matchData);
  }

  await allMatchData.sort(
    (a, b) => new Date(a.match_date) - new Date(b.match_date)
  );

  console.log("matches data", allMatchData);

  try {
    const jsonMappings = JSON.stringify(allMatchData);
    fs.writeFileSync(filePath, jsonMappings);

    console.log("Mappings saved to", filePath);
  } catch (error) {
    console.error("Error saving mappings:", error);
  }
}

const baseElo = 1000;

async function simulate(data) {
  const teamElos = new Map();
  for (const team of teams) {
    teamElos.set(team, baseElo);
  }

  for (const matchData of data) {
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
        teamElos.set(team2, 1000);
      }

      Rb = teamElos.get(team2);
    }

    let [newRa, newRb] = await calculateElo(matchData, Ra, Rb);

    // const teamsToTrack = ["EDG", "NRG", "LEV"];

    // if (teamsToTrack.includes(team1)) {
    //   console.log(
    //     team1,
    //     "against",
    //     team2,
    //     Ra,
    //     "-->",
    //     newRa,
    //     matchData.match_link
    //   );
    // }

    // if (teamsToTrack.includes(team2)) {
    //   console.log(
    //     team2,
    //     "against",
    //     team1,
    //     Rb,
    //     "-->",
    //     newRb,
    //     matchData.match_link
    //   );
    // }

    if (teams.includes(team1)) {
      teamElos.set(team1, newRa);
    }

    if (teams.includes(team2)) {
      teamElos.set(team2, newRb);
    }
  }

  return teamElos;
}

async function test_simulate(data) {
  const teamElos = await simulate(data);

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
  }));

  console.table(combined);
}

async function test_simulateDemand() {
  const demandPrices = new Map();

  let demands = [0, 10, 50, 100, 200, 300, 500, 1000, 2000, 5000, 10000];

  for (let i = 0; i < demands.length; i++) {
    let demand = demands[i];
    let price = parseFloat(calculateDemandToPrice(demand));
    demandPrices.set(demand, price);
  }

  const combined = Array.from(demandPrices.keys()).map((key) => ({
    Demand: key,
    Price: (demandPrices.get(key) * 0.005).toFixed(2),
  }));

  console.table(combined);
}

async function test_simulateSentiment() {
  const testValues = [-200, -150, -100, -10, -5, 0, 5, 10, 50, 100, 150, 200];
  const sentimentPrices = new Map();

  for (const sentiment of testValues) {
    let price = parseFloat(calculateSentimentToPrice(sentiment));
    sentimentPrices.set(sentiment, price);
  }

  const combined = Array.from(sentimentPrices.keys()).map((key) => ({
    Sentiment: key,
    Price: sentimentPrices.get(key),
  }));

  console.table(combined);
}

const testToRun = process.argv[2];
const yearToRunForSimulation = process.argv[3];

switch (testToRun) {
  case "simulate_elo":
    switch (yearToRunForSimulation) {
      case "2024":
        test_simulate(matches2024Data);
      case "2025":
        test_simulate(matches2025Data);
      default:
        console.log("Enter a valid year: 2024, 2025");
    }
    break;
  case "simple_demand":
    test_simulateDemand();
    break;
  case "simple_sentiment":
    test_simulateSentiment();
    break;
  case "fetch_data_2025":
    fetchData(events2025, ".server/test/matches2025Data.json");
  default:
    console.log(
      "Enter a valid test name: simulate_elo, simple_demand, simple_sentiment"
    );
}
