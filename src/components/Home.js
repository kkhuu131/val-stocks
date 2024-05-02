import React, { useState, useEffect } from "react";
import StockForm from "./StockForm";
import StockDisplayContainer from "./StockDisplayContainer";

export default function Home() {
  useEffect(() => {
    document.title = "VALORANT Stocks";
  });

  return (
    <div>
      <StockDisplayContainer />
    </div>
  );
}
