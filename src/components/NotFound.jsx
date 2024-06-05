import React, { useEffect } from "react";
import { Text, Flex, Box, Grid, CSSReset, Heading } from "@chakra-ui/react";

export default function NotFound() {

  useEffect(() => {
    document.title = "404 Not Found";

  }, []);


  return (
    <>
        <Grid templateRows="auto auto" color="white" justifyContent="center">
            <Flex mx="auto">
                <Heading fontSize={["20", "30", "40", "50"]}>errr 404 - Page Not Found</Heading>
            </Flex>
            <Flex mx="auto">
                <Text fontSize={["12", "26"]}>Sorry, the page you are looking for does not exist.</Text>
            </Flex>
        </Grid>
    </>
  );
}