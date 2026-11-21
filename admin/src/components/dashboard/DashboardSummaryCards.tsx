import SummaryCard from "@/components/ui/SummaryCard";
import type { IDashboardSummary } from "@/types/dashboard";
import { DollarSign, ShoppingBag, Store, Users } from "lucide-react";
import React from "react";

interface DashboardSummaryCardsProps {
  summary: IDashboardSummary;
}

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
      <SummaryCard
        title="Total Income"
        value={formattedIncome}
        icon={<DollarSign />}
        iconBackgroundColor="bg-[#10B981]"
        link="/earnings"
      />
      <SummaryCard
        title="Total Sales"
        value={formattedSales}
        icon={<ShoppingBag />}
        iconBackgroundColor="bg-[#3B82F6]"
      />
      <SummaryCard
        title="Total Users"
        value={formattedUsers}
        icon={<Users />}
        iconBackgroundColor="bg-[#6366F1]"
        link="/buyers"
      />
      <SummaryCard
        title="Total Vendors"
        value={formattedVendors}
        icon={<Store />}
        iconBackgroundColor="bg-[#8B5CF6]"
        link="/vendors"
      />
    </div>
  );
};

export default DashboardSummaryCards;
