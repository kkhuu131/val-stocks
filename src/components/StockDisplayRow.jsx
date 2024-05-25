import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import SmallDisplayStockGraph from "./SmallDisplayStockGraph";
import { Box, Grid, Flex, Image, Text, LinkBox, LinkOverlay, Tooltip, useMediaQuery } from "@chakra-ui/react";

const StockDisplayRow = ({ stock }) => {
  const [stockData, setStockData] = useState([]);
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if(!hasMounted) {
      const fetchStockData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/stockData/${stock.symbol}`
          );
          const data = response.data;
          const now = new Date();
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const filtered = data.filter(dataPoint =>
            new Date(dataPoint.timestamp) >= twentyFourHoursAgo
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
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" p="3">
              <Flex alignItems="center">
                  <Image
                    src={teamData["teamBySymbolMap"][stock.symbol].img}
                    alt={`Team logo for ${stock.symbol}`}
                    width="50"
                    height="50"
                    objectFit="cover"
                  />
              </Flex>
              <Flex
                alignItems="center"
                justifyContent="flex-end"
                marginLeft={2}
                marginRight={2}
              >
                <Grid templateRows="1fr">
                  <Text m={1} fontSize={16} fontWeight="bold" color="white">
                    ${stock.price}
                  </Text>
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
                </Grid>
              </Flex>
              <Flex
                alignItems="center"
                justifyContent="flex-end"
                marginLeft={2}
                marginRight={2}
              >
                <SmallDisplayStockGraph stockData={stockData} />
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
          <Box display="grid" gridTemplateColumns="1fr 2fr 16fr 4fr 3fr 3fr 1fr">
            <Flex />
            <Flex alignItems="center" justifyContent="left">
              <Image
                src={teamData["teamBySymbolMap"][stock.symbol].img}
                alt={`Team logo for ${stock.symbol}`}
                width="50"
                height="50"
                objectFit="cover"
                marginTop={4}
                marginBottom={4}
              />
            </Flex>
            <Flex alignItems="center" justifyContent="left">
              <Text m={1} fontSize={20} fontWeight="bold" color="white">
                {teamData["teamBySymbolMap"][stock.symbol].name}
              </Text>
              <Text m={1} fontSize={16} color={"grayAlpha.50"}>
                {stock.symbol}
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="flex-end"
              marginLeft={2}
              marginRight={2}
            >
              <Text m={1} fontSize={16} fontWeight="bold" color="white">
                ${stock.price}
              </Text>
            </Flex>
            <Flex
              alignItems="center"
              justifyContent="flex-end"
              marginLeft={2}
              marginRight={2}
            >
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
            <Flex
              alignItems="center"
              justifyContent="flex-end"
              marginLeft={2}
              marginRight={2}
            >
              <SmallDisplayStockGraph stockData={stockData} />
            </Flex>
            <Flex />
          </Box>
        </LinkOverlay>
      </LinkBox>
    </Tooltip>
  );
};

export default StockDisplayRow;
