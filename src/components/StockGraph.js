import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

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

          return condition ? "green" : "red";
        },
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
    <div style={{ width: "1000px", height: "500px" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default StockGraph;
