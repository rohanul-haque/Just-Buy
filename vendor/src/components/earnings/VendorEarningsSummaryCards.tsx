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
    return `৳${(Number(val) || 0).toLocaleString("en-US", {
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
            className="p-4 bg-white border border-[#E5E7EB] rounded-lg shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-11 h-11 rounded-md shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-20" />
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
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#10B981]"
      />
      <SummaryCard
        title="Monthly Earnings"
        value={formatCurrency(safeSummary.monthlyEarnings)}
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#0284C7]"
      />
      <SummaryCard
        title="All-Time Earnings"
        value={formatCurrency(safeSummary.allTimeEarnings)}
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#4F46E5]"
      />
    </div>
  );
};

export default VendorEarningsSummaryCards;
