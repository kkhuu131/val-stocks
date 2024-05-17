import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import StockGraph from "./StockGraph";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";
import { Box, Heading, Text, Grid, Flex, Image } from "@chakra-ui/react";

const StockDetailContainer = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);
  const [currStockData, setCurrStockData] = useState({});

  const convertToLocaleTime = (data) => {
    return data.map(item => {
      return {
        ...item,
        localTimestamp: new Date(item.timestamp)
      };
    });
  };

  useEffect(() => {
    const socket = io("http://localhost:5000");

    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stockData/${symbol}`
        );

        const localizedData = convertToLocaleTime(response.data);
        localizedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        setStockData(localizedData);

        const response2 = await axios.get(
          `http://localhost:5000/currentStockData/${symbol}`
        );
        
        const newData = {
          ...response2.data,
          localTimestamp: new Date(response2.data.timestamp)
        }

        setCurrStockData(newData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    socket.on("newStockData", (newStockData) => {
      if (newStockData.symbol === symbol) {
        newStockData.localTimestamp = new Date(newStockData.timestamp);
        setStockData((prevStockData) => [...prevStockData, newStockData]);
        setCurrStockData(newStockData);
      }
    });

    // Clean up listener when component unmounts
    return () => {
      socket.off("newStockData");
    };
  }, [symbol]);

  return (
    <Box mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
      <Grid templateColumns="800px 400px">
        <Flex alignItems="right" m={5}>
          <Grid templateRows="100px 450px">
            <Flex>
              <Box p={1}>
                <Box>
                  <Text color="white" fontSize={32}>
                    ${currStockData.price && currStockData.price}
                  </Text>
                </Box>
                <Box pt={1} pb={4}>
                  <Text color="white">
                    {stockData[0] && (
                      <>
                        {(() => {
                          const percentageChange =
                            Math.round(
                              (currStockData.price / stockData[0].price - 1) *
                                100 *
                                100
                            ) / 100;
                          return (
                            <>
                              {percentageChange > 0 && "+"}
                              {String(percentageChange)}%
                            </>
                          );
                        })()}
                      </>
                    )}
                  </Text>
                </Box>
              </Box>
            </Flex>
            <Flex>
              <StockGraph symbol={symbol} stockData={stockData} />
            </Flex>
          </Grid>
        </Flex>
        <Flex
          alignItems="right"
          justifyContent="center"
          border="1px solid"
          borderColor="grayAlpha.500"
          borderRadius="lg"
          m={10}
        >
          <Grid templateRows="75px 85px 85px">
            <Flex alignItems="center" justifyContent={"center"}>
              <Image
                src={teamData["teamBySymbolMap"][symbol].img}
                alt={"{symbol} Logo"}
                width="35px"
                height="35px"
                m={1}
              />
              <Text m={1} fontSize={20} fontWeight="bold" color="white">
                {teamData["teamBySymbolMap"][symbol].name}
              </Text>
              <Text m={1} fontSize={16} color={"grayAlpha.50"}>
                {symbol}
              </Text>
            </Flex>
            <Flex alignItems="top" justifyContent={"center"}>
              <BuyForm symbol={symbol} />
            </Flex>
            <Flex alignItems="top" justifyContent={"center"}>
              <SellForm symbol={symbol} />
            </Flex>
          </Grid>
        </Flex>
      </Grid>
    </Box>
  );
};

export default StockDetailContainer;
