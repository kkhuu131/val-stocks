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

async function saveTeamMappings() {
  try {
    const teams = await fetchTeams();

    const teamsArray = teams.data;

    const teamByIDMap = {};
    teamsArray.forEach((team) => {
      teamByIDMap[team.id] = team;
    });

    const teamByNameMap = {};
    teamsArray.forEach((team) => {
      teamByIDMap[team.name] = team;
    });

    const mappings = {
      teamByIDMap: teamByIDMap,
      teamByNameMap: teamByNameMap,
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
