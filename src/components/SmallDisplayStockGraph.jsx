import React from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto"; // important
import { Box } from "@chakra-ui/react";

const SmallDisplayStockGraph = ({ stockData }) => {
  const data = {
    labels: stockData.map((dataPoint) => dataPoint.timestamp),
    datasets: [
      {
        label: [],
        data: stockData.map((dataPoint) => dataPoint.price),
        fill: false,
        borderColor: (context) => {
          const latestPoint = context.chart.data.datasets[0].data[0];
          const mostRecentPoint = stockData[stockData.length - 1];

          let condition = true;
          if (latestPoint && mostRecentPoint) {
            condition = latestPoint < mostRecentPoint.price;
          }

          return condition ? "#0ea371" : "#dc4a41";
        },
        tension: 0.1,
        borderWidth: 2,
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
    <Box width= {["75px", "100px"]} height= "50px">
      <Line data={data} options={options} />
    </Box>
  );
};

export default SmallDisplayStockGraph;
