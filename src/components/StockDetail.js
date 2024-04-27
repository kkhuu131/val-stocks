import React from "react";
import StockForm from "./StockForm";
import StockDetailContainer from "./StockDetailContainer";
import { useParams } from "react-router-dom";

export default function StockDetail() {
  const { symbol } = useParams();
  return (
    <div>
      <StockDetailContainer symbol={symbol} />
    </div>
  );
}
