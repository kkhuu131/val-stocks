import React, { useEffect, useState } from "react";
import CareerContainer from "./CareerContainer";
import { useParams } from "react-router-dom";
import { Box, CSSReset } from "@chakra-ui/react";
import { Helmet } from "react-helmet-async";

export default function Career() {
  const { username } = useParams();

  useEffect(() => {
    document.title = username + "'s Career";

  }, [username]);


  return (
    <>
      <Helmet>
        <title>{username + "'s Career"}</title>
        <meta name="description" content={`View details and performance of ${username}'s career.`} />
        <meta name="keywords" content={`${username}, career, user, profile, ValStocks`} />
      </Helmet>
      <CSSReset />
      <Box backgroundColor="black" pt={1} pb={1} h="100vh">
        <CareerContainer username={username}/>
      </Box>
    </>
  );
}