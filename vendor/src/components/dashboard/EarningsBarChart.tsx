import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  "July",
  "Augst",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#FE6201",
  },
} satisfies ChartConfig;

export const EarningsBarChart: React.FC<EarningsBarChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[#ffceb0]/60 bg-[#FFE7D9] shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full">
        <div className="pb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="py-6 h-[270px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </Card>
    );
  }

  // Ensure 12 months array for the current year
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const found = data?.find((d) => d.monthNumber === monthNum);
    return {
      month: SHORT_MONTHS[i],
      earnings: found ? Number(found.count) || 0 : 0,
    };
  });

  // Calculate dynamic maximum to scale Y-axis ticks gracefully (e.g. 0 to 100)
  const maxVal = Math.max(...chartData.map((d) => d.earnings), 0);
  const roundedMax =
    maxVal === 0
      ? 100
      : maxVal <= 20
      ? Math.ceil(maxVal / 5) * 5
      : maxVal <= 100
      ? Math.ceil(maxVal / 20) * 20
      : maxVal <= 1000
      ? Math.ceil(maxVal / 200) * 200
      : Math.ceil(maxVal / 2000) * 2000;

  return (
    <Card className="rounded-2xl border border-[#ffceb0]/60 bg-[#FFE7D9] shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full w-full">
      {/* Header: Exactly Title 'Earning Overview' (No growth, no dropdown) */}
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-xl font-bold text-[#1F2937] tracking-tight">
          Earning Overview
        </h3>
      </div>

      <div className="pt-2 h-[280px] w-full">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full w-full"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 15,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            {/* Horizontal orange grid lines matching reference screenshot */}
            <CartesianGrid
              vertical={false}
              stroke="#FE8534"
              strokeOpacity={0.65}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: "#374151", fontSize: 11, fontWeight: 500 }}
            />

            {/* Y-Axis */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#374151", fontSize: 11, fontWeight: 500 }}
              domain={[0, roundedMax]}
              tickCount={6}
            />

            {/* Custom Tooltip */}
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const value = Number(payload[0]?.value) || 0;
                let formattedValue = `$${value.toLocaleString("en-US")}`;
                if (value >= 1000) {
                  formattedValue = `$${(value / 1000).toFixed(2)}k`;
                }
                return (
                  <div className="bg-[#FFC09F] border border-[#FE6201]/30 rounded-md px-3 py-1.5 shadow-sm text-center">
                    <span className="text-xs font-bold text-[#1F2937]">
                      {formattedValue}
                    </span>
                  </div>
                );
              }}
            />

            {/* Orange Slim Vertical Bars matching reference screenshot */}
            <Bar
              dataKey="earnings"
              fill="#FE6201"
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default EarningsBarChart;
