import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { Box, Heading, Text, Grid, Flex, Image } from "@chakra-ui/react";
import UserStocks from "./UserStocks";
import { supabase } from '../supabase';

const CareerContainer = () => {
    const [userData, setUserData] = useState(null);
    const [userStockData, setUserStockData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              setUserData(user);
              fetchUserStockData(user.id);
            }
          } catch (error) {
            console.error('Error fetching user metadata:', error.message);
          }
        };

        const fetchUserStockData = async (userId) => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (error) {
              throw error;
            }

            setUserStockData(data);
          } catch (error) {
            console.error('Error fetching user info:', error.message);
          }
        };
  
        fetchUserData();
        console.log(userStockData);
    }, []);
  
    if (!userData || !userStockData) {
        return(
            <Box Box mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
                <Text color="white" fontSize={32}>
                    User not logged in!
                </Text>
            </Box>
        );
    } 

    return (
        <Box mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
            <Text color="white" fontSize={32}>Welcome, {userData.user_metadata.full_name}!</Text>
            <Text color="white" fontSize={32}>Balance: {userStockData.balance}</Text>
            <Text color="white" fontSize={32}>Stocks owned: </Text>
            <UserStocks stocks={userStockData.stocks}/>
        </Box>
    );
};

export default CareerContainer;