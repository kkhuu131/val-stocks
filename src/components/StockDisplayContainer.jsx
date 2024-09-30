import React, { useState, useEffect } from "react";
import StockDisplayRow from "./StockDisplayRow";
import teamData from "../teamMappings.json";
import { supabase } from "../supabase";
import { Box, Grid, Flex, Input, Select, useMediaQuery, Spinner } from "@chakra-ui/react";

const StockDisplayContainer = () => {
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [loading, setLoading] = useState("true");

  const regions = {
    Americas: [
      "United States",
      "Chile",
      "Brazil",
      "Argentina"
    ],
    EMEA: [
      "Europe",
      "Turkey",
      "France"
    ],
    APAC: [
      "Japan",
      "South Korea",
      "Singapore",
      "India",
      "Indonesia",
      "Thailand",
      "Philippines"
    ],
    CN: [
      "China"
    ]
  }

  useEffect(() => {
    const fetchStocks = async () => {
      const { data, error } = await supabase
        .from("current_stock_prices")
        .select("symbol, price")
        .order("price", { ascending: false});

      if (error) {
        console.error("Error fetching stocks data:", error);
        return;
      }

      setStocks(data);
      setLoading(false);
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered = stocks.filter((stock) => {
      const matchesSearchQuery = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || (teamData.teamBySymbolMap[stock.symbol] && teamData.teamBySymbolMap[stock.symbol].name.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesRegion = selectedRegion === "All" || regions[selectedRegion].includes(teamData.teamBySymbolMap[stock.symbol].country);
      return matchesSearchQuery && matchesRegion;
  }, []);

    setFilteredStocks(filtered);
  }, [searchQuery, selectedRegion, stocks]);

  if(loading) {
    return(
      <Box m={1} mx="auto" maxW={["90%", "80%", "50%"]} minW={["90%", "80%", "500px"]} minH="800px" backgroundColor="grayAlpha.900" borderRadius="lg">
        <Flex justifyContent="center" minHeight="100px" size="md" m="auto">
        </Flex>
      </Box>
    );
  }

  return (
    <Box m={1} mx="auto" w={["90%", "80%", "600px"]} minH="800px">
      <Grid gridTemplateColumns={["1fr 1fr", "1fr 1fr","3fr 2fr"]}>
        <Flex justifyContent="center" alignItems="center" w="100%" mb="4">
          <Input borderColor="grayAlpha.500" color="white" fontSize={["14", "20"]} h="50px" placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </Flex>
        <Flex ml="3">
          <Select color="white" backgroundColor="black" fontSize={["14", "20"]} h="50px" borderColor="grayAlpha.500" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
            <option value="All" style={{ color: 'black'}}>All Regions</option>
            <option value="Americas" style={{ color: 'black'}}>Americas</option>
            <option value="EMEA" style={{ color: 'black'}}>EMEA</option>
            <option value="APAC" style={{ color: 'black'}}>Pacific</option>
            <option value="CN" style={{ color: 'black'}}>China</option>
          </Select>
        </Flex>
      </Grid>
      {filteredStocks.length > 0 && filteredStocks.map((item, index) => {
        return <StockDisplayRow key={index} stock={item} />;
      })}
    </Box>
  );
};

export default StockDisplayContainer;
