// StockForm.js (React component)

import React, { useState } from "react";
import axios from "axios";
import { FormControl, Input, Button } from "@chakra-ui/react";

const StockForm = () => {
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/create", {
        symbol,
        price,
      });
      console.log("New stock created:", response.data);
      // Reset form fields after successful submission
      setSymbol("");
      setPrice(0);
    } catch (error) {
      console.error("Error creating stock:", error);
    }
  };

  return (
    <FormControl as="form" onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Stock Name"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        isRequired
      />
      <Input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        isRequired
      />
      <Button type="submit">Create Stock</Button>
    </FormControl>
  );
};

export default StockForm;
