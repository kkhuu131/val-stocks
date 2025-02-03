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
const filePath = "./UpdatedTeamMappings.json";

async function saveTeamMappings() {
  try {
    const teams = await fetchTeams();
    const teamsArray = teams.data;

    // Load existing data if the file exists
    let existingData = {
      teamByIDMap: {},
      teamByNameMap: {},
      teamBySymbolMap: {},
    };
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const { teamByIDMap, teamByNameMap, teamBySymbolMap } = existingData;

    for (const team of teamsArray) {
      const teamInfo = await fetchTeam(team.id);
      team["symbol"] = teamInfo.data.info.tag;

      const id = team.id;
      const symbol = team.symbol;
      const oldTeam = teamByIDMap[id] || teamBySymbolMap[symbol];

      if (oldTeam) {
        // Remove old name entry if the name changed
        if (oldTeam.name !== team.name) {
          delete teamByNameMap[oldTeam.name];
        }
      }

      // Update the maps
      teamByIDMap[id] = team;
      teamByNameMap[team.name] = team;
      teamBySymbolMap[symbol] = team;
    }

    // Save merged JSON
    const updatedMappings = { teamByIDMap, teamByNameMap, teamBySymbolMap };
    fs.writeFileSync(filePath, JSON.stringify(updatedMappings, null, 4));

    console.log("Mappings updated and saved to", filePath);
  } catch (error) {
    console.error("Error saving mappings:", error);
  }
}

saveTeamMappings();
