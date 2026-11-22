import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import earningsService from "@/api/services/earnings.service";
import VendorEarningsDetailsDialog from "@/components/earnings/VendorEarningsDetailsDialog";
import VendorEarningsSummaryCards from "@/components/earnings/VendorEarningsSummaryCards";
import VendorEarningsTransactionsTable from "@/components/earnings/VendorEarningsTransactionsTable";
import type {
  IEarningsPagination,
  IVendorEarningsSummary,
  IVendorEarningsTransaction,
} from "@/types/earnings";

export const EarningsPage: React.FC = () => {
  const [summary, setSummary] = useState<IVendorEarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<
    IVendorEarningsTransaction[]
  >([]);
  const [pagination, setPagination] = useState<IEarningsPagination | null>(null);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);
  const [isLoadingTransactions, setIsLoadingTransactions] =
    useState<boolean>(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);

  // Selected Order for Details Dialog
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Search debounce
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1); // Reset to page 1 on new search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch summary once on mount
  const fetchSummary = useCallback(async () => {
    try {
      setIsLoadingSummary(true);
      const res = await earningsService.getEarningsSummary();
      setSummary(res.data);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load earnings summary",
      );
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Fetch transactions whenever page, debouncedSearch, or statusFilter changes
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoadingTransactions(true);
      const res = await earningsService.getEarningsTransactions({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });

      setTransactions(res.data || []);
      setPagination(res.pagination || null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to load earnings transactions",
      );
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards */}
      <VendorEarningsSummaryCards
        summary={summary}
        isLoading={isLoadingSummary}
      />

      {/* 2. Earnings History Table */}
      <VendorEarningsTransactionsTable
        transactions={transactions}
        pagination={pagination}
        currentPage={page}
        isLoading={isLoadingTransactions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={setPage}
        onViewDetails={(orderId) => setSelectedOrderId(orderId)}
      />

      {/* 3. Earnings Details Dialog */}
      <VendorEarningsDetailsDialog
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
