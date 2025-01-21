import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import teamData from "../teamMappings.json";
import StockGraph from "./StockGraph";
import BuySellPanel from "./BuySellPanel";
import { Box, Heading, Text, Grid, Flex, Image, Tabs, TabList, TabPanels, Tab, TabPanel, useMediaQuery, AlertDialog,
  Button,
  Alert,
  useDisclosure, 
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup, 
} from "@chakra-ui/react";

const StockDetailContainer = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);
  const [currStockData, setCurrStockData] = useState({});
  const [timeRange, setTimeRange] = useState(0);
  const [isLargerThan768] = useMediaQuery("(min-width: 1024px)");
  const [filteredData, setFilteredData] = useState(stockData[0] || []);

  useEffect(() => {
    filterData();
  }, [timeRange, stockData]);

  const filterData = () => {
    let filtered = stockData[timeRange] || [];
    console.log(filtered);
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
      }
    )
    .subscribe();

    const current_channel = supabase
    .channel("current_stock-updates")
    .on("postgres_changes", 
      {
        event: "UPDATE",
        schema: "public",
        table: "current_stock_prices",
        filter: `symbol=eq.${symbol}`,
      },  
      (payload) => {
        const updatedStockData = {
          ...payload.new,
          timestamp: Date.now(),
          localTimestamp: new Date()
        };

        setCurrStockData(updatedStockData);
      }
    )
    .subscribe();

    const fetchStockData = async () => {
      try {
        const rpcs = ['fetch_within_last_hour', 'fetch_within_last_day', 'fetch_within_last_week']
        let datasets = []
        
        for (const rpc of rpcs) {
          const { data, error } = await supabase
          .rpc(rpc, {
            symbol
          });

          if (error) {
            console.error("Error running " + rpc + ": ", error);
            throw error;
          }

          const localizedData = convertToLocaleTime(data);
          localizedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          datasets.push(localizedData);
        }

        await setStockData(datasets);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    const fetchCurrentStockData = async () => {
      try {
        const { data, error } = await supabase
        .from("current_stock_prices")
        .select("price, locked")
        .eq("symbol", symbol);

      if (error) {
        console.error("Error fetching current stock data:", error);
        throw error;
      }
      
      await setCurrStockData(data[0]);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
    fetchCurrentStockData();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(current_channel);
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
              </Flex>
              <Tabs ml="auto" variant='soft-rounded' alignContent="center" onChange={(index) => setTimeRange(index)}>
                <Grid templateColumns="30px 30px 30px">
                  <Tab _selected={{color:"white"}} value="1H">1H</Tab>
                  <Tab _selected={{color:"white"}} value="1D">1D</Tab>
                  <Tab _selected={{color:"white"}} value="1W">1W</Tab>
                </Grid>
              </Tabs>
              <Flex alignItems="center" justifyContent="right">
                <Flex justifyContent={"right"}>
                  <Stat>
                    <StatNumber color="white" fontSize={[16, 16, 20, 26, 30]}  fontWeight="bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                      }).format(currStockData.price ? currStockData.price : 0)}
                    </StatNumber>
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
                          
                          if(percentageChange == 0) {
                            return (
                              <StatHelpText fontSize={16} fontWeight="bold" color="gray.500">
                                <StatArrow type='increase' color="gray.500"/>
                                0%
                              </StatHelpText>
                            );
                          }
                          else if(percentageChange > 0) {
                            return (
                              <StatHelpText fontSize={16} fontWeight="bold" color="green.500">
                                <StatArrow type='increase'/>
                                +{String(percentageChange)}%
                              </StatHelpText>
                            );
                          }
                          else {
                            return (
                              <StatHelpText fontSize={16} fontWeight="bold" color="red.500">
                                <StatArrow type='decrease'/>
                                {String(percentageChange)}%
                              </StatHelpText>
                            );
                          }
                        })()}
                      </>
                    ) || 
                    <StatHelpText fontSize={16} fontWeight="bold" color="gray.500">
                      <StatArrow type='increase' color="gray.500"/>
                      0%
                    </StatHelpText>
                    }  
                  </Stat>
                </Flex>
              </Flex>      
            </Grid>
            <Box h="100%" w="100%" aspectRatio="2">
            <StockGraph symbol={symbol} stockData={filteredData.length > 1 ? filteredData : [currStockData]} timeRange={timeRange}/>
            </Box>
            <Flex
              alignItems="center"
              justifyContent="center"
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
    <Grid gridTemplateRows="auto auto" justifyContent="center">
        <Flex alignItems="center" justifyContent={"left"} m="1">
            <Image
                src={teamData["teamBySymbolMap"][symbol].img}
                alt={"{symbol} Logo"}
                width={["50px", "55px", "60px", "70px"]}
                height={["50px", "55px", "60px", "70px"]}
                m={1}
            />
              <Text fontSize={[16, 16, 20, 26, 32]} fontWeight="bold" color="white" mx="2">
                  {teamData["teamBySymbolMap"][symbol].name}
              </Text>
              <Text fontSize={16} color={"grayAlpha.50"}>
                  {symbol}
              </Text>
        </Flex>
        <Grid gridTemplateColumns="900px 350px" justifyContent="center">
        <Box p="5" backgroundColor="grayAlpha.900" borderRadius="lg">
            <Box>
              <Grid templateColumns="auto auto">
                <Flex alignItems="center" justifyContent="left">
                    <Flex justifyContent={"left"}>
                      <Stat m = "2">
                        <StatNumber color="white" fontSize={[16, 16, 20, 26, 30]}  fontWeight="bold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                          }).format(currStockData.price ? currStockData.price : 0.00)}
                        </StatNumber>
                      </Stat>
                      <Flex justifyContent="center">
                        <Stat m="1">
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
                                
                                if(percentageChange == 0) {
                                  return (
                                    <StatHelpText fontSize={16} fontWeight="bold" color="gray.500">
                                      <StatArrow type='increase' color="gray.500"/>
                                      0%
                                    </StatHelpText>
                                  );
                                }
                                else if(percentageChange > 0) {
                                  return (
                                    <StatHelpText fontSize={16} fontWeight="bold" color="green.500">
                                      <StatArrow type='increase'/>
                                      +{String(percentageChange)}%
                                    </StatHelpText>
                                  );
                                }
                                else {
                                  return (
                                    <StatHelpText fontSize={16} fontWeight="bold" color="red.500">
                                      <StatArrow type='decrease'/>
                                      {String(percentageChange)}%
                                    </StatHelpText>
                                  );
                                }
                              })()}
                            </>
                          ) || 
                          <StatHelpText fontSize={16} fontWeight="bold" color="gray.500">
                            <StatArrow type='increase' color="gray.500"/>
                            0%
                          </StatHelpText>
                          }  
                        </Stat>
                      </Flex>
                    </Flex>
                </Flex>   
                <Flex justifyContent="right">
                  <Tabs variant='soft-rounded' alignContent="center" onChange={(index) => setTimeRange(index)}>
                    <Grid templateColumns="50px 50px 50px">
                      <Tab _selected={{color:"white"}} value="1H">1H</Tab>
                      <Tab _selected={{color:"white"}} value="1D">1D</Tab>
                      <Tab _selected={{color:"white"}} value="1W">1W</Tab>
                    </Grid>
                  </Tabs>
                </Flex>
              </Grid>
              <Box h="0%" w="100%" aspectRatio="2">
                <StockGraph symbol={symbol} stockData={filteredData.length > 1 ? filteredData : [currStockData]} timeRange={timeRange}/>
              </Box>
            </Box>
        </Box>
        <BuySellPanel symbol={symbol} currStockData={currStockData}/>
      </Grid>
  </Grid>
  );
};

export default StockDetailContainer;
