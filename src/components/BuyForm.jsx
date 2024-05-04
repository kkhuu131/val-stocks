// BuyForm.js (React component)
import React, { useState } from "react";
import axios from "axios";
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
} from "@chakra-ui/react";

const BuyForm = ({ symbol }) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/buy", {
        symbol,
        amount,
      });
      console.log("Stock bought:", response.data);
      // Reset form fields after successful submission
      setAmount(0);
    } catch (error) {
      console.error("Error buying stock:", error);
    }
  };

  return (
    <Box alignItems="center" justifyContent="center" h="70%">
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
            backgroundColor="grayAlpha.50"
            color="white"
            fontSize="16"
          >
            Buy {symbol} Stock
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default BuyForm;
