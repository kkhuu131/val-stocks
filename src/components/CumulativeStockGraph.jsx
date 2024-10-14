import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import teamData from "../teamMappings.json";
import { Box, useTheme } from "@chakra-ui/react";
import { supabase } from "../supabase";


const CumulativeStockGraph = ({ }) => {
  const chartRef = useRef();
  const [stockData, setStockData] = useState([]);
  const [groupedStockData, setGroupedStockData] = useState([]);
  const theme = useTheme();
  

  const convertToLocaleTime = (data) => {
    return data.map(item => {
      return {
        ...item,
        localTimestamp: new Date(item.timestamp)
      };
    });
  };

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const { data, error } = await supabase.rpc('fetch_at_specific_hour', { hour: 10 })

      if (error) {
        console.error("Error fetching stock data:", error);
        throw error;
      }

        const localizedData = convertToLocaleTime(data);
        localizedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        await setStockData(localizedData);
        
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, []);

  useEffect(() => {
    if (stockData.length > 0) {
        const groupedData = stockData.reduce((acc, current) => {
            const { symbol, timestamp, price } = current;
            if (!acc[symbol]) {
                acc[symbol] = { timestamps: [], prices: [] };
            }
            acc[symbol].timestamps.push(new Date(timestamp).toLocaleDateString());
            acc[symbol].prices.push(price);
            return acc;
        }, {});
        setGroupedStockData(groupedData);
    }
  }, [stockData]);

  const data = {
    labels: [...new Set(stockData.map((point) => new Date(point.timestamp).toLocaleDateString()))],
    datasets: Object.keys(groupedStockData).map((team) => {
      const prices = groupedStockData[team].prices;
      const latestPrice = prices[0];
      const mostRecentPrice = prices[prices.length - 1];
      
      return {
        label: team,
        data: prices,
        borderColor: () => {
          if (latestPrice && mostRecentPrice) {
            return mostRecentPrice > latestPrice ? "#0ea371" : "#dc4a41"; // Green for increase, red for decrease
          }
          return "#757575";
        },
        fill: false,
        tension: 0.1,
        clip: 30,
        mostRecentPrice: mostRecentPrice
      };
    }).sort((a, b) => b.mostRecentPrice - a.mostRecentPrice),
  };

  const getPointStyle = (datapoint) => {
    const datasetLength = datapoint.chart.data.labels.length - 1;
    const datasetLabel = datapoint.dataset.label;

    const image = new Image();
    image.src = teamData.teamBySymbolMap[datasetLabel].img
    image.height = 45;
    image.width = 45;

    const stylePointArray = [];
    for (let i = 0; i < datasetLength; i++) {
        stylePointArray.push('circle');
    }
    stylePointArray.push(image);
    return stylePointArray;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
        point: {
            pointStyle: getPointStyle,
            radius: 10,
            borderWidth: 0,
            backgroundColor: "rgba(0,0,0,0)",
        }
    },
    animation: false,
    hover: {
      mode: null,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": $" + context.dataset.data[context.dataIndex].toFixed(2);
          },
        },
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
        // min: 0,
      }
    },
  };

  return (
      <Box w="100%" h="100%">
        <Line data={data} options={options} ref={chartRef}/>
      </Box>
  );
};

export default CumulativeStockGraph;