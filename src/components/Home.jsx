import React, { useState, useEffect } from "react";
import StockForm from "./StockForm";
import StockDisplayContainer from "./StockDisplayContainer";
import { Box, CSSReset } from "@chakra-ui/react";

export default function Home() {
  useEffect(() => {
    document.title = "VALORANT Stocks";
  });

  return (
    <>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1}>
        <StockDisplayContainer />
      </Box>
    </>
  );
}