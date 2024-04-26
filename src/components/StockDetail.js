import React from "react";
import StockForm from "./StockForm";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import StockGraph from "./StockGraph";
import { useParams } from "react-router-dom";

export default function StockDetail() {
  const { symbol } = useParams();
  return (
    <div>
      <p>{symbol}</p>
      <StockForm />
      <BuyForm />
      <SellForm />
    </div>
  );
}
