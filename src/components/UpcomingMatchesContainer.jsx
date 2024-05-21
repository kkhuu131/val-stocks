import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, Heading, Spinner } from "@chakra-ui/react";
import UpcomingMatchesRow from "./UpcomingMatchesRow";

const UpcomingMatchesContainer = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/upcomingMatches`);
        setMatches(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching upcoming matches data:", error);
      }
    };

    fetchUpcomingMatches();
  });

  if(loading) {
    return(
      <Box m={5} mx="auto" maxW="40%" minW="750px">
        <Flex justifyContent={"center"} my="auto" minH="100px">
          <Heading color="white">Upcoming Matches</Heading>
        </Flex>
        <Flex justifyContent="center" minHeight="100px" size="md">
          <Spinner color="white"/>
        </Flex>
      </Box>
    );
  }

  if(matches.length == 0) {
    return;
  }

  return (
    <Box m={5} mx="auto" maxW="40%" minW="750px">
      <Flex justifyContent={"center"}>
        <Heading color="white">Upcoming Matches</Heading>
      </Flex>
      {matches.map((item, index) => {
        if(!item) {
          return;
        }

        return (
          <UpcomingMatchesRow match={item} key={index}/>
        );
      })}
    </Box>
  );
};

export default UpcomingMatchesContainer;