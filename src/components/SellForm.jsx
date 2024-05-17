// SellForm.js (React component)
import React, { useState } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import {
  FormControl,
  FormLabel,
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

const SellForm = ({ symbol }) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const stockResponse = await axios.get("http://localhost:5000/currentStockData/" + symbol);
      const stockPrice = stockResponse.data.price;
      
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

        const userStockAmount = (userProfile.stocks && userProfile.stocks[symbol]) ? Number(userProfile.stocks[symbol]) : 0;

        if (amount > userStockAmount) {
          console.log("User doesn't own enough stocks: " + amount + " " + userStockAmount);

          return;
        }

        const updatedBalance = Math.round(Number(userBalance + transactionAmount) * 100) / 100;
        const updatedStocks = { ...userProfile.stocks };
        updatedStocks[symbol] = Math.round(((Number(updatedStocks[symbol]) || 0) - Number(amount)) * 1000) / 1000;
        if(Number(updatedStocks[symbol]) == 0) {
          delete updatedStocks[symbol];
        }

        await supabase
          .from("profiles")
          .update({ balance: updatedBalance, stocks: updatedStocks })
          .eq("id", user.id);

        await supabase
          .from("current_stock_prices")
          .update({ demand: currentStockData.demand + Number(amount) })
          .eq("symbol", symbol);

        console.log("Stock sold");
      } else {
        console.error("User not authenticated");
      }
    } catch (error) {
      console.error("Error selling stock:", error);
    }
  };

  return (
    <Box alignItems="center" justifyContent="center" w="200px">
    <FormControl as="form" onSubmit={handleSubmit}>
      <FormLabel>Amount</FormLabel>
      <NumberInput
        defaultValue={0}
        min={0}
        onChange={(e) => setAmount(e)}
        precision={3}
        isRequired={true}
        step={0.001}
        backgroundColor="grayAlpha.500"
        color="white"
        borderColor="grayAlpha.50"
        borderRadius="lg"
        m={1}
      >
        <NumberInputField
          fontSize="16"
          textAlign="center"
          height="40px"
          placeholder="Enter amount"
          fontWeight={"bold"}
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Flex alignItems="center" justifyContent="center">
        <Button
          type="submit"
          m={1}
          mt={3}
          borderRadius="lg"
          border="0px"
          backgroundColor="grayAlpha.50"
          color="white"
          fontSize="12"
          fontWeight={"bold"}
          _hover={{
            backgroundColor:"grayAlpha.500"
          }}
        >
                      <Text>Sell</Text>
            <Image
                src={teamData["teamBySymbolMap"][symbol].img}
                alt={"{symbol} Logo"}
                width="20x"
                height="20px"
                m={1}
              />
            <Text>Stock</Text>
        </Button>
      </Flex>
    </FormControl>
    </Box>
  );
};

export default SellForm;
