import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  IEarningsPagination,
  IEarningsTransaction,
} from "@/types/earnings";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Receipt,
} from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

interface EarningsTransactionsTableProps {
  transactions: IEarningsTransaction[];
  pagination: IEarningsPagination | null;
  currentPage: number;
  onViewDetails: (orderId: string) => void;
}

export const EarningsTransactionsTable: React.FC<
  EarningsTransactionsTableProps
> = ({ transactions, pagination, currentPage, onViewDetails }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const totalPages = pagination?.totalPages || 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const formatCurrency = (val: number) => {
    return `৳${(Number(val) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (val?: string | Date) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (transactions.length === 0) {
    const isSearch = searchParams.get("search");
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          No earnings transactions found
        </h3>
        <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
          {isSearch
            ? `No delivered order matches "${isSearch}". Try adjusting your search term.`
            : "No commissions recorded yet. Commissions are generated when customer orders are marked as Delivered."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5 pl-6">
                Transaction ID
              </TableHead>
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5">
                Name
              </TableHead>
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5">
                Commission
              </TableHead>
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5">
                Date
              </TableHead>
              <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider py-3.5 text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx._id}
                className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors"
              >
                {/* 1. Transaction ID */}
                <TableCell className="py-3.5 pl-6">
                  <span className="font-mono text-xs font-semibold text-[#0F172A] bg-[#F1F5F9] px-2 py-1 rounded-sm border border-[#E2E8F0]">
                    {tx.transactionId}
                  </span>
                </TableCell>

                {/* 2. Name */}
                <TableCell className="py-3.5 text-sm font-medium text-[#0F172A]">
                  {tx.buyerName}
                </TableCell>

                {/* 3. Amount */}
                <TableCell className="py-3.5 text-sm font-semibold text-[#0F172A]">
                  {formatCurrency(tx.amount)}
                </TableCell>

                {/* 4. Commission (15% Admin commission highlighted) */}
                <TableCell className="py-3.5 text-sm">
                  <span className="inline-flex items-center font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-sm border border-[#D1FAE5]">
                    {formatCurrency(tx.commission)}
                  </span>
                </TableCell>

                {/* 5. Date */}
                <TableCell className="py-3.5 text-sm text-[#4B5563]">
                  {formatDate(tx.date)}
                </TableCell>

                {/* 6. Actions */}
                <TableCell className="py-3.5 text-right pr-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(tx.orderId)}
                    className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                    title="View order and commission details"
                    aria-label="View order details"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-sm text-[#4B5563]">
          <div>
            Page {currentPage} of {totalPages}
            {pagination && (
              <span className="ml-1 text-[#6B7280]">
                ({pagination.total} delivered orders)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 px-3 rounded-md border-[#E5E7EB] bg-white text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-3 rounded-md border-[#E5E7EB] bg-white text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTransactionsTable;
