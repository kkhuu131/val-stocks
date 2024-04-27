// BuyForm.js (React component)
import React, { useState } from "react";
import axios from "axios";

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
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="0"
        step=".001"
      />
      <button type="submit">Buy Stock</button>
    </form>
  );
};

export default BuyForm;
