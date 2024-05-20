import React, { useState, useEffect } from "react";
import StockForm from "./StockForm";
import StockDisplayContainer from "./StockDisplayContainer";
import { Box, CSSReset } from "@chakra-ui/react";
import UpcomingMatchesContainer from "./UpcomingMatchesContainer";

export default function Home() {
  useEffect(() => {
    document.title = "VALORANT Stocks";
  });

  return (
    <>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1} minHeight="100vh">
        <UpcomingMatchesContainer/>
        <StockDisplayContainer />
      </Box>
    </>
  );
}
