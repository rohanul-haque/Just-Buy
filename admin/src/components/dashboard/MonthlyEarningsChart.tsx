import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import type { IMonthlyEarning } from "@/types/dashboard";
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
  earnings: {
    label: "Earning",
    color: "#fe6201",
  },
} satisfies ChartConfig;

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data,
}) => {
  // Construct chronological 12 months with accurate earnings numbers
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
      earnings: revenue,
    };
  });

  // Calculate dynamic maximum revenue to scale YAxis accurately ($15k, $10k, $15 etc.)
  const maxRevenue = Math.max(...chartData.map((d) => d.earnings), 0);
  const roundedMax =
    maxRevenue === 0
      ? 10000
      : maxRevenue <= 20
      ? Math.ceil(maxRevenue / 5) * 5
      : maxRevenue <= 100
      ? Math.ceil(maxRevenue / 20) * 20
      : maxRevenue <= 1000
      ? Math.ceil(maxRevenue / 200) * 200
      : Math.ceil(maxRevenue / 2000) * 2000;

  const formatYAxisTick = (val: number) => {
    if (val === 0) return "$0k";
    if (val >= 1000) {
      const kVal = val / 1000;
      return `$${Number.isInteger(kVal) ? kVal : kVal.toFixed(1)}k`;
    }
    return `$${val}`;
  };

  return (
    <Card className="rounded-2xl border border-[#ffceb0]/60 bg-[#FFE7D9] shadow-xs p-6 sm:p-8 flex flex-col justify-between h-full w-full">
      {/* Header matching reference image: Title 'Earnings' on Left */}
      <div className="flex items-center justify-between pb-6">
        <h3 className="text-xl font-bold text-[#1F2937] tracking-tight">
          Earnings
        </h3>
      </div>

      {/* Bar Chart representing Monthly Earnings */}
      <div className="pt-2 h-[340px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 25,
              right: 15,
              left: -10,
              bottom: 0,
            }}
          >
            {/* Solid Horizontal grid lines matching reference screenshot */}
            <CartesianGrid
              vertical={false}
              stroke="#E2A684"
              strokeOpacity={0.6}
            />

            {/* Y-axis formatting ($0k, $2k, $4k, $6k, $8k, $10k, $15 etc.) */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
              domain={[0, roundedMax]}
              tickCount={6}
              tickFormatter={formatYAxisTick}
            />

            {/* X-axis showing Jan, Feb, Mar with dark baseline */}
            <XAxis
              dataKey="monthLabel"
              tickLine={true}
              axisLine={{ stroke: "#B07A58", strokeWidth: 1.5 }}
              tickMargin={10}
              tick={{ fill: "#374151", fontSize: 12, fontWeight: 500 }}
            />

            {/* Custom Tooltip styled exactly like $8.24k orange pill in screenshot */}
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const value = Number(payload[0]?.value) || 0;
                let formattedValue = `$${value}`;
                if (value >= 1000) {
                  formattedValue = `$${(value / 1000).toFixed(2)}k`;
                }

                return (
                  <div className="bg-[#FFC09F] border border-[#FE6201]/20 rounded-md px-3 py-1.5 shadow-sm text-center">
                    <span className="text-xs font-semibold text-[#1F2937]">
                      {formattedValue}
                    </span>
                  </div>
                );
              }}
            />

            {/* Solid Orange Slim Vertical Bars matching screenshot */}
            <Bar
              dataKey="earnings"
              fill="#FE6201"
              radius={[3, 3, 0, 0]}
              maxBarSize={22}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default MonthlyEarningsChart;
