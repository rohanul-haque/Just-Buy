import React, { useState } from "react";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IMonthlyCount } from "@/types/dashboard";

interface ProductsAreaChartCardProps {
  totalProducts: number;
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

export const ProductsAreaChartCard: React.FC<ProductsAreaChartCardProps> = ({
  totalProducts,
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

  // Calculate points for area chart
  const points = monthsData.map((d, index) => {
    const x =
      paddingLeft + (chartWidth / (monthsData.length - 1)) * index;
    const yRatio = chartMax > 0 ? d.count / chartMax : 0;
    const y = paddingTop + chartHeight * (1 - yRatio);
    return { x, y, ...d };
  });

  // Area path: start at bottom left, line to each point, line to bottom right, close
  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${
    points[points.length - 1].x
  } ${paddingTop + chartHeight} L ${points[0].x} ${
    paddingTop + chartHeight
  } Z`;

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Top: Statistics Section */}
      <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] block">
            Total Products
          </span>
          <span className="text-2xl font-bold text-[#0F172A] mt-0.5 block">
            {totalProducts.toLocaleString("en-US")}
          </span>
        </div>
        <div className="w-10 h-10 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
      </div>

      {/* Bottom: Area Chart */}
      <div className="pt-4 relative flex-1 flex flex-col justify-end">
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient
                id="productsAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
                <stop offset="85%" stopColor="#4F46E5" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

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

            {/* Area fill */}
            <path d={areaPath} fill="url(#productsAreaGradient)" />

            {/* Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover vertical guide line */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <line
                x1={points[hoveredIndex].x}
                y1={paddingTop}
                x2={points[hoveredIndex].x}
                y2={paddingTop + chartHeight}
                stroke="#6366F1"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}

            {/* Data point dots & invisible hover hit areas */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}>
                  {/* Invisible hit column */}
                  <rect
                    x={pt.x - chartWidth / 24}
                    y={paddingTop}
                    width={chartWidth / 12}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? "#4F46E5" : "#FFFFFF"}
                    stroke="#4F46E5"
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="pointer-events-none transition-all duration-150"
                  />

                  {/* X-axis Month Label */}
                  <text
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className={`text-[11px] font-medium transition-colors ${
                      isHovered
                        ? "fill-[#4F46E5] font-semibold"
                        : "fill-[#64748B]"
                    }`}
                  >
                    {pt.monthShort}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute -top-1 pointer-events-none transform -translate-x-1/2 bg-[#0F172A] text-white px-2.5 py-1.5 rounded-md text-xs shadow-lg transition-all duration-150 z-10"
            style={{
              left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
            }}
          >
            <div className="font-semibold text-[11px] text-[#CBD5E1]">
              {points[hoveredIndex].month}
            </div>
            <div className="font-bold text-white text-xs mt-0.5">
              {points[hoveredIndex].count} products
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductsAreaChartCard;
