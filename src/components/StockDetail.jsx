import { React, useEffect } from "react";
import StockDetailContainer from "./StockDetailContainer";
import { useParams } from "react-router-dom";
import teamData from "../teamMappings.json";
import { Box } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function StockDetail() {
  const { symbol } = useParams();

  return (
    <>
      <Helmet>
        <title>{symbol + " (" + teamData.teamBySymbolMap[symbol].name + ")"}</title>
        <meta name="description" content={`View details and performance of ${symbol} stocks.`} />
        <meta name="keywords" content={`${symbol}, stock details, ValStocks`} />
      </Helmet>
      <Box minH="100vh" backgroundColor="black" pt={1}>
        <StockDetailContainer symbol={symbol} />
      </Box>
    </>
    
  );
}
