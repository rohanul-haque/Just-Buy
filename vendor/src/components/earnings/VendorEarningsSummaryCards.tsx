import React from "react";
import { GrMoney } from "react-icons/gr";
import SummaryCard from "@/components/ui/SummaryCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IVendorEarningsSummary } from "@/types/earnings";

interface VendorEarningsSummaryCardsProps {
  summary: IVendorEarningsSummary | null;
  isLoading?: boolean;
}

export const VendorEarningsSummaryCards: React.FC<
  VendorEarningsSummaryCardsProps
> = ({ summary, isLoading = false }) => {
  const formatCurrency = (val?: number | null) => {
    return `$${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card
            key={idx}
            className="p-5 bg-[#FFE7D9] border border-[#ffceb0]/60 rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const safeSummary: IVendorEarningsSummary = summary || {
    todayEarnings: 0,
    monthlyEarnings: 0,
    allTimeEarnings: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <SummaryCard
        title="Today's Earnings"
        value={formatCurrency(safeSummary.todayEarnings)}
        icon={<GrMoney className="w-5 h-5 text-[#4338CA]" />}
        iconBackgroundColor="#DDE0FF"
      />
      <SummaryCard
        title="Monthly Earnings"
        value={formatCurrency(safeSummary.monthlyEarnings)}
        icon={<GrMoney className="w-5 h-5 text-[#0284C7]" />}
        iconBackgroundColor="#D2F6FF"
      />
      <SummaryCard
        title="Total Earnings"
        value={formatCurrency(safeSummary.allTimeEarnings)}
        icon={<GrMoney className="w-5 h-5 text-[#4338CA]" />}
        iconBackgroundColor="#DDE0FF"
      />
    </div>
  );
};

export default VendorEarningsSummaryCards;
