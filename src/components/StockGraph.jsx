import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { Box } from "@chakra-ui/react";

const StockGraph = ({ symbol, stockData, timeRange }) => {
  const [filteredData, setFilteredData] = useState(stockData);

  useEffect(() => {
    filterData();
  }, [timeRange, stockData]);

  const filterData = () => {
    const now = new Date();
    let filtered;

    switch (timeRange) {
      case '1H':
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.localTimestamp) >= new Date(now - 60 * 60 * 1000)
        );
        break;
      case '1D':
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.localTimestamp) >= new Date(now - 24 * 60 * 60 * 1000)
        );
        break;
      case '1W':
        filtered = stockData.filter(dataPoint =>
          new Date(dataPoint.localTimestamp) >= new Date(now - 7 * 24 * 60 * 60 * 1000)
        );
        break;
      default:
        filtered = stockData;
    }

    setFilteredData(filtered);
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const data = {
    labels: filteredData.map((dataPoint) => formatTimestamp(dataPoint.localTimestamp)),
    datasets: [
      {
        label: [],
        data: filteredData.map((dataPoint) => dataPoint.price),
        fill: false,
        borderColor: (context) => {
          const latestPoint = context.chart.data.datasets[0].data[0];
          const mostRecentPoint = filteredData[filteredData.length - 1];

          let condition = true;
          if (latestPoint && mostRecentPoint) {
            condition = latestPoint < mostRecentPoint.price;
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
