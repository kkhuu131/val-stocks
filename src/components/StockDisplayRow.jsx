import React, { useState, useEffect } from "react";
import teamData from "../teamMappings.json";
import { supabase } from "../supabase";
import SmallDisplayStockGraph from "./SmallDisplayStockGraph";
import { Box, Grid, Flex, Image, Text, LinkBox, LinkOverlay, Tooltip, useMediaQuery, Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup, } from "@chakra-ui/react";

const StockDisplayRow = ({ stock }) => {
  const [stockData, setStockData] = useState([]);
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if(!hasMounted) {
      const fetchStockData = async () => {
        try {
          const { data, error } = await supabase
            .from("stock_prices")
            .select("*")
            .eq("symbol", stock.symbol)
            .order("timestamp", { ascending: true });

          if (error) {
            console.error("Error fetching stock data:", error);
            throw error;
          }

          const now = new Date();
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const filtered = data.filter(dataPoint =>
            {
              const ts = new Date(dataPoint.timestamp)
              return ts >= oneDayAgo && (ts.getMinutes() === 30 || ts.getMinutes() === 0);
            }
          );
  
          setStockData(filtered);
        } catch (error) {
          console.error("Error fetching stock data:", error);
        }
      };
      fetchStockData();
      setHasMounted(true);
    }
  }, [stock.symbol]);

  if(!isLargerThan768) {
    return(
      <Tooltip label={'Click to view ' + stock.symbol + ' details' } placement='right'>
        <LinkBox
          as="article"
          backgroundColor="grayAlpha.700"
          m={2}
          borderRadius="md"
        >
          <LinkOverlay
            href={`/stock/${stock.symbol}`}
            style={{ textDecoration: "none", color: "black" }}
          >
            <Box display="grid" gridTemplateColumns="1fr 2fr 1fr" p="3">
              <Flex alignItems="center">
                  {
                    <Image
                      src={teamData["teamBySymbolMap"][stock.symbol].img}
                      alt={`Team logo for ${stock.symbol}`}
                      width="50"
                      height="50"
                      minW="50"
                      minH="50"
                    />
                  }
              </Flex>
              
              <Flex/>

              <Flex
                alignItems="center"
                justifyContent="flex-end"
                marginLeft={2}
                marginRight={2}
              >
                <Grid templateRows="1fr">
                  <Flex
                    alignItems="center"
                    justifyContent="flex-end"
                    marginLeft={2}
                    marginRight={2}
                  >
                    <Stat>
                      <StatNumber fontSize={16} fontWeight="bold" color="white">
                        ${(stock.price).toFixed(2)}
                      </StatNumber>
                      {(stockData[0] && (
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
                            
                            if(percentageChange == 0) {
                              return (
                                <StatHelpText m={1} fontWeight="bold" color="gray.500">
                                  <StatArrow type='increase' color="gray.500"/>
                                  {String(0)}%
                                </StatHelpText>
                              );
                            }
                            else if(percentageChange > 0) {
                              return (
                                <StatHelpText m={1} fontWeight="bold" color="green.500">
                                  <StatArrow type='increase'/>
                                  +{String(percentageChange)}%
                                </StatHelpText>
                              );
                            }
                            else {
                              return (
                                <StatHelpText m={1} fontWeight="bold" color="red.500">
                                  <StatArrow type='decrease'/>
                                  -{String(percentageChange)}%
                                </StatHelpText>
                              );
                            }
                          })()}
                        </>
                      )) ||
                        <StatHelpText m={1} fontWeight="bold" color="gray.500">
                          <StatArrow type='increase' color="gray.500"/>
                          {String(0)}%
                        </StatHelpText>
                      }
                    </Stat>
                  </Flex>
                </Grid>
                <Flex
                  alignItems="center"
                  justifyContent="flex-end"
                  marginLeft={2}
                  marginRight={2}
                >
                  <SmallDisplayStockGraph stockData={stockData} />
                </Flex>
              </Flex>
            </Box>
          </LinkOverlay>
        </LinkBox>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={'Click to view ' + stock.symbol + ' details' } placement='right'>
      <LinkBox
        as="article"
        backgroundColor="grayAlpha.700"
        m={2}
        borderRadius="md"
      >
        <LinkOverlay
          href={`/stock/${stock.symbol}`}
          style={{ textDecoration: "none", color: "black" }}
        >
          <Box display="grid" gridTemplateColumns="2fr 10fr 4fr 3fr" px="5" maxWidth="600px">
            <Flex alignItems="center" justifyContent="left">
              <Image
                src={teamData["teamBySymbolMap"][stock.symbol].img}
                alt={`Team logo for ${stock.symbol}`}
                width="50"
                height="50"
                minW="50"
                minH="50"
                my="4"
              />
            </Flex>
            <Flex alignItems="center" justifyContent="left">
              <Text ml={3} fontSize={20} fontWeight="bold" color="white">
                {teamData["teamBySymbolMap"][stock.symbol].name}
              </Text>
              <Text m={2} fontSize={16} color={"grayAlpha.50"}>
                {stock.symbol}
              </Text>
            </Flex>
            <Flex/>
            <Flex
              alignItems="center"
              justifyContent="right"
            >
              <Stat>
                <StatNumber fontSize={16} fontWeight="bold" color="white">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  }).format(stock.price)}
                </StatNumber>
                {(stockData[0] && (
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
                      
                      if(percentageChange == 0) {
                        return (
                          <StatHelpText m={1} fontWeight="bold" color="gray.500">
                            <StatArrow type='increase' color="gray.500"/>
                            {String(0)}%
                          </StatHelpText>
                        );
                      }
                      else if(percentageChange > 0) {
                        return (
                          <StatHelpText m={1} fontWeight="bold" color="green.500">
                            <StatArrow type='increase'/>
                            +{String(percentageChange)}%
                          </StatHelpText>
                        );
                      }
                      else {
                        return (
                          <StatHelpText m={1} fontWeight="bold" color="red.500">
                            <StatArrow type='decrease'/>
                            -{String(percentageChange)}%
                          </StatHelpText>
                        );
                      }
                    })()}
                  </>
                )) ||
                  <StatHelpText m={1} fontWeight="bold" color="gray.500">
                    <StatArrow type='increase' color="gray.500"/>
                    0%
                  </StatHelpText>
                }
              </Stat>
              <Flex
                alignItems="center"
                justifyContent="right"
                ml="5"
              >
                <SmallDisplayStockGraph stockData={stockData} />
              </Flex>
            </Flex>
          </Box>
        </LinkOverlay>
      </LinkBox>
    </Tooltip>
  );
};

export default StockDisplayRow;
