import { React, useEffect } from "react";
import StockDetailContainer from "./StockDetailContainer";
import { useParams } from "react-router-dom";
import teamData from "../teamMappings.json";
import { Box } from "@chakra-ui/react";

export default function StockDetail() {
  const { symbol } = useParams();

  useEffect(() => {
    document.title =
      symbol + " (" + teamData.teamBySymbolMap[symbol].name + ")";
  }, [symbol]);

  return (
    <Box minH="100vh" backgroundColor="black" pt={1}>
      <StockDetailContainer symbol={symbol} />
    </Box>
  );
}
