import { Card } from "@/components/ui/card";
import type { IDashboardSummary } from "@/types/dashboard";
import { DollarSign, ShoppingBag, Store, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router";

interface DashboardSummaryCardsProps {
  summary: IDashboardSummary;
}

interface SummaryCardItemProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  link?: string;
}

const SummaryCardItem: React.FC<SummaryCardItemProps> = ({
  title,
  value,
  subtitle,
  icon,
  link,
}) => {
  const content = (
    <Card className="rounded-md p-6 border-[#E5E7EB] bg-white flex flex-col justify-between shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-[28px] font-extrabold text-[#0F172A] leading-8">
          {value}
        </h4>
        <p className="text-xs text-[#4B5563] mt-2 font-normal">{subtitle}</p>
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

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  summary,
}) => {
  const formattedIncome = `$${Number(summary?.totalIncome || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

  const formattedSales = Number(summary?.totalSales || 0).toLocaleString("en-US");
  const formattedUsers = Number(summary?.totalUsers || 0).toLocaleString("en-US");
  const formattedVendors = Number(summary?.totalVendors || 0).toLocaleString(
    "en-US",
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <SummaryCardItem
        title="Total Income"
        value={formattedIncome}
        subtitle="Recognized from delivered orders"
        icon={<DollarSign className="w-5 h-5" />}
        link="/earnings"
      />
      <SummaryCardItem
        title="Total Sales"
        value={formattedSales}
        subtitle="Product units sold platform-wide"
        icon={<ShoppingBag className="w-5 h-5" />}
      />
      <SummaryCardItem
        title="Total Users"
        value={formattedUsers}
        subtitle="Registered buyers & vendors"
        icon={<Users className="w-5 h-5" />}
        link="/buyers"
      />
      <SummaryCardItem
        title="Total Vendors"
        value={formattedVendors}
        subtitle="Approved vendor stores"
        icon={<Store className="w-5 h-5" />}
        link="/vendors"
      />
    </div>
  );
};

export default DashboardSummaryCards;
