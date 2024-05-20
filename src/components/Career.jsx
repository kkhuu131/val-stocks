import React, { useEffect, useState } from "react";
import CareerContainer from "./CareerContainer";
import { useParams } from "react-router-dom";
import { Box, CSSReset } from "@chakra-ui/react";

export default function Career() {
  const { username } = useParams();

  useEffect(() => {
    document.title = username + "'s Career";

  }, [username]);


  return (
    <>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1} h="100vh">
        <CareerContainer username={username}/>
      </Box>
    </>
  );
}