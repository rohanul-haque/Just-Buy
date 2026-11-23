import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";

interface EarningsBarChartProps {
  data: IMonthlyCount[];
  isLoading?: boolean;
}

const SHORT_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const EarningsBarChart: React.FC<EarningsBarChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between h-full">
        <div className="space-y-2 pb-4 border-b border-[#E5E7EB]">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="py-6 h-[260px] flex items-center justify-center">
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

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs flex flex-col justify-between h-full pt-0">
      <CardHeader className="border-b border-[#E5E7EB] py-5 px-6">
        <CardTitle className="text-base font-bold text-[#0F172A]">
          Earning Overview
        </CardTitle>
        <CardDescription className="text-xs text-[#64748B] mt-1">
          Monthly earnings from delivered orders
        </CardDescription>
      </CardHeader>

      <CardContent className="px-3 pt-6 pb-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: -16,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />

            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fill: "#64748B", fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickFormatter={(value) => `$${Number(value).toLocaleString("en-US")}`}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value) => (
                    <span className="font-mono font-bold text-white">
                      $
                      {Number(value).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                />
              }
            />

            <Bar
              dataKey="earnings"
              fill="var(--color-earnings)"
              radius={4}
              maxBarSize={32}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EarningsBarChart;
