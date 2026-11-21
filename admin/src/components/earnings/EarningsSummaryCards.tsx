import SummaryCard from "@/components/ui/SummaryCard";
import type { IEarningsSummary } from "@/types/earnings";
import React from "react";
import { GrMoney } from "react-icons/gr";

interface EarningsSummaryCardsProps {
  summary: IEarningsSummary;
}

export const EarningsSummaryCards: React.FC<EarningsSummaryCardsProps> = ({
  summary,
}) => {
  const formatCurrency = (val: number) => {
    return `$${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <SummaryCard
        title="Today's Income"
        value={formatCurrency(summary.todayIncome)}
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#10B981]"
      />
      <SummaryCard
        title="Total Income"
        value={formatCurrency(summary.totalIncome)}
        icon={<GrMoney />}
        iconBackgroundColor="bg-[#10B981]"
      />
    </div>
  );
};

export default EarningsSummaryCards;
