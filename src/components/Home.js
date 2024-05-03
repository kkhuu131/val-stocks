import React, { useState, useEffect } from "react";
import StockForm from "./StockForm";
import StockDisplayContainer from "./StockDisplayContainer";
import { Box } from "@chakra-ui/react";

export default function Home() {
  useEffect(() => {
    document.title = "VALORANT Stocks";
  });

  return (
    <Box>
      <StockDisplayContainer />
    </Box>
  );
}
