import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";

interface SalesBarChartCardProps {
  totalSales: number;
  data: IMonthlyCount[];
  isLoading?: boolean;
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

export const SalesBarChartCard: React.FC<SalesBarChartCardProps> = ({
  totalSales,
  data,
  isLoading = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between h-full">
        <div className="space-y-2 pb-4 border-b border-[#E5E7EB]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="pt-4">
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </Card>
    );
  }

  // Ensure 12 months array
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const found = data?.find((d) => d.monthNumber === monthNum);
    return {
      month: found?.month || SHORT_MONTHS[i],
      monthShort: SHORT_MONTHS[i],
      monthNumber: monthNum,
      count: found ? Number(found.count) || 0 : 0,
    };
  });

  const maxCount = Math.max(...monthsData.map((m) => m.count), 5);
  // Round up max for nice axis ticks
  const chartMax = Math.ceil(maxCount / 5) * 5 || 5;

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = Math.round(chartMax * ratio);
    const y = paddingTop + chartHeight * (1 - ratio);
    return { val, y };
  });

  const slotWidth = chartWidth / 12;
  const barWidth = Math.min(26, slotWidth * 0.65);

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Top: Statistics Section */}
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
            Total Sales
          </span>
          <span className="text-2xl font-bold text-[#0F172A] mt-0.5 block">
            {totalSales.toLocaleString("en-US")}
          </span>
        </div>
        <div className="w-10 h-10 rounded-md bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom: Bar Chart */}
      <div className="pt-4 relative flex-1 flex flex-col justify-end">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Horizontal Grid lines & Y-Axis Labels */}
            {yTicks.map(({ val, y }, idx) => (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "none" : "3 3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-[#94A3B8] font-mono"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Bars & Labels */}
            {monthsData.map((d, idx) => {
              const isHovered = hoveredIndex === idx;
              const slotX = paddingLeft + idx * slotWidth;
              const barX = slotX + (slotWidth - barWidth) / 2;

              const valRatio = chartMax > 0 ? d.count / chartMax : 0;
              const barH = Math.max(0, chartHeight * valRatio);
              const barY = paddingTop + chartHeight - barH;

              return (
                <g key={idx}>
                  {/* Invisible Hit Area */}
                  <rect
                    x={slotX}
                    y={paddingTop}
                    width={slotWidth}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Bar Background Track */}
                  <rect
                    x={barX}
                    y={paddingTop}
                    width={barWidth}
                    height={chartHeight}
                    rx="3"
                    ry="3"
                    fill={isHovered ? "#F1F5F9" : "transparent"}
                    className="transition-colors pointer-events-none"
                  />

                  {/* Active Bar */}
                  {d.count > 0 && (
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      rx="3"
                      ry="3"
                      fill={isHovered ? "#0369A1" : "#0284C7"}
                      className="transition-all duration-200 pointer-events-none"
                    />
                  )}

                  {/* X-Axis Month Label */}
                  <text
                    x={slotX + slotWidth / 2}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered
                        ? "fill-[#0284C7] font-semibold"
                        : "fill-[#64748B]"
                    }`}
                  >
                    {d.monthShort}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && monthsData[hoveredIndex] && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-[#0F172A] text-white px-2.5 py-1.5 rounded-md text-xs shadow-lg transition-all duration-150 z-10"
            style={{
              left: `${
                ((paddingLeft +
                  hoveredIndex * slotWidth +
                  slotWidth / 2) /
                  svgWidth) *
                100
              }%`,
            }}
          >
            <div className="font-semibold text-[11px] text-[#CBD5E1]">
              {monthsData[hoveredIndex].month}
            </div>
            <div className="font-bold text-white text-xs mt-0.5">
              {monthsData[hoveredIndex].count} sold
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SalesBarChartCard;
