import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Text } from "@chakra-ui/react";

const UpcomingMatchesContainer = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/upcomingMatches`);
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching upcoming matches data:", error);
      }
    };

    fetchUpcomingMatches();
  });

  return (
    <Box m={1} mx="auto" maxW="50%" minW="500px">
      {matches.map((item, index) => {
        return <Text color="white" fontSize="32">{item && item.team1_name} vs. {item && item.team2_name}</Text>;
      })}
    </Box>
  );
};

export default UpcomingMatchesContainer;