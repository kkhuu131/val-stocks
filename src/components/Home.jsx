import React, { useState, useEffect } from "react";
import StockDisplayContainer from "./StockDisplayContainer";
import { Flex, Grid, Box, CSSReset } from "@chakra-ui/react";
import UpcomingMatchesContainer from "./UpcomingMatchesContainer";
import HomeUserPanel from "./HomeUserPanel";
import CumulativeStockGraph from "./CumulativeStockGraph";
import { Helmet } from "react-helmet-async";

export default function Home() {

  return (
    <>
      <Helmet>
        <title>ValStocks</title>
        <meta name="description" content="Welcome to ValStocks! Invest in your favorite VALORANT teams." />
        <meta name="keywords" content="ValStocks, trading, fake stocks, stock market game, VALORANT" />
      </Helmet>
      <CSSReset />
      <Box backgroundColor="black" p={0} m={0} pt={1} pb={1} minHeight="100vh" minWidth="100vw" display="flex" flexDirection="column" alignItems="center">
        <Box w="1200px" h="600px" mb="20px">
          <CumulativeStockGraph/>
        </Box>
        <HomeUserPanel/>
        {/* <UpcomingMatchesContainer/> */}
        <StockDisplayContainer />
      </Box>
    </>
  );
}
