// BuyForm.js (React component)
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

const BuyForm = ({ symbol }) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const stockResponse = await axios.get("http://localhost:5000/currentStockData/" + symbol);
      const stockPrice = stockResponse.data.price;

      console.log(stockPrice);
      
      const { data: userResponse, error: userError} = await supabase.auth.getUser();
      if (userError) throw userError;

      const user = userResponse.user;
      console.log(user.id);

      if (user) {
        const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

        if (profileError) throw profileError;

        console.log(userData);

        if(userData && userData.balance >= amount * stockResponse.data.price) {
          console.log("Able to buy " + amount);
          const response = await axios.post("http://localhost:5000/buy", {
            symbol,
            amount
          });
          console.log("Stock bought:", response.data);
          setAmount(0);
        }
        else {
          console.log("Cannot buy " + amount);
        }
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
            fontWeight={"bold"}
            textAlign="center"
            height="40px"
            placeholder="Enter amount"
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
            backgroundColor="grayAlpha.300"
            color="white"
            fontSize="12"
            fontWeight={"bold"}
            _hover={{
              backgroundColor:"grayAlpha.500"
            }}
          >

            <Text>Buy</Text>
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

export default BuyForm;
