import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import socketIOClient from "socket.io-client";
import teamData from "../teamMappings.json";

const SmallDisplayStockGraph = ({ stockData }) => {
  const data = {
    labels: stockData.map((dataPoint) => dataPoint.timestamp),
    datasets: [
      {
        label: [],
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
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    hover: { mode: null },
    animation: {
      duration: 0,
    },
  };

  return (
    <div style={{ width: "100px", height: "50px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default SmallDisplayStockGraph;
