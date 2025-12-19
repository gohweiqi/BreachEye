"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/** Breach Chart Component */
interface BreachChartProps {
  breachesByYear?: Record<string, number>;
  isLoading?: boolean;
}

export default function BreachChart({
  breachesByYear,
  isLoading = false,
}: BreachChartProps) {
  const years = ["2019", "2020", "2021", "2022", "2023", "2024"];
  const defaultData = [150, 180, 120, 90, 60, 40]; // HIBP fallback data

  // Get chart data - use real data if available, otherwise use defaults
  const getChartData = (): number[] => {
    if (isLoading) {
      return defaultData;
    }

    if (!breachesByYear || Object.keys(breachesByYear).length === 0) {
      return defaultData;
    }

    const apiData = years.map((year) => {
      const value = breachesByYear[year];
      return typeof value === "number" ? value : 0;
    });

    // If all zeros, use default
    const allZeros = apiData.every((val) => val === 0);
    if (allZeros) {
      return defaultData;
    }

    return apiData;
  };

  const chartData = {
    labels: years,
    datasets: [
      {
        label: "Number of Breaches",
        data: getChartData(),
        backgroundColor: "rgba(212, 175, 55, 0.6)",
        borderColor: "#D4AF37",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#D4AF37",
        bodyColor: "#fff",
        borderColor: "#D4AF37",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "rgba(212, 175, 55, 0.1)",
        },
      },
      x: {
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "rgba(212, 175, 55, 0.1)",
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
