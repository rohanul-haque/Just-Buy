import React from "react";
import { CheckCircle2, Package, XCircle } from "lucide-react";
import SummaryCard from "@/components/ui/SummaryCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IProductStatistics } from "@/types/product";

interface ProductStatisticsCardsProps {
  statistics: IProductStatistics | null;
  isLoading: boolean;
  error?: string | null;
}

export const ProductStatisticsCards: React.FC<ProductStatisticsCardsProps> = ({
  statistics,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card
            key={idx}
            className="p-5 bg-white border border-[#E5E7EB] rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const formatNumber = (num?: number | null) =>
    Number(num || 0).toLocaleString("en-US");

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-xs text-[#EF4444] bg-[#FEF2F2] p-2.5 rounded-md border border-[#FCA5A5]">
          Failed to load product statistics: {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* 1. Total Products */}
        <SummaryCard
          title="Total Products"
          value={formatNumber(statistics?.totalProducts)}
          icon={<Package />}
          iconBackgroundColor="bg-[#4F46E5]"
        />

        {/* 2. Active Products */}
        <SummaryCard
          title="Active Products"
          value={formatNumber(statistics?.activeProducts)}
          icon={<CheckCircle2 />}
          iconBackgroundColor="bg-[#10B981]"
        />

        {/* 3. Inactive Products */}
        <SummaryCard
          title="Inactive Products"
          value={formatNumber(statistics?.inactiveProducts)}
          icon={<XCircle />}
          iconBackgroundColor="bg-[#EF4444]"
        />
      </div>
    </div>
  );
};

export default ProductStatisticsCards;
