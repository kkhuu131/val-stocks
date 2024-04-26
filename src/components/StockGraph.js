import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import socketIOClient from "socket.io-client";
import teamData from "../teamMappings.json";

const StockGraph = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const socket = socketIOClient("http://localhost:5000");

    const fetchStockData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stockData/${symbol}`
        );
        setStockData(response.data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    socket.on("newStockData", (newStockData) => {
      if (newStockData.symbol === symbol) {
        setStockData((prevStockData) => [...prevStockData, newStockData]);
      }
    });

    // Clean up listener when component unmounts
    return () => {
      socket.off("newStockData");
    };
  }, [symbol]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const data = {
    labels: stockData.map((dataPoint) => formatTimestamp(dataPoint.timestamp)),
    datasets: [
      {
        label: "Stock Price",
        data: stockData.map((dataPoint) => dataPoint.price),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ width: "70%", height: "auto" }}>
      <h2>Stock Price Graph for {symbol}</h2>
      <img src={teamData["teamBySymbolMap"][symbol].img} />
      <Line data={data} />
    </div>
  );
};

export default StockGraph;
