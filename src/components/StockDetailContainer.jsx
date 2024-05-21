import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import StockGraph from "./StockGraph";
import BuySellPanel from "./BuySellPanel";
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
    <Box py="3" mx="auto" maxW="1200px" backgroundColor="grayAlpha.700" borderRadius="lg">
      <Grid templateColumns="800px 400px">
        <Flex alignItems="left" ml={5} maxW="800px">
          <Grid templateRows="100px 450px">
            <Flex> 
                <Grid templateColumns="500px 280px">
                  <Flex alignItems="center" justifyContent={"left"}>
                      <Image
                          src={teamData["teamBySymbolMap"][symbol].img}
                          alt={"{symbol} Logo"}
                          width="75px"
                          height="75px"
                          m={1}
                      />
                      <Text m={1} fontSize={40} fontWeight="bold" color="white">
                          {teamData["teamBySymbolMap"][symbol].name}
                      </Text>
                      <Text m={1} fontSize={16} color={"grayAlpha.50"}>
                          {symbol}
                      </Text>
                  </Flex>
                  <Flex alignItems="center" justifyContent={"right"}>
                        <Heading color="white" fontSize={24} mr="3">
                          ${currStockData.price && currStockData.price}
                        </Heading>
                        {stockData[0] && (
                          <>
                            {(() => {
                              const percentageChange =
                                Math.round(
                                  (stockData[stockData.length - 1].price /
                                    stockData[0].price -
                                    1) *
                                    100 *
                                    100
                                ) / 100;

                              if(percentageChange > 0) {
                                return (
                                  <Text m={1} fontSize={16} fontWeight="bold" color="green.500">
                                    +{String(percentageChange)}%
                                  </Text>
                                );
                              }
                              else {
                                return (
                                  <Text m={1} fontSize={16} fontWeight="bold" color="red.500">
                                    {String(percentageChange)}%
                                  </Text>
                                );
                              }
                            })()}
                          </>
                      )}
                  </Flex>      
                </Grid>
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
          <BuySellPanel symbol={symbol} currStockData={currStockData}/>
        </Flex>
      </Grid>
    </Box>
  );
};

export default StockDetailContainer;
