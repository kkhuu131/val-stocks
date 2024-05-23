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
import { supabase } from '../supabase';
import UserStocks from "./UserStocks";

const CareerContainer = ({username}) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
     
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error.message);
        return;
      }

      setUserProfile(data);
      setLoading(false);
    };

    fetchUserProfile();
  }, [username]);

  if(loading) {
    return(
      <Box p="5" mx="auto" maxW={["90%", "90%", "90%", "1200px"]} minW={["90%", "90%", "90%", "80%"]} minH="300px" backgroundColor="grayAlpha.900" borderRadius="lg">
      </Box>
    );
  }
  
  if (!userProfile) {
    return(
        <Box p="5" mx="auto" maxW={["90%", "90%", "90%", "1200px"]} minW={["90%", "90%", "90%", "80%"]} minH="300px" backgroundColor="grayAlpha.900" borderRadius="lg">
          <Flex alignItems="center" justifyContent="center">
            <Heading color="white">We could not find the user {username}</Heading>
          </Flex>
        </Box>
    );
  }

  return (
      <Box p="5" mx="auto" maxW={["90%", "90%", "90%", "1200px"]} minW={["90%", "90%", "90%", "80%"]} backgroundColor="grayAlpha.900" borderRadius="lg">
          <Flex alignItems="center" justifyContent={"center"}>
            <Image src={userProfile.picture} alt="Profile Picture" boxSize="40px" borderRadius="full" mr="2"/>
            <Text color="white" fontSize={24} fontWeight={"bold"}>{userProfile.username}</Text>
          </Flex>
          <Flex alignItems="center" justifyContent={"center"} m="8">
            <Text color="white" fontSize={[16, 20, 22]} mr="5" fontWeight={"bold"}>Net Worth: ${userProfile.networth || 0}</Text>
            <Text color="white" fontSize={[16, 20, 22]} ml="5" fontWeight={"bold"}>Balance: ${userProfile.balance || 0}</Text>
          </Flex>
          <Box maxW="1000px" mx="auto">
            <UserStocks stocks={userProfile.stocks}/>
          </Box>
      </Box>
  );
};

export default CareerContainer;