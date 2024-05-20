import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image } from "@chakra-ui/react";

const UpcomingMatchesRow = ({match}) => {
    return (
        <Flex m={2} pt={2} pb={2} backgroundColor="grayAlpha.700" alignItems="center" justifyContent="center" borderRadius="md" >
          <Grid gridTemplateColumns="400px 100px">
            <Flex alignItems="center" justifyContent="left">
              <Grid gridTemplateRow="50% 50%">
                <Flex alignItems="center">
                  <Image
                    src={teamData["teamByNameMap"][match.team1_name].img}
                    alt={`Team logo for ${match.team1_name}`}
                    width="50"
                    height="50"
                    objectFit="cover"
                    m="1"
                  />
                  <Text color="white" fontSize="24" m="1">{match.team1_name}</Text>
                </Flex>
                <Flex alignItems="center">
                  <Image
                    src={teamData["teamByNameMap"][match.team2_name].img}
                    alt={`Team logo for ${match.team2_name}`}
                    width="50"
                    height="50"
                    objectFit="cover"
                    m="1"
                  />
                  <Text color="white" fontSize="24" m="1">{match.team2_name}</Text>
                </Flex>
                
              </Grid>
            </Flex>
            <Flex alignItems="center" justifyContent="left">
              <Text color="green.400" fontSize="24">{match.eta}</Text>
            </Flex>
          </Grid>
        </Flex>
      );
};

export default UpcomingMatchesRow;