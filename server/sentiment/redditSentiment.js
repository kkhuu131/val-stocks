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

const teamKeywords = {
  "100T": [
    "100T",
    "100 Thieves",
    "Boostio",
    "zander",
    "cryocells",
    "cryo",
    "eeiu",
    "asuna",
  ],
  C9: ["C9", "Cloud9", "cloud 9", "rossy", "xeppaa", "v1c", "moose", "oxy"],
  EG: ["EG", "Evil Geniuses", "nature", "derrek", "supamen", "potter", "yay"],
  FUR: ["FUR", "FURIA", "nzr", "kon4n", "xand", "mwzera", "havoc", "khalil"],
  KRÜ: ["KRÜ", "KRU", "klaus", "shyy", "keznit", "melser", "heat"],
  LEV: [
    "LEV",
    "Leviatán",
    "Leviatan",
    "kingg",
    "tex",
    "mazino",
    "aspas",
    "c0m",
  ],
  LOUD: ["LOUD", "saadhak", "less", "tuyz", "cauanzin", "qck"],
  MIBR: ["MIBR", "jzz", "mazin", "artzin", "rglMeister", "frz"],
  NRG: [
    "NRG",
    "FNS",
    "finesse",
    "s0m",
    "som",
    "verno",
    "ethan",
    "bonkar",
    "mada",
  ],
  SEN: [
    "SEN",
    "Sentinels",
    "johnqt",
    "narrate",
    "n4rrate",
    "zellsis",
    "zekken",
    "bang",
    "kaplan",
  ],
  G2: ["G2", "valyn", "icy", "trent", "jonahp", "leaf"],
  AG: ["AG", "All Gamers", "bunt", "monk", "deLb", "spitfires", "sword9"],
  BLG: ["BLG", "Bilibili", "b3ar", "whzy", "levius", "nephh", "knight"],
  EDG: [
    "EDG",
    "EDward Gaming",
    "haodong",
    "zmjjKK",
    "nobody",
    "chichoo",
    "smoggy",
  ],
  FPX: [
    "FPX",
    "FunPlus Phoenix",
    "berlin",
    "autumn",
    "life",
    "aaaay",
    "lysoar",
  ],
  JDG: ["JDG", "JD Gaming", "yhchen", "stew", "viva", "jkuro", "marT1n"],
  NOVA: ["NOVA", "guang", "o0o0o", "OBONE", "swerl", "cb"],
  TEC: ["TEC", "Titan Esports Club", "AC", "Rb", "kawaii", "abo", "lockm"],
  TE: ["TE", "Trace Esports", "fengf", "heybay", "kai", "luok1ng"],
  TYL: ["TYL", "TYLOO", "aak", "flex1n", "eren", "hfmi0dzjc9z7", "ICEKING"],
  WOL: [
    "WOL",
    "Wolves Esports",
    "yuicaw",
    "coldfish",
    "aluba",
    "pl1xx",
    "spring",
  ],
  DRG: [
    "DRG",
    "Dragon Ranger Gaming",
    "shion7",
    "vo0kashu",
    "tvirusluke",
    "nicc",
    "nizhaotzh",
  ],
  BBL: ["BBL", "elite", "pAura", "brave", "reazy", "qutionerX"],
  FNC: ["FNC", "FNATIC", "boaster", "leo", "derke", "chronicle", "alfajer"],
  FUT: ["FUT", "Mrfalin", "yetujey", "atakaptan", "cNed", "qRaxs"],
  KC: ["KC", "Karmine Corp", "magnum", "tomaszy", "N4rrate", "marteen", "sh1n"],
  KOI: ["KOI", "starxo", "kamo", "shadow", "grubinho", "sheydos"],
  NAVI: [
    "NAVI",
    "Natus Vincere",
    "ange1",
    "shao",
    "zyppan",
    "suygetsu",
    "ardiis",
  ],
  TH: ["TH", "Team Heretics", "boo", "miniboo", "wo0t", "riens", "benjyfishy"],
  TL: ["TL", "Team Liquid", "enzo", "jamppi", "nats", "mistic", "keiko"],
  VIT: ["VIT", "Team Vitality", "cender", "trexx", "kicks", "runner", "sayf"],
  M8: ["M8", "Gentle Mates", "beyaz", "takas", "kadavra", "natank", "wailers"],
  GX: ["GX", "GIANTX", "redgar", "purp0", "fit1nho", "hoody"],
  DFM: [
    "DFM",
    "DetonatioN FocusMe",
    "medusa",
    "neth",
    "meiy",
    "ssees",
    "anthem",
  ],
  DRX: ["DRX", "flashback", "buzz", "mako", "foxy9", "beyn"],
  GEN: [
    "GEN",
    "GenG",
    "Gen.G",
    "gen g",
    "munchkin",
    "t3xture",
    "meteor",
    "lakia",
    "karon",
  ],
  GE: [
    "GE",
    "Global Esports",
    "russ",
    "blazek1ng",
    "lightningfast",
    "polvi",
    "benkai",
  ],
  PRX: [
    "PRX",
    "Paper Rex",
    "mindfreak",
    "jinggg",
    "f0rsaken",
    "d4v41",
    "something",
  ],
  RRQ: [
    "RRQ",
    "Rex Regum Qeon",
    "xffero",
    "monyet",
    "lmerore",
    "jemkin",
    "estrella",
  ],
  T1: ["T1", "carpe", "stax", "sayaplayer", "rossy", "iZu", "xccurate"],
  TS: ["TS", "Team Secret", "jessievash", "invy", "wildOreoo", "2ge", "jremy"],
  ZETA: ["ZETA", "laz", "yuran", "hiroronn", "dep", "sugarz3ro"],
  BLD: ["BLD", "BLEED", "crazyguy", "sscary", "zest", "retla", "deryeon"],
  TLN: ["TLN", "Talon", "primmie"],
};

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

  const allSentiments = Object.keys(teamKeywords).reduce((acc, team) => {
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
