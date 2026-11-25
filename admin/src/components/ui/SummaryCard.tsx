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
  iconBackgroundColor = "bg-[#CB4E01]",
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
        "p-5 bg-[#FFE7D9] border border-[#ffceb0]/60 rounded-xl shadow-xs transition-all duration-200 hover:shadow-sm",
        onClick && "cursor-pointer",
        isActive && "border-[#CB4E01] ring-1 ring-[#CB4E01]",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Left: Circle icon container */}
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs [&>svg]:w-5 [&>svg]:h-5",
            !isCustomBg && iconBackgroundColor,
            iconColor,
          )}
          style={
            isCustomBg ? { backgroundColor: iconBackgroundColor } : undefined
          }
        >
          {icon}
        </div>

        {/* Right: Vertically stacked Value & Title */}
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold text-[#0F172A] leading-tight truncate">
            {value}
          </h3>
          <span className="text-xs font-medium text-[#64748B] block truncate mt-0.5">
            {title}
          </span>
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
