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
export default function BreachChart() {
  const chartData = {
    labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Number of Breaches",
        data: [1200, 1500, 1800, 2100, 2400, 2000],
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
