// BuyForm.js (React component)
import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { Box, Heading, Text, Grid, Flex, Image, Spinner } from "@chakra-ui/react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import RealTimeUserProfile from "./RealTimeUserProfile";
import { supabase } from '../supabase';

const BuySellPanel = ({ symbol, currStockData }) => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchUserData = async () => {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          setUserData(user);
          setUserId(user.id);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user metadata:', error.message);
          setLoading(false);
        }
      };

      fetchUserData();
  }, []);

  const userProfile = RealTimeUserProfile(userId);

  if(loading) {
    return(
        <Flex alignItems="center" justifyContent={"center"} minHeight="300px">
            <Spinner color="white"/>
        </Flex>
    );
  }

  if (!userData || !userProfile) {
    return(
        <Box minHeight="300px">
          <Grid templateRows="80px 100px 120px">
            <Flex></Flex>
            <Flex justifyContent="center" alignItems={"center"} mt="">
              <Text fontSize={20} fontWeight="bold" color="white">Login to trade stocks</Text>
            </Flex>
            <Flex></Flex>
          </Grid>
        </Box>
    );
  }

  return (
    <Box>
      <Box
        alignItems="center"
        justifyContent="center"
        backgroundColor="grayAlpha.800"
        borderRadius="lg"
        m={5}
        mt="0"
        p="2"
        w={["200px", "200px", "250px", "300px"]}
      >
        <Flex alignItems="center" justifyContent={"center"}>
          <Text fontSize={24} fontWeight="bold" color="white">Networth: ${userProfile.networth ? userProfile.networth.toFixed(2) : '0.00'}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
          <Text fontSize={24} fontWeight="bold" color="white">Balance: ${userProfile.balance ? userProfile.balance.toFixed(2) : '0.00'}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"} m="2">
          <Text fontSize={16} color={"grayAlpha.50"}>Shares Owned: {userProfile.stocks[symbol] || '0'}</Text>
        </Flex>
      </Box>
      <Box
        alignItems="center"
        justifyContent="center"
        backgroundColor="grayAlpha.800"
        borderRadius="lg"
        m={5}
        my="auto"
        w={["200px", "200px", "250px", "300px"]}
      >
        <Grid templateRows="auto" py="5">
            <Flex alignItems="center" justifyContent={"center"}>
            </Flex>
            <Flex alignItems="center" justifyContent={"center"} m="2">
                <BuyForm symbol={symbol} stockPrice={currStockData.price} locked={currStockData.locked} userBalance={userProfile.balance}/>
            </Flex>
            <Flex alignItems="center" justifyContent={"center"} m="2">
                <SellForm symbol={symbol} stockPrice={currStockData.price} locked={currStockData.locked} userStocks={userProfile.stocks}/>
            </Flex>
        </Grid>
      </Box>

    </Box>
  );
};

export default BuySellPanel;