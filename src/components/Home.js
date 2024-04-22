import React, { useState, useEffect } from "react";
import { fetchMatches, fetchEvents, fetchTeams } from "../api";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVLRMatches = async () => {
      try {
        const data = await fetchMatches();
        setMatches(data.data); // Extracting the 'data' array from the response
        setIsLoading(false);
      } catch (error) {
        setError(error);
        setIsLoading(false);
      }
    };

    fetchVLRMatches();
  }, []);

  return (
    <div>
      <h2>Home</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <div>
          <h3>Matches:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {matches.map((match) => (
              <li
                key={match.id}
                style={{
                  marginBottom: "20px",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={match.img}
                    alt={match.event}
                    style={{
                      marginRight: "20px",
                      width: "100px",
                      height: "100px",
                    }}
                  />
                  <div>
                    <h4>{match.event}</h4>
                    <p>Status: {match.status}</p>
                    <p>Tournament: {match.tournament}</p>
                    <p>
                      Teams: {match.teams.map((team) => team.name).join(" vs ")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
