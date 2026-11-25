import SummaryCard from "@/components/ui/SummaryCard";
import type { IDashboardSummary } from "@/types/dashboard";
import { ShoppingBag, Store, Users } from "lucide-react";
import React from "react";
import { GrMoney } from "react-icons/gr";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      <SummaryCard
        title="Total Income"
        value={formattedIncome}
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#DDE0FF]"
        iconColor="text-[#4338CA]"
        link="/earnings"
      />
      <SummaryCard
        title="Total sales"
        value={formattedSales}
        icon={<ShoppingBag />}
        iconBackgroundColor="bg-[#D2F6FF]"
        iconColor="text-[#0284C7]"
      />
      <SummaryCard
        title="Total Users"
        value={formattedUsers}
        icon={<Users />}
        iconBackgroundColor="bg-[#DDE0FF]"
        iconColor="text-[#4338CA]"
        link="/buyers"
      />
      <SummaryCard
        title="Total Vendors"
        value={formattedVendors}
        icon={<Store />}
        iconBackgroundColor="bg-[#FFCEB0]"
        iconColor="text-[#EA580C]"
        link="/vendors"
      />
    </div>
  );
};

export default DashboardSummaryCards;
