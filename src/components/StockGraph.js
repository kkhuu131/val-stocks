import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import socketIOClient from "socket.io-client";
import teamData from "../teamMappings.json";

const StockGraph = ({ symbol, stockData }) => {
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    elements: {
      point: {
        borderWidth: 0,
        radius: 10,
        backgroundColor: "rgba(0,0,0,0)",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ width: "1000px", height: "500px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default StockGraph;
