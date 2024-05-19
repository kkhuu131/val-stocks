import React, { useState, useEffect } from "react";
import axios from "axios";
import StockDisplayRow from "./StockDisplayRow";
import { Box } from "@chakra-ui/react";
import { theme } from "@saas-ui/theme-glass";

const StockDisplayContainer = () => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stocks`);
        const stockResponse = response.data;
        stockResponse.sort((a, b) => new Date(b.price) - new Date(a.price));
        setStocks(stockResponse);
      } catch (error) {
        console.error("Error fetching stocks data:", error);
      }
    };

    fetchStocks();
  });

  return (
    <Box m={1} mx="auto" maxW="70%" minW="800px">
      {stocks.map((item, index) => {
        return <StockDisplayRow key={index} stock={item} />;
      })}
    </Box>
  );
};

export default StockDisplayContainer;
