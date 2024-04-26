// StockForm.js (React component)

import React, { useState } from "react";
import axios from "axios";

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
      setPrice("");
    } catch (error) {
      console.error("Error creating stock:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Stock Name"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <button type="submit">Create Stock</button>
    </form>
  );
};

export default StockForm;
