import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import SmallDisplayStockGraph from "./SmallDisplayStockGraph";
import { Box, Flex, Image, Text, LinkBox, LinkOverlay, Tooltip } from "@chakra-ui/react";

const StockDisplayRow = ({ stock }) => {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stockData/${stock.symbol}`
        );
        const data = response.data;

        setStockData(data);

        // const currentTime = new Date();
        // const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

        // const filteredData = data.filter((dataPoint) => {
        //   const dataPointTime = new Date(dataPoint.timestamp);
        //   return dataPointTime >= oneDayAgo;
        // });

        // setStockData(filteredData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
    fetchStockData();

    // const socket = io("http://localhost:5000");
    // socket.on("newStockData", (newStockData) => {
    //   if (newStockData.symbol === stock.symbol) {
    //     setStockData((prevStockData) => [...prevStockData, newStockData]);
    //   }
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, [stock.symbol]);

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
