// BuyForm.js (React component)
import React, { useState } from "react";
import teamData from "../teamMappings.json";
import {
  FormControl,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Flex,
  Image,
  Text
} from "@chakra-ui/react";
import { supabase } from '../supabase';

const BuyForm = ({ symbol, stockPrice, userBalance}) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {   
      const { data: userResponse, error: userError} = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userResponse.user;

      if (user) {
        const { data: currentStockData, error: fetchStockError } = await supabase
          .from("current_stock_prices")
          .select("*")
          .eq("symbol", symbol)
          .single();
        
        if (fetchStockError) {
          console.error("Error fetching current stock price:", fetchStockError);

          return;
        }

        const stockPrice = Number(currentStockData.price);

        const { data: userProfile, error: fetchUserError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchUserError) {
          console.error("Error fetching user profile:", fetchUserError);

          return;
        }

        const userBalance = Number(userProfile.balance);
        const transactionAmount = Number(amount * stockPrice);

        if (transactionAmount > userBalance) {
          console.log("Insufficient balance.");

          return;
        }

        const updatedBalance = Math.round(Number(userBalance - transactionAmount) * 100) / 100;
        const updatedStocks = { ...userProfile.stocks };
        updatedStocks[symbol] = Math.round(((Number(updatedStocks[symbol]) || 0) + Number(amount)) * 1000) / 1000;

        await supabase
          .from("profiles")
          .update({ balance: updatedBalance, stocks: updatedStocks })
          .eq("id", user.id);

        await supabase
          .from("current_stock_prices")
          .update({ demand: currentStockData.demand + Number(amount) })
          .eq("symbol", symbol);

        console.log("Stock bought");
      } else {
        console.error("User not authenticated");
      }
    } catch (error) {
      console.error("Error buying stock:", error);
    }
  };

  return (
    <Box alignItems="center" justifyContent="center" w="200px">
      <FormControl as="form" onSubmit={handleSubmit}>
        <NumberInput
          defaultValue={0}
          min={0}
          max={Math.round(userBalance/stockPrice * 1000) / 1000}
          onChange={(e) => setAmount(e)}
          precision={3}
          isRequired={true}
          step={0.001}
          backgroundColor="grayAlpha.700"
          color="white"
          borderRadius="lg"
          border="0px"
          m={1}
        >
          <NumberInputField
            fontSize="16"
            textAlign="center"
            border="0px"
            fontWeight="bold"
            height="40px"
            placeholder="Enter amount"
          />
          <NumberInputStepper>
            <NumberIncrementStepper children='+' color='grayAlpha.100' borderColor="grayAlpha.500" />
            <NumberDecrementStepper children='-' color='grayAlpha.100' borderColor="grayAlpha.500"/>
          </NumberInputStepper>
        </NumberInput>
        <Flex alignItems="center" justifyContent="center">
          <Button
            type="submit"
            m={1}
            mt={3}
            borderRadius="md"
            border="0px"
            backgroundColor="grayAlpha.500"
            color="white"
            fontSize="14"
            h="35px"
            w="60px"
            fontWeight={"bold"}
            _hover={{
              backgroundColor:"grayAlpha.400"
            }}
          >

            <Text>Buy</Text>
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default BuyForm;
