import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { IMonthlyEarning } from "@/types/dashboard";
import { Activity } from "lucide-react";
import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MonthlyEarningsChartProps {
  data: IMonthlyEarning[];
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

const chartConfig = {
  earnings: {
    label: "Delivered Earnings",
    color: "#2563EB",
  },
} satisfies ChartConfig;

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data,
}) => {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);

  // Ensure all 12 months are accounted for
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const found = data?.find((d) => d.monthNumber === monthNum);
    const shortName = SHORT_MONTHS[i];
    return {
      month: shortName,
      monthLabel: `${shortName} ${yearSuffix}`,
      fullName: found?.month || shortName,
      earnings: found ? Number(found.totalIncome) || 0 : 0,
    };
  });

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header - Icon, Title, Subtitle & Top-Right Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5E7EB] gap-3">
        <div className="flex items-center gap-3.5">
          {/* Rounded light blue icon container */}
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Application Activity Overview
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-normal">
              Monthly platform earnings over time
            </p>
          </div>
        </div>

        {/* Legend aligned to top-right */}
        <div className="flex items-center gap-2 self-start sm:self-center text-xs font-semibold text-[#334155]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
          <span>Applications Submitted</span>
        </div>
      </div>

      {/* Official shadcn/ui Area Chart with smooth curve & subtle gradient */}
      <div className="pt-6 h-[320px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 15,
              right: 15,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="earningsAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#2563EB" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            {/* Subtle horizontal dashed grid lines, no vertical lines */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#F1F5F9"
            />

            {/* Y-axis on the left, clean numbers without axis line */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => {
                if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
                return `$${v}`;
              }}
            />

            {/* X-axis along bottom with clean baseline and month labels */}
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tickMargin={10}
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
            />

            {/* Professional hover tooltip */}
            <ChartTooltip
              cursor={{
                stroke: "#CBD5E1",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              content={
                <ChartTooltipContent
                  indicator="dot"
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

            {/* Smooth curved area line with subtle blue gradient fill */}
            <Area
              dataKey="earnings"
              type="natural"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#earningsAreaGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#2563EB",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default MonthlyEarningsChart;
