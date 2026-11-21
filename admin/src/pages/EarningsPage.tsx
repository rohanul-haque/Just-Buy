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
      {isLoading && !loaderData ? (
        <EarningsTableSkeleton />
      ) : (
        <>
          {/* 1. Earnings Summary Cards */}
          <EarningsSummaryCards summary={summary} />

          {/* 2. Earnings Transactions Table with Pagination */}
          <EarningsTransactionsTable
            transactions={transactions}
            pagination={pagination}
            currentPage={currentPage}
            isLoading={isLoading}
            onViewDetails={(orderId) => setSelectedOrderId(orderId)}
          />
        </>
      )}

      {/* 3. Order Details Dialog */}
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
