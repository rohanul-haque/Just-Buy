import { Card, CardContent } from "@/components/ui/card";
import type { IOrderDistribution } from "@/types/dashboard";
import { PieChart as PieChartIcon } from "lucide-react";
import React, { useState } from "react";

interface OrderDistributionChartProps {
  data: IOrderDistribution[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; hoverColor: string }
> = {
  DELIVERED: {
    label: "Delivered",
    color: "#10B981", // Emerald
    hoverColor: "#059669",
  },
  SHIPPED: {
    label: "Shipped",
    color: "#8B5CF6", // Purple
    hoverColor: "#7C3AED",
  },
  PROCESSING: {
    label: "Processing",
    color: "#3B82F6", // Blue
    hoverColor: "#2563EB",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "#06B6D4", // Cyan
    hoverColor: "#0891B2",
  },
  PENDING: {
    label: "Pending",
    color: "#F59E0B", // Amber
    hoverColor: "#D97706",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#EF4444", // Red
    hoverColor: "#DC2626",
  },
};

export const OrderDistributionChart: React.FC<OrderDistributionChartProps> = ({
  data,
}) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const totalOrders = (data || []).reduce(
    (sum, item) => sum + (Number(item.count) || 0),
    0,
  );

  // Filter or sort statuses
  const statusItems = (data || []).map((item) => {
    const key = item.status?.toUpperCase() || "PENDING";
    const config = STATUS_CONFIG[key] || {
      label: item.status,
      color: "#6B7280",
      hoverColor: "#4B5563",
    };
    const count = Number(item.count) || 0;
    const percentage =
      totalOrders > 0
        ? Number(((count / totalOrders) * 100).toFixed(1))
        : 0;

    return {
      statusKey: key,
      label: config.label,
      color: config.color,
      hoverColor: config.hoverColor,
      count,
      percentage,
    };
  });

  // Calculate SVG Pie/Donut Slices
  const size = 200;
  const center = size / 2;
  const outerRadius = 80;
  const innerRadius = 52;

  let cumulativeAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const slices = statusItems.map((item) => {
    const sliceAngle =
      totalOrders > 0 ? (item.count / totalOrders) * 2 * Math.PI : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    if (item.count === 0 || sliceAngle === 0) {
      return null;
    }

    const isHovered = hoveredStatus === item.statusKey;
    const rOuter = isHovered ? outerRadius + 4 : outerRadius;
    const rInner = innerRadius;

    // Outer arc endpoints
    const x1 = center + rOuter * Math.cos(startAngle);
    const y1 = center + rOuter * Math.sin(startAngle);
    const x2 = center + rOuter * Math.cos(endAngle);
    const y2 = center + rOuter * Math.sin(endAngle);

    // Inner arc endpoints
    const x3 = center + rInner * Math.cos(endAngle);
    const y3 = center + rInner * Math.sin(endAngle);
    const x4 = center + rInner * Math.cos(startAngle);
    const y4 = center + rInner * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathData,
      isHovered,
    };
  });

  const activeHoveredItem = statusItems.find(
    (s) => s.statusKey === hoveredStatus,
  );

  return (
    <Card className="rounded-md border-[#E5E7EB] bg-white shadow-xs p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            Order Distribution
          </h3>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Platform orders by fulfillment status
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#4B5563] block">Total Orders</span>
          <span className="text-base font-extrabold text-[#0F172A]">
            {totalOrders.toLocaleString("en-US")}
          </span>
        </div>
      </div>

      <CardContent className="p-0 pt-4 flex flex-col md:flex-row items-center justify-center gap-6">
        {/* Donut Chart SVG */}
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full select-none"
            aria-label="Order distribution donut chart"
          >
            {totalOrders === 0 ? (
              // Empty Ring when no orders
              <circle
                cx={center}
                cy={center}
                r={(outerRadius + innerRadius) / 2}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={outerRadius - innerRadius}
              />
            ) : (
              // Active Slices
              slices.map((slice) => {
                if (!slice) return null;
                return (
                  <path
                    key={slice.statusKey}
                    d={slice.pathData}
                    fill={slice.isHovered ? slice.hoverColor : slice.color}
                    className="cursor-pointer transition-all duration-200 stroke-white stroke-2"
                    onMouseEnter={() => setHoveredStatus(slice.statusKey)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                );
              })
            )}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeHoveredItem ? (
              <>
                <span className="text-xs font-semibold text-[#4B5563] truncate max-w-[90px]">
                  {activeHoveredItem.label}
                </span>
                <span className="text-lg font-bold text-[#0F172A] leading-tight">
                  {activeHoveredItem.count}
                </span>
                <span className="text-[11px] font-medium text-[#4F46E5]">
                  {activeHoveredItem.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-[#4B5563] uppercase tracking-wider">
                  Orders
                </span>
                <span className="text-xl font-black text-[#0F172A] leading-tight">
                  {totalOrders.toLocaleString("en-US")}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">100% total</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 min-w-0">
          {totalOrders === 0 ? (
            <div className="text-center py-6 text-xs text-[#4B5563]">
              <PieChartIcon className="w-5 h-5 mx-auto text-[#4B5563]/50 mb-1" />
              No order transactions recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs">
              {statusItems.map((item) => {
                const isHovered = hoveredStatus === item.statusKey;
                return (
                  <div
                    key={item.statusKey}
                    onMouseEnter={() => setHoveredStatus(item.statusKey)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer border ${
                      isHovered
                        ? "bg-[#F8FAFC] border-[#CBD5E1]"
                        : "border-transparent hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span
                        className={`truncate ${
                          isHovered
                            ? "font-bold text-[#0F172A]"
                            : "text-[#4B5563]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-semibold text-[#0F172A]">
                        {item.count}
                      </span>
                      <span className="text-[10px] text-[#4B5563] ml-1">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDistributionChart;
