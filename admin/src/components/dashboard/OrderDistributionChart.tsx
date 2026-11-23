import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { IOrderDistribution } from "@/types/dashboard";
import { FolderTree } from "lucide-react";
import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

interface OrderDistributionChartProps {
  data: IOrderDistribution[];
}

// Purple/blue color palette matching reference image 2
const PALETTE = [
  "#4F46E5", // Royal Indigo
  "#6366F1", // Indigo Violet
  "#7C3AED", // Vibrant Purple
  "#8B5CF6", // Medium Violet
  "#9333EA", // Bright Purple
  "#A855F7", // Fuchsia Purple
];

const chartConfig = {
  count: {
    label: "Orders",
    color: "#7C3AED",
  },
} satisfies ChartConfig;

export const OrderDistributionChart: React.FC<OrderDistributionChartProps> = ({
  data,
}) => {
  // Format categories nicely for chart display
  const chartData = (data || []).map((item) => {
    const raw = item.status || "UNKNOWN";
    // Title case status name
    const formatted =
      raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

    return {
      status: raw,
      statusLabel: formatted,
      count: Number(item.count) || 0,
      percentage: item.percentage || 0,
    };
  });

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between h-full">
      {/* Header - Icon, Title, Subtitle */}
      <div className="flex items-center gap-3.5 pb-6 border-b border-[#E5E7EB]">
        {/* Rounded light purple icon container */}
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
          <FolderTree className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Category Distribution
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 font-normal">
            Active orders per taxonomy category.
          </p>
        </div>
      </div>

      {/* Official shadcn/ui Bar Chart with rounded top corners & angled labels */}
      <div className="pt-6 h-[320px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 15,
              right: 10,
              left: -20,
              bottom: 25,
            }}
          >
            {/* Subtle horizontal dashed grid lines, no vertical lines */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#F1F5F9"
            />

            {/* Y-axis on the left with clean numbers */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              allowDecimals={false}
            />

            {/* X-axis with angled category labels along the bottom */}
            <XAxis
              dataKey="statusLabel"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tickMargin={8}
              tick={{ fill: "#475569", fontSize: 10.5, fontWeight: 500 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={55}
            />

            {/* Professional hover tooltip */}
            <ChartTooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, item) => (
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="text-[#94A3B8]">
                        {item.payload?.statusLabel || name}:
                      </span>
                      <span className="font-mono font-bold text-white">
                        {Number(value).toLocaleString("en-US")}{" "}
                        <span className="font-normal text-xs text-[#94A3B8]">
                          orders
                        </span>
                      </span>
                    </div>
                  )}
                />
              }
            />

            {/* Vertical bars with rounded top corners and purple/blue palette */}
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default OrderDistributionChart;
