import React, { useState, useEffect } from "react";
import { fetchMatches, fetchEvents, fetchTeams } from "../api";
import StockForm from "./StockForm";

export default function Home() {
  return <StockForm />;
}
