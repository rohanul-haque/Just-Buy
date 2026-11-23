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
  title?: string;
  subtitle?: string;
  unit?: string;
}

// Purple/blue color palette matching reference image 2
const PALETTE = [
  "#4338CA", // Deep Royal Indigo
  "#7C3AED", // Vibrant Purple
  "#9333EA", // Bright Magenta-Purple
  "#4F46E5", // Indigo
  "#6366F1", // Indigo Violet
  "#8B5CF6", // Medium Violet
  "#A855F7", // Fuchsia Purple
];

const DEFAULT_SAMPLE_CATEGORIES = [
  {
    status: "NEXTJS",
    statusLabel: "Next.js Developer",
    count: 1,
    percentage: 33.3,
  },
  {
    status: "FLUTTER",
    statusLabel: "Flutter Developer",
    count: 1,
    percentage: 33.3,
  },
  {
    status: "PYTHON",
    statusLabel: "Python Developer",
    count: 1,
    percentage: 33.3,
  },
];

const chartConfig = {
  count: {
    label: "Vacancies",
    color: "#7C3AED",
  },
} satisfies ChartConfig;

export const OrderDistributionChart: React.FC<OrderDistributionChartProps> = ({
  data,
  title = "Category Distribution",
  subtitle = "Active job vacancies per taxonomy category.",
  unit = "vacancies",
}) => {
  // Format categories nicely for chart display
  const hasRealData =
    data && data.length > 0 && data.some((item) => Number(item.count) > 0);

  const chartData = hasRealData
    ? (data || []).map((item) => {
        const raw = item.status || "UNKNOWN";
        const formatted =
          raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();

        return {
          status: raw,
          statusLabel: formatted,
          count: Number(item.count) || 0,
          percentage: item.percentage || 0,
        };
      })
    : DEFAULT_SAMPLE_CATEGORIES;

  return (
    <Card className="rounded-2xl border border-slate-100 bg-white shadow-xs p-6 sm:p-7 flex flex-col justify-between h-full">
      {/* Header - Icon, Title, Subtitle (Clean layout without border divider) */}
      <div className="flex items-center gap-3.5 pb-4">
        {/* Rounded light purple icon container */}
        <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
          <FolderTree className="w-5 h-5 stroke-[2.2]" />
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

      {/* Official shadcn/ui Bar Chart with chunky rounded top corners & angled labels */}
      <div className="pt-2 h-[320px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full aspect-auto"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 15,
              right: 10,
              left: -25,
              bottom: 25,
            }}
          >
            {/* Subtle horizontal dashed grid lines, no vertical lines */}
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="#F1F5F9"
            />

            {/* Y-axis on the left with clean numbers 0, 1, 2, 3, 4 */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 500 }}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.max(4, dataMax)]}
            />

            {/* X-axis with angled category labels along the bottom */}
            <XAxis
              dataKey="statusLabel"
              tickLine={false}
              axisLine={{ stroke: "#F1F5F9" }}
              tickMargin={8}
              tick={{ fill: "#475569", fontSize: 10.5, fontWeight: 500 }}
              angle={-35}
              textAnchor="end"
              interval={0}
              height={60}
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
                          {unit}
                        </span>
                      </span>
                    </div>
                  )}
                />
              }
            />

            {/* Vertical chunky rounded bars with purple/blue palette matching reference */}
            <Bar dataKey="count" radius={[12, 12, 0, 0]} maxBarSize={48}>
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
