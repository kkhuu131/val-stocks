import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, Heading, IconButton, Button } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import UpcomingMatchesRow from "./UpcomingMatchesRow";
import { supabase } from "../supabase";

const UpcomingMatchesContainer = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters] = useState(["Live", "Upcoming", "Completed"]);
  const [filterIndex, setFilterIndex] = useState(0);
  const [filteredMatches, setFilteredMatches] = useState([]);

  const updateMatchesArray = (newMatch) => {
    setMatches((prevMatches) => {
      const matchIndex = prevMatches.findIndex(
        (match) => match.match_link === newMatch.match_link
      );

      if (matchIndex !== -1 ) {
        const updatedMatches = [...prevMatches];
        updatedMatches[matchIndex] = newMatch;
        return updatedMatches;
      } else {
        return [...prevMatches, newMatch];
      }
    });
  };

  const handleLeftClick = () => {
    let nextIndex = (filterIndex - 1 + filters.length) % filters.length;
    filterMatches(nextIndex);
    setFilterIndex(nextIndex);
  };

  const handleRightClick = () => {
    let nextIndex = (filterIndex + 1) % filters.length;
    filterMatches(nextIndex);
    setFilterIndex(nextIndex);
  };

  const filterMatches = (i) => {
    setFilteredMatches(matches.filter(match => match.status == filters[i].toLowerCase()).slice(0, 5));
  }

  useEffect(() => {
    const channel = supabase
      .channel("matches-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
        },
        (payload) => {
          const updatedMatch = payload.new;
          updateMatchesArray(updatedMatch);
          filterMatches(filterIndex);
        }
      )
      .subscribe();

    const fetchUpcomingMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*");

      if (error) {
        console.error("Error fetching matches:", error.message);
        return;
      }
      
      await setMatches(data);
      filterMatches(filterIndex);
      setLoading(false);
    };

    fetchUpcomingMatches();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if(loading) {
    return(
      <Box>
        <Flex justifyContent={"center"} my="auto" minH="50px">
          <Heading color="white">Matches</Heading>
        </Flex>
        <Box m={5} minH="100px" mx="auto" maxW={["80%", "60%", "40%"]} minW={["80%", "60%", "750px"]} backgroundColor="grayAlpha.900" borderRadius="lg">
          <Flex justifyContent="center" minHeight="100px" size="md">
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box m={5} mx="auto" maxW={["90%", "60%", "40%"]} minW={["90%", "60%", "500px"]}>
      <Flex justifyContent={"center"} m="2">
        <Heading color="white">{filters[filterIndex]} Matches</Heading>
      </Flex>
      <Grid gridTemplateColumns={"100px auto 100px"} alignItems="center" justifyContent="center">
        <Button
          onClick={handleLeftClick}
          maxWidth="100px"
          minHeight="35px"
          m={2}
          borderRadius="md"
          border="0px"
          backgroundColor="black"
          color="white"
          fontWeight={"bold"}
          _hover={{
            backgroundColor:"grayAlpha.600"
          }}
        >
          <ChevronLeftIcon/>
          <Text>{filters[(filterIndex - 1 + filters.length) % filters.length]}</Text>
        </Button>
        {filteredMatches.length === 0 ? (
          <Flex
            minHeight="120px"
            minWidth="500px"
            justifyContent="center"
            alignItems="center"
            m="2"
            color="gray.500"
            backgroundColor="grayAlpha.700"
            borderRadius="md"
          >
            <Text alignItems="center">No {filters[filterIndex].toLowerCase()} matches.</Text>
          </Flex>
        ) : (
          filteredMatches.map((item, index) => (
            <UpcomingMatchesRow match={item} key={index} />
          ))
        )}
        <Button
          onClick={handleRightClick}
          maxWidth="100px"
          minHeight="35px"
          m={2}
          borderRadius="md"
          border="0px"
          backgroundColor="black"
          color="white"
          fontWeight={"bold"}
          _hover={{
            backgroundColor:"grayAlpha.600"
          }}
        >
          <Text>{filters[(filterIndex + 1) % filters.length]}</Text>
          <ChevronRightIcon/>
        </Button>
      </Grid>
    </Box>
  );
};

export default UpcomingMatchesContainer;