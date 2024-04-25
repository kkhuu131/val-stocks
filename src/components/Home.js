import React, { useState, useEffect } from "react";
import { fetchMatches, fetchEvents, fetchTeams } from "../api";
import StockForm from "./StockForm";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import StockGraph from "./StockGraph";

export default function Home() {
  return (
    <div>
      <StockForm />
      <BuyForm />
      <SellForm />
      <StockGraph symbol="NRG" />
    </div>
  );
}
