import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import teamData from "../teamMappings.json";
import StockGraph from "./StockGraph";
import BuySellPanel from "./BuySellPanel";
import { Box, Heading, Text, Grid, Flex, Image, Tabs, TabList, TabPanels, Tab, TabPanel, useMediaQuery,   AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  Button,
  Alert,
  useDisclosure, } from "@chakra-ui/react";

const StockDetailContainer = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);
  const [currStockData, setCurrStockData] = useState({});
  const [timeRange, setTimeRange] = useState(0);
  const [isLargerThan768] = useMediaQuery("(min-width: 1024px)");
  const [filteredData, setFilteredData] = useState(stockData);

  useEffect(() => {
    filterData();
  }, [timeRange, stockData]);

  const filterData = () => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    let filtered;

    const roundToNearest30Minutes = (date) => {
      const minutes = date.getMinutes();
      const roundedMinutes = minutes < 15 ? 0 : (minutes < 45 ? 30 : 60);
      date.setMinutes(roundedMinutes, 0, 0);
  
      return date;
    };
  
    const sampleDataPoints = (data, n, interval) => {
      let points = [];
      let current = new Date(roundToNearest30Minutes(new Date(now - (n+1) * interval)));
  
      for (let i = 0; i <= n; i++) {
        const dataPoint = data.find(dp => new Date(dp.timestamp).getTime() === current.getTime());
        if(dataPoint) {
          points.push(dataPoint);
        }
  
        current = new Date(current.getTime() + interval);
      }
  
      return points;
    };

    switch (timeRange) {
      case 0:
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.timestamp) >= new Date(now - 60 * 60 * 1000)
        );
        break;
      case 1:
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.timestamp) >= new Date(now - 24 * 60 * 60 * 1000)
        );

        filtered = sampleDataPoints(filtered, 23, 60 * 60 * 1000);

        const currentDataPoint = stockData.find(
          dataPoint => new Date(dataPoint.timestamp).getTime() === now.getTime()
        );

        if (currentDataPoint) {
          filtered.push(currentDataPoint);
        }

        break;
      case 2:
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.timestamp) >= new Date(now - 7 *24 * 60 * 60 * 1000)
        );

        filtered = sampleDataPoints(filtered, 6, 24 * 60 * 60 * 1000);

        const point = stockData.find(
          dataPoint => new Date(dataPoint.timestamp).getTime() === now.getTime()
        );

        if (point) {
          filtered.push(point);
        }
        break;
      default:
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.timestamp) >= new Date(now - 60 * 60 * 1000)
        );
    }

    setFilteredData(filtered);
  };

  const convertToLocaleTime = (data) => {
    return data.map(item => {
      return {
        ...item,
        localTimestamp: new Date(item.timestamp)
      };
    });
  };

  useEffect(() => {
    const channel = supabase
    .channel("stock-updates")
    .on("postgres_changes", 
      {
        event: "INSERT",
        schema: "public",
        table: "stock_prices",
        filter: `symbol=eq.${symbol}`,
      },  
      (payload) => {
        payload.new.localTimestamp = new Date(payload.new.timestamp);
        setStockData((prevStockData) => [...prevStockData, payload.new]);
        setCurrStockData(payload.new);
      }
    )
    .subscribe();

    const fetchStockData = async () => {
      try {
        const { data, error } = await supabase
        .from("stock_prices")
        .select("*")
        .eq("symbol", symbol)
        .order("timestamp", { ascending: true });

      if (error) {
        console.error("Error fetching stock data:", error);
        throw error;
      }

        const localizedData = convertToLocaleTime(data);
        localizedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        await setStockData(localizedData);

        setCurrStockData(localizedData[localizedData.length - 1]);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if(!isLargerThan768) {
    return(
      <Box p="1" mx="auto" minW="90%" maxW="90%" h="100%" backgroundColor="grayAlpha.900" borderRadius="lg">
        <Grid templateColumns="50px auto auto">
              <Flex alignItems="center" justifyContent="left">
                  <Image
                      src={teamData["teamBySymbolMap"][symbol].img}
                      alt={"{symbol} Logo"}
                      width="50px"
                      height="50px"
                      m={1}
                  />
                  {/* <Flex>
                    <Text m={1} fontSize={16} color={"grayAlpha.50"} fontWeight="bold">
                        {symbol}
                    </Text>
                  </Flex> */}
              </Flex>
              <Tabs ml="auto" variant='soft-rounded' alignContent="center" onChange={(index) => setTimeRange(index)}>
                <Grid templateColumns="30px 30px 30px">
                  <Tab _selected={{color:"white"}} value="1H">1H</Tab>
                  <Tab _selected={{color:"white"}} value="1D">1D</Tab>
                  <Tab _selected={{color:"white"}} value="1W">1W</Tab>
                </Grid>
              </Tabs>
              <Flex alignItems="center" justifyContent="right">
                <Grid templateRows="50% 50%">
                  <Flex justifyContent={"right"}>
                    <Heading color="white" fontSize={20} >
                      ${currStockData.price ? currStockData.price.toFixed(2) : '0.00'}
                    </Heading>
                  </Flex>
                  <Flex justifyContent={"right"}>
                    {filteredData[0] && (
                      <>
                        {(() => {
                          const percentageChange =
                            Math.round(
                              (filteredData[filteredData.length - 1].price /
                              filteredData[0].price -
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
              <StockGraph stock={stockData.symbol} stockData={filteredData} timeRange={timeRange}/>
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
    <Box py="5" mx="auto" maxW={["90%", "90%", "80%", "85%", "80%"]} minW="auto" backgroundColor="grayAlpha.900" borderRadius="lg">
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
                <Grid templateRows="auto auto">
                  <Text fontSize={[16, 16, 20, 26, 32]} fontWeight="bold" color="white">
                      {teamData["teamBySymbolMap"][symbol].name}
                  </Text>
                  <Text fontSize={16} color={"grayAlpha.50"}>
                      {symbol}
                  </Text>
                </Grid>
            </Flex>
            <Tabs variant='soft-rounded' alignContent="center" onChange={(index) => setTimeRange(index)}>
              <Grid templateColumns="50px 50px 50px">
                <Tab _selected={{color:"white"}} value="1H">1H</Tab>
                <Tab _selected={{color:"white"}} value="1D">1D</Tab>
                <Tab _selected={{color:"white"}} value="1W">1W</Tab>
              </Grid>
            </Tabs>
            <Flex alignItems="center" justifyContent="right">
              <Grid templateRows="auto auto">
                <Flex justifyContent={"right"}>
                  <Heading color="white" fontSize={[16, 16, 20, 26, 30]} >
                    ${currStockData.price ? currStockData.price.toFixed(2) : '0.00'}
                  </Heading>
                </Flex>
                <Flex justifyContent={"right"}>
                  {filteredData[0] && (
                    <>
                      {(() => {
                        const percentageChange =
                          Math.round(
                            (filteredData[filteredData.length - 1].price /
                            filteredData[0].price -
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
          <Box h="0%" w="100%" aspectRatio="2">
            <StockGraph symbol={symbol} stockData={filteredData} timeRange={timeRange}/>
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
