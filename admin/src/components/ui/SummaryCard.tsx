import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import { Link } from "react-router";

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBackgroundColor?: string;
  iconColor?: string;
  link?: string;
  onClick?: () => void;
  className?: string;
  subtitle?: string;
  isActive?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  iconBackgroundColor = "bg-[#4F46E5]",
  iconColor = "text-white",
  link,
  onClick,
  className = "",
  subtitle,
  isActive,
}) => {
  const isCustomBg =
    iconBackgroundColor?.startsWith("#") ||
    iconBackgroundColor?.startsWith("rgb");

  const content = (
    <Card
      className={cn(
        "p-5 bg-white border border-[#E5E7EB] rounded-xl shadow-xs transition-all duration-200 hover:shadow-sm",
        onClick && "cursor-pointer",
        isActive && "border-[#4F46E5] ring-1 ring-[#4F46E5]",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Left: Square icon container with rounded-md */}
        <div
          className={cn(
            "w-12 h-12 rounded-md flex items-center justify-center shrink-0 shadow-xs [&>svg]:w-6 [&>svg]:h-6",
            !isCustomBg && iconBackgroundColor,
            iconColor,
          )}
          style={
            isCustomBg ? { backgroundColor: iconBackgroundColor } : undefined
          }
        >
          {icon}
        </div>

        {/* Right: Vertically stacked Title & Value */}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block truncate">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-[#0F172A] leading-tight mt-1 truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  if (link) {
    return (
      <Link to={link} className="block focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
};

export default SummaryCard;
