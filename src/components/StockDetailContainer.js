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

  useEffect(() => {
    const socket = io("http://localhost:5000");

    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stockData/${symbol}`
        );
        setStockData(response.data);

        const response2 = await axios.get(
          `http://localhost:5000/currentStockData/${symbol}`
        );
        setCurrStockData(response2.data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    socket.on("newStockData", (newStockData) => {
      if (newStockData.symbol === symbol) {
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
    <Box>
      <Box>
        <Box>
          <Heading>{currStockData.price && currStockData.price}</Heading>
        </Box>
        <Box>
          <Text>
            {stockData[0] && (
              <>
                {(() => {
                  const percentageChange =
                    Math.round(
                      (currStockData.price / stockData[0].price - 1) * 100 * 100
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
      <Grid templateColumns="1fr 1fr">
        <Flex alignItems="right">
          <StockGraph symbol={symbol} stockData={stockData} />
        </Flex>
        <Flex alignItems="right">
          <Grid templateRows="1fr 5fr">
            <Flex>
              <Image
                src={teamData["teamBySymbolMap"][symbol].img}
                alt={"{symbol} Logo"}
                width="50px"
                height="50px"
              />
              <Text>
                {teamData["teamBySymbolMap"][symbol].name} {symbol}
              </Text>
            </Flex>
            <Flex>
              <BuyForm symbol={symbol} />
              <SellForm symbol={symbol} />
            </Flex>
          </Grid>
        </Flex>
      </Grid>
    </Box>
  );
};

export default StockDetailContainer;
