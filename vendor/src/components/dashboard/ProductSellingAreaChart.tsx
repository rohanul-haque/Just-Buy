import React from "react";
import { Package } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";

interface ProductSellingAreaChartProps {
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
  products: {
    label: "Products Sold",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const ProductSellingAreaChart: React.FC<ProductSellingAreaChartProps> = ({
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
      products: found ? Number(found.count) || 0 : 0,
    };
  });

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs flex flex-col justify-between h-full pt-0">
      {/* 1. Production Overview Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-[#E5E7EB] py-5 px-6">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base font-bold text-[#0F172A]">
            Production Overview
          </CardTitle>
          <CardDescription className="text-xs text-[#64748B]">
            Monthly delivered product sales quantity
          </CardDescription>
        </div>
        {/* Parcel/Package icon on the right side */}
        <div className="w-9 h-9 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
          <Package className="w-4 h-4" />
        </div>
      </CardHeader>

      <CardContent className="px-3 pt-6 pb-6 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              left: -16,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillProducts" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-products)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-products)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fill: "#64748B", fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              allowDecimals={false}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => (
                    <span className="font-mono font-bold text-white">
                      {Number(value).toLocaleString("en-US")}{" "}
                      <span className="font-normal text-xs text-[#94A3B8]">
                        sold
                      </span>
                    </span>
                  )}
                />
              }
            />

            <Area
              dataKey="products"
              type="natural"
              fill="url(#fillProducts)"
              stroke="var(--color-products)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#FFFFFF",
                stroke: "var(--color-products)",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5.5,
                fill: "var(--color-products)",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProductSellingAreaChart;
