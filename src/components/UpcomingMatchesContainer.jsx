import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, Heading, Spinner } from "@chakra-ui/react";
import UpcomingMatchesRow from "./UpcomingMatchesRow";
import { supabase } from "../supabase";

const UpcomingMatchesContainer = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const channel = supabase
      .channel("matches-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `status=neq.completed`,
        },
        (payload) => {
          const updatedMatch = payload.new;
          updateMatchesArray(updatedMatch);
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

      const filteredMatches = data.filter(match => match.status == "live" || match.status == "upcoming");

      setMatches(filteredMatches);
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
          <Heading color="white">Upcoming Matches</Heading>
        </Flex>
        <Box m={5} minH="100px" mx="auto" maxW={["80%", "60%", "40%"]} minW={["80%", "60%", "750px"]} backgroundColor="grayAlpha.900" borderRadius="lg">
          <Flex justifyContent="center" minHeight="100px" size="md">
          </Flex>
        </Box>
      </Box>
    );
  }

  if(matches.length === 0) {
    return;
  }

  return (
    <Box m={5} mx="auto" maxW={["90%", "60%", "40%"]} minW={["90%", "60%", "750px"]}>
      <Flex justifyContent={"center"}>
        <Heading color="white">Upcoming Matches</Heading>
      </Flex>
      {matches.map((item, index) => {
        return (
          <UpcomingMatchesRow match={item} key={index}/>
        );
      })}
    </Box>
  );
};

export default UpcomingMatchesContainer;