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
  title?: string;
  subtitle?: string;
  legendLabel?: string;
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
  applications: {
    label: "Applications Submitted",
    color: "#2563EB",
  },
} satisfies ChartConfig;

const DEFAULT_SAMPLE_ACTIVITY = [
  { month: "Jun", monthLabel: "Jun 26", fullName: "June", count: 0 },
  { month: "Jul", monthLabel: "Jul 26", fullName: "July", count: 0 },
  { month: "Aug", monthLabel: "Aug 26", fullName: "August", count: 0 },
  { month: "Sep", monthLabel: "Sep 26", fullName: "September", count: 0 },
  { month: "Oct", monthLabel: "Oct 26", fullName: "October", count: 0 },
  { month: "Nov", monthLabel: "Nov 26", fullName: "November", count: 5 },
];

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data,
  title = "Application Activity Overview",
  subtitle = "Monthly applications submitted over time",
  legendLabel = "Applications Submitted",
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0-indexed

  const hasRealData =
    data && data.length > 0 && data.some((d) => Number(d.totalIncome) > 0);

  // Build rolling 6-month window ending at current month (e.g. Jun 26 to Nov 26) matching reference image
  const chartData = hasRealData
    ? Array.from({ length: 6 }, (_, idx) => {
        const mIdx = (currentMonthIdx - (5 - idx) + 12) % 12;
        const yearForMonth =
          currentMonthIdx - (5 - idx) < 0 ? currentYear - 1 : currentYear;
        const shortName = SHORT_MONTHS[mIdx];
        const monthNum = mIdx + 1;
        const found = data?.find(
          (d) => d.monthNumber === monthNum || d.month === shortName,
        );
        return {
          month: shortName,
          monthLabel: `${shortName} ${yearForMonth.toString().slice(-2)}`,
          fullName: found?.month || shortName,
          count: found ? Number(found.totalIncome) || 0 : 0,
        };
      })
    : DEFAULT_SAMPLE_ACTIVITY;

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full">
      {/* Header - Icon, Title, Subtitle & Top-Right Legend (Clean layout without border divider) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
        <div className="flex items-center gap-3.5">
          {/* Rounded light blue icon container */}
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-normal">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Legend aligned to top-right matching reference image */}
        <div className="flex items-center gap-2 self-start sm:self-center text-xs font-semibold text-[#334155]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
          <span>{legendLabel}</span>
        </div>
      </div>

      {/* Official shadcn/ui Area Chart with smooth curve & subtle gradient */}
      <div className="pt-2 h-[320px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 15,
              right: 15,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="activityAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Subtle horizontal dashed grid lines, no vertical lines */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#F1F5F9"
            />

            {/* Y-axis on the left, clean plain numbers 0, 2, 4, 6, 8 without axis line */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              domain={[
                0,
                (dataMax: number) => Math.max(8, Math.ceil(dataMax / 2) * 2),
              ]}
              tickFormatter={(v) => Number(v).toLocaleString("en-US")}
            />

            {/* X-axis along bottom with clean baseline and month labels */}
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "#F1F5F9" }}
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
                      {Number(value).toLocaleString("en-US")}
                    </span>
                  )}
                />
              }
            />

            {/* Smooth curved area line with subtle blue gradient fill */}
            <Area
              dataKey="count"
              type="natural"
              stroke="#2563EB"
              strokeWidth={3}
              fill="url(#activityAreaGradient)"
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
