import React, { useState, useEffect } from "react";
import { fetchMatches, fetchEvents, fetchTeams } from "../api";
import StockForm from "./StockForm";
import BuyForm from "./BuyForm";

export default function Home() {
  return (
    <div>
      <StockForm />
      <BuyForm />
    </div>
  );
}
