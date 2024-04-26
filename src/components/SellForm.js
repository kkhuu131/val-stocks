// SellForm.js (React component)
import React, { useState } from "react";
import axios from "axios";

const SellForm = ({ symbol }) => {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/sell", {
        symbol,
        amount,
      });
      console.log("Stock sold:", response.data);
      // Reset form fields after successful submission
      setAmount(0);
    } catch (error) {
      console.error("Error selling stock:", error);
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
      />
      <button type="submit">Sell Stock</button>
    </form>
  );
};

export default SellForm;
