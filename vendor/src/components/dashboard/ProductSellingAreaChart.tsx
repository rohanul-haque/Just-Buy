import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";
import { Activity } from "lucide-react";

interface ProductSellingAreaChartProps {
  data: IMonthlyCount[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
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

export const ProductSellingAreaChart: React.FC<ProductSellingAreaChartProps> = ({
  data,
  isLoading = false,
  title = "Application Activity Overview",
  subtitle = "Monthly applications submitted over time",
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-slate-100 bg-white shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full">
        <div className="pb-4 flex items-center gap-3.5">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="py-6 h-[260px] flex items-center justify-center">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </Card>
    );
  }

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  // Rolling 6-month window ending in current month matching reference image
  const chartData = Array.from({ length: 6 }, (_, idx) => {
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
      count: found ? Number(found.count) || 0 : 0,
    };
  });

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
          <span>Applications Submitted</span>
        </div>
      </div>

      {/* Official shadcn/ui Area Chart with smooth curve & subtle gradient */}
      <div className="pt-2 h-[300px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <AreaChart
            accessibilityLayer
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
                id="vendorActivityGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#F1F5F9"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(8, Math.ceil(dataMax / 2) * 2)]}
              tickFormatter={(v) => Number(v).toLocaleString("en-US")}
            />

            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "#F1F5F9" }}
              tickMargin={10}
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
            />

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

            <Area
              dataKey="count"
              type="natural"
              fill="url(#vendorActivityGradient)"
              stroke="#2563EB"
              strokeWidth={3}
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

export default ProductSellingAreaChart;
