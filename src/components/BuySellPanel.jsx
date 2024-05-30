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
        </Box>
    );
  }

  return (
    <Grid templateRows="auto" py="5">
        <Flex alignItems="center" justifyContent={"center"}>
            <Text fontSize={24} fontWeight="bold" color="white">Networth: ${userProfile.networth ? userProfile.networth.toFixed(2) : '0.00'}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <Text fontSize={20} fontWeight="bold" color="white">Balance: ${userProfile.balance ? userProfile.balance.toFixed(2) : '0.00'}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"} m="2">
            <Text fontSize={12} color={"grayAlpha.50"}>{symbol} Owned: {userProfile.stocks[symbol] || '0'}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"} m="2">
            <BuyForm symbol={symbol} stockPrice={currStockData.price} userBalance={userProfile.balance}/>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"} m="2">
            <SellForm symbol={symbol} userStocks={userProfile.stocks}/>
        </Flex>
    </Grid>
  );
};

export default BuySellPanel;