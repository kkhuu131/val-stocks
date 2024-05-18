import React, { useEffect } from "react";
import CareerContainer from "./CareerContainer";
import { Box, CSSReset } from "@chakra-ui/react";
import { supabase } from "../supabase";

export default function Rankings() {
  useEffect(() => {
    document.title = "VALORANT Stocks";

    async function getRankingsData() {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("timestamp", { ascending: true });

        if (error) {
            console.error("Error fetching stock price:", error);
            throw error;
        }
    }
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