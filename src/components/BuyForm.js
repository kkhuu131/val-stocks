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
    <FormControl as="form" onSubmit={handleSubmit}>
      <FormLabel>Amount</FormLabel>
      <NumberInput
        defaultValue={0}
        min={0}
        onChange={(e) => setAmount(e)}
        precision={3}
        isRequired={true}
        step={0.001}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button type="submit" colorScheme="blue" size="sm">
        Buy Stock
      </Button>
    </FormControl>
  );
};

export default BuyForm;
