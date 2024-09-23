import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { Box } from "@chakra-ui/react";


const StockGraph = ({ symbol, stockData, timeRange }) => {
  const isSinglePoint = stockData.length <= 1;

  const adjustedData = isSinglePoint
    ? [
        { timestamp: Date.now(), price: stockData[0]?.price || 0 }, 
        { timestamp: Date.now(), price: stockData[0]?.price || 0 }
      ]
    : stockData;
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    let options;

    if (timeRange === 2) {
      options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
    } else {
      options = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
    }

    return date.toLocaleString("en-US", options);
  };

  const data = {
    labels: adjustedData.map((dataPoint) => isSinglePoint ? formatTimestamp(dataPoint.timestamp) : formatTimestamp(dataPoint.localTimestamp)),
    datasets: [
      {
        label: [],
        data: adjustedData.map((dataPoint) => dataPoint.price),
        fill: false,
        borderColor: (context) => {
          const latestPoint = context.chart.data.datasets[0].data[0];
          const mostRecentPoint = stockData[stockData.length - 1];

          let condition = true;
          if (latestPoint && mostRecentPoint) {
            condition = latestPoint < mostRecentPoint.price;
          }

          if (isSinglePoint) {
            return '#757575'
          }
          return condition ? "#0ea371" : "#dc4a41";
        },
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return "$" + context.dataset.data[context.dataIndex].toFixed(2);
          },
        },
        displayColors: false,
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
      <Box w="100%" h="100%">
        <Line data={data} options={options} />
      </Box>
  );
};

export default StockGraph;
