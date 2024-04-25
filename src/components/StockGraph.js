import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";

const StockGraph = ({ symbol }) => {
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
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
  }, [symbol]);

  const data = {
    labels: stockData.map((dataPoint) => dataPoint.timestamp),
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
    <div>
      <h2>Stock Price Graph for {symbol}</h2>
      <Line data={data} />
    </div>
  );
};

export default StockGraph;
