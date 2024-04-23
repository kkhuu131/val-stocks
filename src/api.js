const axios = require("axios");

const instance = axios.create({
  baseURL: "https://vlr.orlandomm.net/api/v1",
});

export const fetchMatches = async () => {
  try {
    const response = await instance.get("/matches");
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

// page: Current page numbers
// status: Filter events by their status, ongoing upcoming completed. You can also use all to not use this filter
// region: Specific region. na eu br ap kr ch jp lan las oce mn gc or use all
export const fetchEvents = async (page = 1, status = "all", region = "all") => {
  try {
    const response = await instance.get("/events", {
      params: { page: page, status: status, region: region },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// page: Current page number.
// limit: Limit of results per page. You can also use all to get all teams.
// region: Specific region. na eu br ap kr ch jp lan las oce mn gc or use all to get a summary of the teams from each region.
export const fetchTeams = async (page = 1, limit = "all", region = "all") => {
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
export const fetchTeam = async (teamid) => {
  try {
    const response = await instance.get("/teams/" + teamid);
    return response.data;
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};

export default instance;
