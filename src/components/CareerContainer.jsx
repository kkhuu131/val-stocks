import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { 
  Box, 
  Heading, 
  Text, 
  Grid, 
  Flex, 
  Image
} from "@chakra-ui/react";
import UserStocks from "./UserStocks";
import RealTimeUserProfile from "./RealTimeUserProfile";
import { supabase } from '../supabase';

const CareerContainer = () => {
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
          <Box Box mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
          </Box>
      );
  } 

    return (
        <Box p="5" mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
            <Flex alignItems="center" justifyContent={"center"}>
              <Image src={userProfile.picture} alt="Profile Picture" boxSize="40px" borderRadius="full" mr="2"/>
              <Text color="white" fontSize={24} fontWeight={"bold"}>{userProfile.username}</Text>
            </Flex>
            <Flex alignItems="center" justifyContent={"center"} m="8">
              <Text color="white" fontSize={22} mr="5" fontWeight={"bold"}>Net Worth: ${userProfile.networth || 0}</Text>
              <Text color="white" fontSize={22} ml="5" fontWeight={"bold"}>Balance: ${userProfile.balance || 0}</Text>
            </Flex>
            <UserStocks stocks={userProfile.stocks}/>
        </Box>
    );
};

export default CareerContainer;