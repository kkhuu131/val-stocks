import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, Heading, Spinner } from "@chakra-ui/react";
import UpcomingMatchesRow from "./UpcomingMatchesRow";
import { supabase } from "../supabase";

const UpcomingMatchesContainer = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
          console.log("Change received!", payload);
          const updatedMatches = payload.new;
          setMatches(updatedMatches);
        }
      )
      .subscribe();

    const fetchUpcomingMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .neq("status", "completed");

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return;
      }
      setMatches(data);
      setLoading(false);
    };

    fetchUpcomingMatches();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  if(loading) {
    return(
      <Box m={5} mx="auto" maxW={["80%", "60%", "40%"]} minW={["80%", "60%", "750px"]}>
        <Flex justifyContent={"center"} my="auto" minH="100px">
          <Heading color="white">Upcoming Matches</Heading>
        </Flex>
        <Flex justifyContent="center" minHeight="100px" size="md">
          <Spinner color="white"/>
        </Flex>
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