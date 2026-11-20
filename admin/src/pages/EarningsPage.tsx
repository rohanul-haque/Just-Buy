import EarningsSummaryCards from "@/components/earnings/EarningsSummaryCards";
import EarningsTableSkeleton from "@/components/earnings/EarningsTableSkeleton";
import EarningsTransactionsTable from "@/components/earnings/EarningsTransactionsTable";
import OrderDetailsDialog from "@/components/earnings/OrderDetailsDialog";
import type { EarningsLoaderData } from "@/types/earnings";
import React, { useState } from "react";
import { useLoaderData, useNavigation } from "react-router";

export const EarningsPage: React.FC = () => {
  const loaderData = useLoaderData() as EarningsLoaderData | undefined;
  const navigation = useNavigation();

  const summary = loaderData?.summary ?? { todayIncome: 0, totalIncome: 0 };
  const transactions = loaderData?.transactions ?? [];
  const pagination = loaderData?.pagination ?? null;
  const currentPage = loaderData?.page ?? 1;

  const isLoading = navigation.state === "loading";

  // Selected order state for Order Details Dialog
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Page Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
          Earnings
        </h2>
        <p className="text-sm text-[#4B5563] mt-1 font-normal">
          Track admin commissions and monitor earnings from delivered orders.
        </p>
      </div>

      {isLoading ? (
        <EarningsTableSkeleton />
      ) : (
        <>
          {/* 2. Earnings Summary Cards */}
          <EarningsSummaryCards summary={summary} />

          {/* 3. Earnings Transactions Table (All Orders, Search removed) */}
          <EarningsTransactionsTable
            transactions={transactions}
            pagination={pagination}
            currentPage={currentPage}
            onViewDetails={(orderId) => setSelectedOrderId(orderId)}
          />
        </>
      )}

      {/* 4. Order Details Dialog */}
      <OrderDetailsDialog
        open={!!selectedOrderId}
        orderId={selectedOrderId}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null);
        }}
      />
    </div>
  );
};

export default EarningsPage;
