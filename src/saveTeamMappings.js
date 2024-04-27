const fs = require("fs");
const axios = require("axios");

const instance = axios.create({
  baseURL: "https://vlr.orlandomm.net/api/v1",
});

const fetchTeams = async (page = 1, limit = "all", region = "all") => {
  try {
    const response = await instance.get("/teams", {
      params: { page: page, limit: limit, region: region },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

// teamid: ID of the team to be consulted
const fetchTeam = async (teamid) => {
  try {
    const response = await instance.get("/teams/" + teamid);
    return response.data;
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};

// "2":{"id":"2","url":"https://www.vlr.gg/team/2/sentinels","name":"Sentinels","img":"https://owcdn.net/img/62875027c8e06.png","country":"United States","symbol":"SEN"}

async function saveTeamMappings() {
  try {
    const teams = await fetchTeams();

    const teamsArray = teams.data;

    const teamByIDMap = {};
    const teamByNameMap = {};
    const teamBySymbolMap = {};

    for (const team of teamsArray) {
      const teamInfo = await fetchTeam(team.id);
      team["symbol"] = teamInfo.data.info.tag;
      console.log(team);

      teamByIDMap[team.id] = team;
      teamByNameMap[team.name] = team;
      teamBySymbolMap[team.symbol] = team;
    }

    const mappings = {
      teamByIDMap: teamByIDMap,
      teamByNameMap: teamByNameMap,
      teamBySymbolMap: teamBySymbolMap,
    };

    // Serialize mappings to JSON
    const jsonMappings = JSON.stringify(mappings);

    // Write JSON string to a file
    const filePath = "./teamMappings.json";
    fs.writeFileSync(filePath, jsonMappings);

    console.log("Mappings saved to", filePath);
  } catch (error) {
    console.error("Error saving mappings:", error);
  }
}

saveTeamMappings();
