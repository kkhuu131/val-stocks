import React, { useState, useEffect } from "react";
import axios from "axios";
import teamData from "../teamMappings.json";
import io from "socket.io-client";
import StockGraph from "./StockGraph";
import BuyForm from "./BuyForm";
import SellForm from "./SellForm";

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
    <div>
      <div>
        <div>
          <h1>{currStockData.price && currStockData.price}</h1>
        </div>
        <div>
          <h2>
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
          </h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div
          style={{
            display: "flex",
            alignItems: "right",
          }}
        >
          <StockGraph symbol={symbol} stockData={stockData} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "right",
          }}
        >
          <img
            src={teamData["teamBySymbolMap"][symbol].img}
            alt={"{symbol} Logo"}
            width="50px"
            height="50px"
          />
          <p>
            {teamData["teamBySymbolMap"][symbol].name} {symbol}
          </p>

          <BuyForm symbol={symbol} />
          <SellForm symbol={symbol} />
        </div>
      </div>
    </div>
  );
};

export default StockDetailContainer;
