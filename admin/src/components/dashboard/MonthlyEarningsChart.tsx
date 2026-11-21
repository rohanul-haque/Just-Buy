import { Card, CardContent } from "@/components/ui/card";
import type { IMonthlyEarning } from "@/types/dashboard";
import { BarChart3 } from "lucide-react";
import React, { useState } from "react";

interface MonthlyEarningsChartProps {
  data: IMonthlyEarning[];
}

export const MonthlyEarningsChart: React.FC<MonthlyEarningsChartProps> = ({
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();

  // Ensure all 12 months are accounted for
  const months =
    data && data.length === 12
      ? data
      : [
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
        ].map((m, i) => {
          const found = data?.find((d) => d.monthNumber === i + 1);
          return {
            month: m,
            monthNumber: i + 1,
            totalIncome: found ? found.totalIncome : 0,
          };
        });

  const totalYearlyIncome = months.reduce(
    (sum, m) => sum + (Number(m.totalIncome) || 0),
    0,
  );

  const maxVal = Math.max(
    ...months.map((m) => Number(m.totalIncome) || 0),
    100,
  );
  // Round up max for nice axis ticks
  const chartMax = Math.ceil((maxVal * 1.15) / 50) * 50;

  // SVG Chart Dimensions
  const svgWidth = 640;
  const svgHeight = 280;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = chartMax * ratio;
    const y = paddingTop + chartHeight * (1 - ratio);
    return { val, y };
  });

  const barCount = 12;
  const slotWidth = chartWidth / barCount;
  const barWidth = Math.min(28, slotWidth * 0.65);

  const formatCurrency = (val: number) => {
    return `$${Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCompact = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  const shortMonthNames = [
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

  return (
    <Card className="rounded-md border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5E7EB] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#0F172A]">
              Monthly Earnings
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#4F46E5]">
              {currentYear}
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Admin commission recognized from delivered orders
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs text-[#4B5563] block">Year Total</span>
          <span className="text-base font-extrabold text-[#4F46E5]">
            {formatCurrency(totalYearlyIncome)}
          </span>
        </div>
      </div>

      <CardContent className="p-0 pt-4 relative">
        {/* Tooltip Hover Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 pointer-events-none bg-[#0F172A] text-white text-xs rounded-md py-1.5 px-3 shadow-lg transform -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${
                ((paddingLeft + hoveredIndex * slotWidth + slotWidth / 2) /
                  svgWidth) *
                100
              }%`,
              top: `${
                ((paddingTop +
                  chartHeight *
                    (1 -
                      Math.max(
                        0,
                        Number(months[hoveredIndex].totalIncome || 0),
                      ) /
                        chartMax)) /
                  svgHeight) *
                100
              }%`,
              marginTop: "-8px",
            }}
          >
            <div className="font-semibold">{months[hoveredIndex].month}</div>
            <div className="text-[#818CF8] font-bold">
              {formatCurrency(months[hoveredIndex].totalIncome)}
            </div>
          </div>
        )}

        {/* SVG Bar Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[540px] select-none"
            aria-label="Monthly earnings bar chart"
          >
            {/* Grid lines and Y-axis labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={tick.y}
                  x2={svgWidth - paddingRight}
                  y2={tick.y}
                  stroke="#E5E7EB"
                  strokeDasharray={i === 0 ? "0" : "3 3"}
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-[#4B5563] text-[10px] font-medium"
                >
                  {formatCompact(tick.val)}
                </text>
              </g>
            ))}

            {/* Bars and X-axis Month labels */}
            {months.map((item, index) => {
              const val = Number(item.totalIncome) || 0;
              const barHeight =
                chartMax > 0 ? (val / chartMax) * chartHeight : 0;
              const x =
                paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
              const y = paddingTop + chartHeight - barHeight;
              const isHovered = hoveredIndex === index;

              return (
                <g
                  key={item.monthNumber}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Invisible broad hitbox for easy hovering */}
                  <rect
                    x={paddingLeft + index * slotWidth}
                    y={paddingTop}
                    width={slotWidth}
                    height={chartHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* The bar */}
                  <rect
                    x={x}
                    y={barHeight > 0 ? y : paddingTop + chartHeight - 2}
                    width={barWidth}
                    height={barHeight > 0 ? barHeight : 2}
                    rx="3"
                    className={`transition-colors duration-200 ${
                      isHovered
                        ? "fill-[#3730A3]"
                        : val > 0
                          ? "fill-[#4F46E5]"
                          : "fill-[#E5E7EB]"
                    }`}
                  />

                  {/* Month Label */}
                  <text
                    x={paddingLeft + index * slotWidth + slotWidth / 2}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered
                        ? "fill-[#4F46E5] font-bold"
                        : "fill-[#4B5563]"
                    }`}
                  >
                    {shortMonthNames[index]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {totalYearlyIncome === 0 && (
          <div className="text-center py-2 text-xs text-[#4B5563]">
            <BarChart3 className="w-4 h-4 mx-auto text-[#4B5563]/50 mb-1 inline mr-1.5" />
            No delivered order earnings recorded for this year yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyEarningsChart;
