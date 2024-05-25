import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import StockGraph from "./StockGraph";
import BuySellPanel from "./BuySellPanel";
import { Box, Heading, Text, Grid, Flex, Image, Tabs, TabList, TabPanels, Tab, TabPanel, useMediaQuery } from "@chakra-ui/react";

const StockDetailContainer = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);
  const [currStockData, setCurrStockData] = useState({});
  const [timeRange, setTimeRange] = useState("1H");
  const [isLargerThan768] = useMediaQuery("(min-width: 1024px)");

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

  if(!isLargerThan768) {
    return(
      <Box p="1" mx="auto" minW="90%" maxW="90%" h="100%" backgroundColor="grayAlpha.900" borderRadius="lg">
        <Grid templateColumns="auto auto">
              <Flex alignItems="center" justifyContent="left">
                  <Image
                      src={teamData["teamBySymbolMap"][symbol].img}
                      alt={"{symbol} Logo"}
                      width="50px"
                      height="50px"
                      m={1}
                  />
                  <Flex>
                    <Text m={1} fontSize={16} color={"grayAlpha.50"} fontWeight="bold">
                        {symbol}
                    </Text>
                  </Flex>
              </Flex>
              <Flex alignItems="center" justifyContent="right">
                <Grid templateRows="50% 50%">
                  <Flex justifyContent={"right"}>
                    <Heading color="white" fontSize={20} >
                      ${currStockData.price && currStockData.price}
                    </Heading>
                  </Flex>
                  <Flex justifyContent={"right"}>
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
                              <Text fontSize={16} fontWeight="bold" color="green.500">
                                +{String(percentageChange)}%
                              </Text>
                            );
                          }
                          else {
                            return (
                              <Text fontSize={16} fontWeight="bold" color="red.500">
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
            </Grid>
            <Box h="100%" w="100%" aspectRatio="2">
              <StockGraph stock={stockData.symbol} stockData={stockData}/>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor="grayAlpha.500"
              borderRadius="lg"
              m={2}
              mx="auto"
              maxWidth="325px"
              h="auto"
            >
              <BuySellPanel symbol={symbol} currStockData={currStockData}/>
            </Flex>
      </Box>
    );
  }

  return (
    <Box py="5" mx="auto" maxW={["90%", "90%", "80%", "80%"]} minW="auto" backgroundColor="grayAlpha.900" borderRadius="lg">  
      <Grid templateColumns={["auto 250px", "auto 250px", "auto 300px", "auto 350px"]}>
        <Box>
          <Grid templateColumns="auto auto auto">
            <Flex alignItems="center" justifyContent={"left"}>
                <Image
                    src={teamData["teamBySymbolMap"][symbol].img}
                    alt={"{symbol} Logo"}
                    width={["50px", "55px", "60px", "75px"]}
                    height={["50px", "55px", "60px", "75px"]}
                    m={1}
                />
                <Text m={1} fontSize={[16, 16, 20, 30]} fontWeight="bold" color="white">
                    {teamData["teamBySymbolMap"][symbol].name}
                </Text>
                <Text m={1} fontSize={16} color={"grayAlpha.50"}>
                    {symbol}
                </Text>
            </Flex>
            <Tabs variant='soft-rounded' alignContent="center" onChange={(value) => setTimeRange(value)}>
              <Grid templateColumns="50px 50px 50px">
                <Tab _selected={{color:"white"}} value="1H">1H</Tab>
                <Tab _selected={{color:"white"}} value="1D">1D</Tab>
                <Tab _selected={{color:"white"}} value="1W">1W</Tab>
              </Grid>
            </Tabs>
            <Flex alignItems="center" justifyContent="right">
              <Grid templateRows="auto auto">
                <Flex justifyContent={"right"}>
                  <Heading color="white" fontSize={[16, 16, 20, 30]} >
                    ${currStockData.price && currStockData.price}
                  </Heading>
                </Flex>
                <Flex justifyContent={"right"}>
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
                            <Text fontSize={[12, 12, 16, 24]} fontWeight="bold" color="green.500">
                              +{String(percentageChange)}%
                            </Text>
                          );
                        }
                        else {
                          return (
                            <Text fontSize={[12, 12, 16, 24]} fontWeight="bold" color="red.500">
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
          </Grid>
          <Box h="0%" w="100%" aspectRatio="2">
            <StockGraph symbol={symbol} stockData={stockData} timeRange={timeRange}/>
          </Box>
        </Box>
        <Box
          alignItems="center"
          justifyContent="center"
          border="1px solid"
          borderColor="grayAlpha.500"
          borderRadius="lg"
          m={5}
          my="auto"
          w={["200px", "200px", "250px", "300px"]}
        >
          <BuySellPanel symbol={symbol} currStockData={currStockData}/>
        </Box>
      </Grid>
    </Box>
  );
};

export default StockDetailContainer;
