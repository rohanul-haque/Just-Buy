import React from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import SummaryCard from "@/components/ui/SummaryCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IOrderStatistics } from "@/types/order";

interface OrderStatisticsCardsProps {
  statistics: IOrderStatistics | null;
  isLoading: boolean;
  error?: string | null;
}

export const OrderStatisticsCards: React.FC<OrderStatisticsCardsProps> = ({
  statistics,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
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
      {error && !statistics && (
        <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626]">
          Unable to load order statistics. Showing default values.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* 1. Total Orders */}
        <SummaryCard
          title="Total Orders"
          value={formatNumber(statistics?.totalOrders)}
          icon={<ShoppingBag />}
          iconBackgroundColor="bg-[#4F46E5]"
        />

        {/* 2. Cancelled Orders */}
        <SummaryCard
          title="Cancelled Orders"
          value={formatNumber(statistics?.cancelledOrders)}
          icon={<XCircle />}
          iconBackgroundColor="bg-[#EF4444]"
        />

        {/* 3. Delivered Orders */}
        <SummaryCard
          title="Delivered Orders"
          value={formatNumber(statistics?.deliveredOrders)}
          icon={<CheckCircle2 />}
          iconBackgroundColor="bg-[#10B981]"
        />

        {/* 4. Shipping Orders */}
        <SummaryCard
          title="Shipping Orders"
          value={formatNumber(statistics?.shippingOrders)}
          icon={<Truck />}
          iconBackgroundColor="bg-[#06B6D4]"
        />

        {/* 5. Online Payments */}
        <SummaryCard
          title="Online Payments"
          value={formatNumber(statistics?.onlinePayments)}
          icon={<CreditCard />}
          iconBackgroundColor="bg-[#8B5CF6]"
        />

        {/* 6. Offline Payments */}
        <SummaryCard
          title="Offline Payments"
          value={formatNumber(statistics?.offlinePayments)}
          icon={<Banknote />}
          iconBackgroundColor="bg-[#F59E0B]"
        />
      </div>
    </div>
  );
};

export default OrderStatisticsCards;
