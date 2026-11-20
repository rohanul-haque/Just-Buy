import { Card } from "@/components/ui/card";
import type { IEarningsSummary } from "@/types/earnings";
import { Coins, Wallet } from "lucide-react";
import React from "react";

interface EarningsSummaryCardsProps {
  summary: IEarningsSummary;
}

export const EarningsSummaryCards: React.FC<EarningsSummaryCardsProps> = ({
  summary,
}) => {
  const formatCurrency = (val: number) => {
    return `$ ${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1: Today's Income */}
      <Card className="p-6 bg-white border-[#E5E7EB] rounded-md shadow-xs">
        <div className="flex items-center gap-4">
          {/* Left Side: Money Icon */}
          <div className="w-12 h-12 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center border border-[#E0E7FF] shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          {/* Right Side: Title on top, Amount below */}
          <div>
            <p className="text-sm font-medium text-[#4B5563]">Today's Income</p>
            <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">
              {formatCurrency(summary.todayIncome)}
            </h3>
          </div>
        </div>
      </Card>

      {/* Card 2: Total Income */}
      <Card className="p-6 bg-white border-[#E5E7EB] rounded-md shadow-xs">
        <div className="flex items-center gap-4">
          {/* Left Side: Money Icon */}
          <div className="w-12 h-12 rounded-md bg-[#ECFDF5] text-[#10B981] flex items-center justify-center border border-[#D1FAE5] shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          {/* Right Side: Title on top, Amount below */}
          <div>
            <p className="text-sm font-medium text-[#4B5563]">Total Income</p>
            <h3 className="text-2xl font-bold text-[#0F172A] mt-0.5">
              {formatCurrency(summary.totalIncome)}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EarningsSummaryCards;
