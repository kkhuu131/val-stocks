import React, { useState, useEffect } from "react";
import axios from "axios";
import StockDisplayRow from "./StockDisplayRow";
import teamData from "../teamMappings.json";
import { Box, Flex, Input } from "@chakra-ui/react";

const StockDisplayContainer = () => {
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);

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

  useEffect(() => {
    const filtered = stocks.filter((stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || (teamData.teamBySymbolMap[stock.symbol] && teamData.teamBySymbolMap[stock.symbol].name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredStocks(filtered);
  }, [searchQuery, stocks]);

  return (
    <Box m={1} mx="auto" maxW="70%" minW="800px">
      <Flex justifyContent="center" alignItems="center" w="100%" mb="4">
        <Input color="white" fontSize="24" h="50px" placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
      </Flex>
      {filteredStocks.length > 0 && filteredStocks.map((item, index) => {
        return <StockDisplayRow key={index} stock={item} />;
      })}
    </Box>
  );
};

export default StockDisplayContainer;
