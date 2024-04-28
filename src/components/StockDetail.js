import { React, useEffect } from "react";
import StockDetailContainer from "./StockDetailContainer";
import { useParams } from "react-router-dom";
import teamData from "../teamMappings.json";

export default function StockDetail() {
  const { symbol } = useParams();

  useEffect(() => {
    document.title =
      symbol + " (" + teamData.teamBySymbolMap[symbol].name + ")";
  }, [symbol]);

  return (
    <div>
      <StockDetailContainer symbol={symbol} />
    </div>
  );
}
