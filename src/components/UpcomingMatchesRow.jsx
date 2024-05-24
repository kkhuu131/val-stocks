import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import { Box, Flex, Grid, Text, Image, useMediaQuery } from "@chakra-ui/react";

const UpcomingMatchesRow = ({match}) => {
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

    if(!isLargerThan768) {
      return (
        <Flex m={2} pt={2} pb={2} backgroundColor="grayAlpha.700" alignItems="center" justifyContent="center" borderRadius="md" >
          <Grid gridTemplateRows="45px 30px 30px">
            <Flex alignItems="center" justifyContent="center">
                <Image
                  src={match.match_event_img}
                  alt={`Team logo for ${match.team1_name}`}
                  width="25"
                  height="25"
                  objectFit="cover"
                  m="1"
                />
                <Text color="white" fontSize="12" m="1">{match.match_series}</Text>
                {(match.eta && match.eta === "live") ? <Text color="red.500" fontSize="12">Live</Text> : <Text color="green.500" fontSize="12">{match.eta}</Text>}
            </Flex>
            <Flex alignItems="center">
              <Image
                src={teamData["teamByNameMap"][match.team1_name].img}
                alt={`Team logo for ${match.team1_name}`}
                width="25"
                height="25"
                objectFit="cover"
                m="1"
              />
              <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team1_name}</Text>
              <Image
                src={teamData["teamByNameMap"][match.team2_name].img}
                alt={`Team logo for ${match.team2_name}`}
                width="25"
                height="25"
                objectFit="cover"
                m="1"
              />
              <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team2_name}</Text>
            </Flex>
            <Flex alignItems="center" justifyContent="center">
              {match.status==="live" ? <Text color="grayAlpha.500" fontSize="20" m="1">match.team1_score</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
              <Text color="white" fontSize="20" m="1">:</Text>
              {match.status==="live" ? <Text color="grayAlpha.500" fontSize="20" m="1">match.team2_score</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
            </Flex>
          </Grid>
        </Flex>
      );
    }

    return (
        <Flex m={2} pt={2} pb={2} backgroundColor="grayAlpha.700" alignItems="center" justifyContent="center" borderRadius="md" >
          <Grid gridTemplateColumns="75px 275px 175px 100px 75px">
                <Flex alignItems="center" justifyContent="left">
                  <Image
                    src={match.match_event_img}
                    alt={`Team logo for ${match.team1_name}`}
                    width="50"
                    height="50"
                    objectFit="cover"
                    m="1"
                  />
                </Flex>
            <Flex alignItems="center" justifyContent="left">
              <Grid gridTemplateRows="50% 25% 25%" justifyContent="left">
                <Flex alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="12" m="1" fontWeight="bold">{match.match_event}</Text>
                </Flex>
                <Flex alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="12" m="1">{match.match_series}</Text>
                </Flex>
              </Grid>
            </Flex>
            <Flex alignItems="center" justifyContent="left">
              <Grid gridTemplateRows="50px 50px">
                <Flex alignItems="center">
                  <Image
                    src={teamData["teamByNameMap"][match.team1_name].img}
                    alt={`Team logo for ${match.team1_name}`}
                    width="45"
                    height="45"
                    objectFit="cover"
                    m="1"
                  />
                  <Text color="white" fontSize="20" m="1" fontWeight="bold">{match.team1_name}</Text>
                </Flex>
                <Flex alignItems="center">
                  <Image
                    src={teamData["teamByNameMap"][match.team2_name].img}
                    alt={`Team logo for ${match.team2_name}`}
                    width="45"
                    height="45"
                    objectFit="cover"
                    m="1"
                  />
                  <Text color="white" fontSize="20" m="1" fontWeight="bold">{match.team2_name}</Text>
                </Flex>
                
              </Grid>
            </Flex>
            <Flex alignItems="center" justifyContent="center">
              {(match.status === "live") ? <Text color="white" fontSize="20" m="1">{match.team1_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
              <Text color="white" fontSize="20" m="1">:</Text>
              {(match.status === "live") ? <Text color="white" fontSize="20" m="1">{match.team2_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
            </Flex>
            <Flex alignItems="center" justifyContent="right">
              {(match.status === "live") ? <Text color="red.500" fontSize="20">Live</Text> : <Text color="green.500" fontSize="20">{match.match_date}</Text>}
            </Flex>
          </Grid>
        </Flex>
      );
};

export default UpcomingMatchesRow;