import React, { useEffect } from "react";
import CareerContainer from "./CareerContainer";
import { Box, CSSReset } from "@chakra-ui/react";

export default function Career() {
  useEffect(() => {
    document.title = "VALORANT Stocks";
  });

  return (
    <>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1} h="100vh">
        <CareerContainer/>
      </Box>
    </>
  );
}