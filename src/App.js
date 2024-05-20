import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Career from "./components/Career";
import StockDetail from "./components/StockDetail";
import Rankings from "./components/Rankings";
import NavBar from "./components/NavBar";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/stock/:symbol" element={<StockDetail />}></Route>
        <Route path="/career/:username" element={<Career />}></Route>
        <Route path="/rankings" element={<Rankings />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
