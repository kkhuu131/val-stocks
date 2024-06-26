import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Career from "./components/Career";
import NotFound from "./components/NotFound";
import StockDetail from "./components/StockDetail";
import Rankings from "./components/Rankings";
import NavBar from "./components/NavBar";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box w="100%" minH="100vh" backgroundColor="black" overflowX="hidden">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/stock/:symbol" element={<StockDetail />}></Route>
        <Route path="/career/:username" element={<Career />}></Route>
        <Route path="/rankings" element={<Rankings />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Box>
  );
}

export default App;
