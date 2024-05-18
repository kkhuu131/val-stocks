// BuyForm.js (React component)
import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { Box, Heading, Text, Grid, Flex, Image } from "@chakra-ui/react";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import RealTimeUserProfile from "./RealTimeUserProfile";
import { supabase } from '../supabase';

const BuySellPanel = ({ symbol, currStockData }) => {
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

  if (!userData || !userProfile) {
    return(
        <Box>
            <Text m={1} fontSize={20} fontWeight="bold" color="white">Log in to buy and sell stocks!</Text>
        </Box>
    );
  }

  return (
    <Grid templateRows="50px 25px 25px 30px 120px 120px">
        <Flex alignItems="center" justifyContent={"center"} mt={5}>
            <Image
                src={teamData["teamBySymbolMap"][symbol].img}
                alt={"{symbol} Logo"}
                width="35px"
                height="35px"
                m={1}
            />
            <Text m={1} fontSize={20} fontWeight="bold" color="white">
                {teamData["teamBySymbolMap"][symbol].name}
            </Text>
            <Text m={1} fontSize={16} color={"grayAlpha.50"}>
                {symbol}
            </Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <Text mt={5} fontSize={16} fontWeight="bold" color="white">Balance: ${userProfile.balance || 0}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <Text mt={5} fontSize={16} fontWeight="bold" color="white">Networth: ${userProfile.networth || 0}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <Text mt={3} fontSize={12} color={"grayAlpha.50"}>Owned: {userProfile.stocks[symbol] || 0}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <BuyForm symbol={symbol} stockPrice={currStockData.price} userBalance={userProfile.balance}/>
        </Flex>
        <Flex alignItems="center" justifyContent={"center"}>
            <SellForm symbol={symbol} userStocks={userProfile.stocks}/>
        </Flex>
    </Grid>
  );
};

export default BuySellPanel;