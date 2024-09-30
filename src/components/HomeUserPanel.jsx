import React, { useState, useEffect } from "react";
import { Grid, Flex, Text, Box, CSSReset } from "@chakra-ui/react";
import RealTimeUserProfile from "./RealTimeUserProfile";
import { supabase } from '../supabase';

export default function HomeUserPanel() {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUserData(user);
        setUserId(user.id);
      } catch (error) {
        console.error('Error fetching user metadata:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const userProfile = RealTimeUserProfile(userId);

  if(!userData || !userProfile) {
    return(
        <Flex>
        </Flex>
    );
  }

  return (
    <Grid 
      gridTemplateRows={"auto auto"}
      w="600px"
      m={5}
      mt="0"
      px="8"
      py="4"
    >
        <Box w="400px" justifyContent="center" mx="auto">
          <Grid
            gridTemplateColumns="auto auto"
            color="white"
            fontSize={[18, 24, 28]}
            fontWeight={"bold"}
          >
            <Flex justifyContent="left"><Text>Net Worth:</Text></Flex>
            <Flex justifyContent="right">
              <Text>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                }).format(userProfile.networth)}
              </Text>
            </Flex>
          </Grid>
          <Grid
            gridTemplateColumns="auto auto"
            color="white"
            fontSize={[18, 24, 28]}
            fontWeight={"bold"}
          >
            <Flex justifyContent="left"><Text>Balance:</Text></Flex>
            <Flex justifyContent="right">
              <Text color="white" fontSize={[18, 24, 28]}fontWeight={"bold"}> 
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                }).format(userProfile.balance)}
              </Text>
            </Flex>
          </Grid>
        </Box>
        <Flex mt="4">
          <Text color="white" fontSize={[18]}>
            Click on any of the stocks below to navigate to their page and start investing! A team's stock closes when their match starts and reopen within a day of the match's completion.
          </Text>
        </Flex>
    </Grid>
  );
}