import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { Box, useTheme } from "@chakra-ui/react";


const StockGraph = ({ symbol, stockData, timeRange }) => {
  const isSinglePoint = stockData.length <= 1;
  const theme = useTheme();
  

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
        intersect: false,
        displayColors: false,
        titleFont: {
          family: theme.fonts.heading,
          size: 12,
        },
        bodyFont: {
          family: theme.fonts.body,
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
          font: {
            family: theme.fonts.body
          }
        },
      },
      y: {
        grid: {
          borderDash: [5, 5], // Creates a dashed grid line [5px dash, 5px gap]
          color: "rgba(238, 238, 238, 0.2)", // Set the color of the dashed lines
        },
        ticks: {
          font: {
            family: theme.fonts.body
          },
          maxTicksLimit: 5,
        },
      }
    },
    elements: {
      point: {
        borderWidth: 0,
        radius: 20,
        backgroundColor: "rgba(0,0,0,0)",
      },
    },
    interaction: {
      mode: 'index', // Hovering over the x-axis triggers the effect on the point(s)
      axis: 'x', // Effect is triggered based on the x-axis
    },
    hover: {
      mode: 'nearest', // Hover nearest point
      intersect: false, // Triggers when hovering near any point in the x-axis level
    },

  };

  return (
      <Box w="100%" h="100%">
        <Line data={data} options={options} />
      </Box>
  );
};

export default StockGraph;
