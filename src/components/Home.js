import React, { useState, useEffect } from "react";
import { fetchMatches, fetchEvents, fetchTeams } from "../api";
import StockForm from "./StockForm";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import StockGraph from "./StockGraph";
import StockDisplayRow from "./StockDisplayRow";
import SmallDisplayStockGraph from "./SmallDisplayStockGraph";
import StockDisplayContainer from "./StockDisplayContainer";

export default function Home() {
  return (
    <div>
      <StockDisplayContainer />
    </div>
  );
}
