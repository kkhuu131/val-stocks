import axios from "axios";

const instance = axios.create({
  baseURL: "https://vlrggapi.vercel.app",
});

export const fetchOngoingMatches = async () => {
  try {
    const response = await instance.get("/match/live_score");
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};

export const fetchUpcomingMatches = async () => {
  try {
    const response = await instance.get("/match/upcoming");
    return response.data;
  } catch (error) {
    console.error("Error fetching matches:", error);
    throw error;
  }
};
