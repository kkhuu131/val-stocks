import React, { useState, useEffect } from "react";
import { Flex, Text, Box, CSSReset } from "@chakra-ui/react";
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
    <Flex>
        <Text color="white" fontSize={[18, 24, 28]} m="5" fontWeight={"bold"}>
          Net Worth: {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format(userProfile.networth)}
        </Text>
        <Text color="white" fontSize={[18, 24, 28]} m="5" fontWeight={"bold"}>Balance: 
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
          }).format(userProfile.balance)}
        </Text>
    </Flex>
  );
}