import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import SmallDisplayStockGraph from "./SmallDisplayStockGraph";
import { Box, Flex, Image, Text } from "@chakra-ui/react";

const StockDisplayRow = ({ stock }) => {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stockData/${stock.symbol}`
        );
        const data = response.data;
        const currentTime = new Date();
        const oneDayAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);

        const filteredData = data.filter((dataPoint) => {
          const dataPointTime = new Date(dataPoint.timestamp);
          return dataPointTime >= oneDayAgo;
        });

        setStockData(filteredData);
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
    <a
      href={`/stock/${stock.symbol}`}
      style={{ textDecoration: "none", color: "black" }}
    >
      <Box display="grid" gridTemplateColumns="1fr 4fr 1fr 1fr 1fr">
        <Flex alignItems="center">
          <Image
            src={teamData["teamBySymbolMap"][stock.symbol].img}
            alt={`Team logo for ${stock.symbol}`}
            width="100"
            height="100"
          />
        </Flex>
        <Flex alignItems="center">
          <Text>
            {teamData["teamBySymbolMap"][stock.symbol].name} {stock.symbol}
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <Text>${stock.price}</Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <Text>
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
        </Flex>
        <Flex alignItems="center" justifyContent="flex-end">
          <SmallDisplayStockGraph stockData={stockData} />
        </Flex>
      </Box>
    </a>
  );
};

export default StockDisplayRow;
