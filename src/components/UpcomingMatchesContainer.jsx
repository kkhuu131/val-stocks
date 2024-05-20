import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, Heading } from "@chakra-ui/react";
import UpcomingMatchesRow from "./UpcomingMatchesRow";

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

  if(matches.length == 0) {
    return;
  }

  return (
    <Box m={5} mx="auto" maxW="40%" minW="600px">
      <Flex justifyContent={"center"}>
        <Heading color="white">Upcoming Matches</Heading>
      </Flex>
      {matches.map((item, index) => {
        if(!item) {
          return;
        }

        return (
          <UpcomingMatchesRow match={item}/>
        );
      })}
    </Box>
  );
};

export default UpcomingMatchesContainer;