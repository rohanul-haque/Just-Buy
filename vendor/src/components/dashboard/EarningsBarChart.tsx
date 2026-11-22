import React from "react";
import { Wallet } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface EarningsBarChartProps {
  data: IMonthlyCount[];
  isLoading?: boolean;
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const EarningsBarChart: React.FC<EarningsBarChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between h-full">
        <div className="space-y-2 pb-4 border-b border-[#E5E7EB]">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="pt-4 h-[260px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </Card>
    );
  }

  // Ensure 12 months array for current year
  const monthlyValues = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const found = data?.find((d) => d.monthNumber === monthNum);
    return found ? Number(found.count) || 0 : 0;
  });

  const chartData = {
    labels: SHORT_MONTHS,
    datasets: [
      {
        label: "Delivered Earnings",
        data: monthlyValues,
        backgroundColor: "#0284C7",
        hoverBackgroundColor: "#0369A1",
        borderRadius: 4,
        maxBarThickness: 32,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0F172A",
        titleColor: "#CBD5E1",
        titleFont: {
          size: 11,
          weight: "bold",
        },
        bodyColor: "#FFFFFF",
        bodyFont: {
          size: 12,
          weight: "normal",
        },
        padding: { top: 8, bottom: 8, left: 12, right: 12 },
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const amount = Number(context.parsed.y || 0);
            return `$${amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748B",
          font: {
            size: 11,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94A3B8",
          font: {
            size: 11,
          },
          callback: (value) => `$${Number(value).toLocaleString("en-US")}`,
        },
        grid: {
          color: "#F1F5F9",
        },
        border: {
          dash: [3, 3],
          display: false,
        },
      },
    },
  };

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Top: Section Header */}
      <div className="pb-3 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A]">
            Earnings Overview
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Monthly earnings from delivered orders
          </p>
        </div>
        <div className="w-8 h-8 rounded-md bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom: Chart.js Bar Chart */}
      <div className="pt-4 h-[260px] w-full">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default EarningsBarChart;
