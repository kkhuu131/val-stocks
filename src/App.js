import React from "react";
import { Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import StockDetail from "./components/StockDetail";
import NavBar from "./components/NavBar";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/stock/:symbol" element={<StockDetail />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
