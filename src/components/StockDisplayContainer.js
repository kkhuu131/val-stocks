import React, { useState, useEffect } from "react";
import axios from "axios";
import StockDisplayRow from "./StockDisplayRow";

const StockDisplayContainer = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stocks`);
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stocks data:", error);
      }
    };

    fetchStocks();
  });

  return (
    <div>
      {stocks.map((item, index) => {
        return <StockDisplayRow key={index} stock={item} />;
      })}
    </div>
  );
};

export default StockDisplayContainer;
