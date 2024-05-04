import React from "react";
import { Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import StockDetail from "./components/StockDetail";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/stock/:symbol" element={<StockDetail />}></Route>
    </Routes>
  );
}

export default App;
