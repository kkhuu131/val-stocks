import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import valorantLogo from "../ValorantLogo.png"
import { Box, Flex, Grid, Text, Image, useMediaQuery } from "@chakra-ui/react";

const UpcomingMatchesRow = ({match}) => {
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
    const [eta, setEta] = useState("");

    useEffect(() => {
      const calculateETA = () => {
        const now = new Date().getTime();
        const matchDate = new Date(match.match_date).getTime();
        
        if(matchDate <= now || match.status === 'live') {

          return 'Live';
        }
        else {
          const diff = matchDate - now;

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          return (days && days + "d ") + hours + "h " + (days ? "" : minutes + "m");
        }
      };

      const updateETA = () => {
        setEta(calculateETA);
      };

      updateETA();

      const intervalId = setInterval(updateETA, 60000);

      return () => clearInterval(intervalId);
    });


    if(!isLargerThan768) {
      return (
        <Flex m={2} pt={2} pb={2} backgroundColor="grayAlpha.700" alignItems="center" justifyContent="center" borderRadius="md" >
          <Grid gridTemplateRows="45px 30px 30px">
            <Flex alignItems="center" justifyContent="center">
                <Image
                  src={match.match_event_img}
                  alt={`${match.match_event}`}
                  width="25"
                  height="25"
                  objectFit="cover"
                  m="1"
                />
                <Text color="white" fontSize="12" m="1">{match.match_series}</Text>
                {(match.status === "live") ? <Text color="red.500" fontSize="12" m={2}>Live</Text> : <Text color="green.500" fontSize="12" m={2}>{eta}</Text>}
            </Flex>
            <Grid templateColumns="50% 50%">
              <Flex>
                <Image
                  src={teamData["teamByNameMap"][match.team1_name] ? teamData["teamByNameMap"][match.team1_name].img : valorantLogo}
                  alt={`Team logo for ${match.team1_name}`}
                  width="25"
                  height="25"
                  objectFit="cover"
                  m="1"
                />
                <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team1_name}</Text>
              </Flex>
              <Flex>
                <Image
                  src={teamData["teamByNameMap"][match.team2_name] ? teamData["teamByNameMap"][match.team2_name].img : valorantLogo}
                  alt={`Team logo for ${match.team2_name}`}
                  width="25"
                  height="25"
                  objectFit="cover"
                  m="1"
                />
                <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team2_name}</Text>
              </Flex>
            </Grid>
            <Flex alignItems="center" justifyContent="center">
              {match.status==="live" ? <Text color="grayAlpha.500" fontSize="20" m="1">{match.team1_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
              <Text color="white" fontSize="20" m="1">:</Text>
              {match.status==="live" ? <Text color="grayAlpha.500" fontSize="20" m="1">{match.team2_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
            </Flex>
          </Grid>
        </Flex>
      );
    }

    return (
        <Flex m={2} p={3} backgroundColor="grayAlpha.700" alignItems="center" justifyContent="center" borderRadius="md">
          <Grid gridTemplateColumns="200px 50px 100px">
            {/* <Flex alignItems="center" justifyContent="center">
              <Image
                src={match.match_event_img}
                alt={`Team logo for ${match.team1_name}`}
                width="30"
                height="30"
                minWidth="30"
                minHeight="30"
                m="1"
              />
            </Flex> */}
            {/* <Flex alignItems="center" justifyContent="left">
              <Grid>
                <Flex alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="12" m="1" fontWeight="bold">{match.match_event}</Text>
                </Flex>
                <Flex alignItems="center" justifyContent="center">
                  <Text color="white" fontSize="12" m="1">{match.match_series}</Text>
                </Flex>
              </Grid>
            </Flex> */}
            <Flex alignItems="center" justifyContent="left">
              <Grid gridTemplateRows="50%">
                <Flex alignItems="center">
                    <Image
                      src={teamData["teamByNameMap"][match.team1_name] ? teamData["teamByNameMap"][match.team1_name].img : valorantLogo}
                      alt={`Team logo for ${match.team1_name}`}
                      width="30"
                      height="30"
                      minwidth="30"
                      minHeight="30"
                    />
                  <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team1_name}</Text>
                </Flex>
                <Flex alignItems="center">
                  <Image
                    src={teamData["teamByNameMap"][match.team2_name] ? teamData["teamByNameMap"][match.team2_name].img : valorantLogo}
                    alt={`Team logo for ${match.team2_name}`}
                    width="30"
                    height="30"
                    minwidth="30"
                    minHeight="30"
                  />
                  <Text color="white" fontSize="14" m="1" fontWeight="bold">{match.team2_name}</Text>
                </Flex>
                
              </Grid>
            </Flex>
            <Flex alignItems="center" justifyContent="center">
              {(match.status === "live") ? <Text color="white" fontSize="16" m="1">{match.team1_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
              <Text color="white" fontSize="20" m="1">:</Text>
              {(match.status === "live") ? <Text color="white" fontSize="16" m="1">{match.team2_score}</Text> : <Text color="grayAlpha.500" fontSize="20" m="1">-</Text>}
            </Flex>
            <Flex alignItems="center" justifyContent="center">
              {(match.status === "live") ? <Text color="red.500" fontSize="16">Live</Text> : <Text color="green.500" fontSize="16">{eta}</Text>}
            </Flex>
          </Grid>
        </Flex>
      );
};

export default UpcomingMatchesRow;