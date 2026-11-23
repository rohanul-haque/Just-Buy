import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { IMonthlyEarning } from "@/types/dashboard";
import { BarChart3 } from "lucide-react";
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  salesRevenue: {
    label: "Sales Revenue",
    color: "#2563EB",
  },
} satisfies ChartConfig;

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data,
  title = "Monthly Sales Overview",
  subtitle = "Total monthly sales revenue & earnings",
  legendLabel = "Sales Revenue ($)",
}) => {
  // Construct chronological 12 months with accurate sales numbers
  const chartData = Array.from({ length: 12 }, (_, idx) => {
    const monthNum = idx + 1;
    const shortName = SHORT_MONTHS[idx];
    const found = data?.find(
      (d) => d.monthNumber === monthNum || d.month === shortName,
    );
    const revenue = found ? Number(found.totalIncome) || 0 : 0;

    return {
      month: shortName,
      monthLabel: shortName,
      fullName: found?.month || shortName,
      salesRevenue: revenue,
    };
  });

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full">
      {/* Header - Icon, Title, Subtitle & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
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

        {/* Top-Right Legend */}
        <div className="flex items-center gap-2 self-start sm:self-center text-xs font-semibold text-[#334155]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0" />
          <span>{legendLabel}</span>
        </div>
      </div>

      {/* Bar Chart representing Monthly Sales */}
      <div className="pt-2 h-[320px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 15,
              right: 15,
              left: -10,
              bottom: 0,
            }}
          >
            {/* Horizontal dashed grid lines */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#F1F5F9"
            />

            {/* Y-axis formatting currency amounts */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              domain={[
                0,
                (dataMax: number) =>
                  Math.max(1000, Math.ceil(dataMax / 1000) * 1000),
              ]}
              tickFormatter={(v) => `$${Number(v).toLocaleString("en-US")}`}
            />

            {/* X-axis showing month names */}
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "#F1F5F9" }}
              tickMargin={10}
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
            />

            {/* Custom Tooltip showing monthly sales */}
            <ChartTooltip
              cursor={{
                fill: "#F1F5F9",
                radius: 4,
              }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, _, item) => (
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="text-[#94A3B8]">
                        {item.payload?.fullName || "Sales"}:
                      </span>
                      <span className="font-mono font-bold text-white">
                        ${Number(value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                />
              }
            />

            {/* Bar elements with rounded corners and primary color */}
            <Bar
              dataKey="salesRevenue"
              fill="#2563EB"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default MonthlyEarningsChart;
