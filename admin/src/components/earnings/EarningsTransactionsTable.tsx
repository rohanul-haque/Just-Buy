import { Badge } from "@/components/ui/badge";
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

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return (
          <Badge className="bg-[#10B981]/10 text-[#10B981] border-transparent font-semibold">
            Delivered
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#D97706] border-transparent font-semibold">
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-[#0284C7]/10 text-[#0284C7] border-transparent font-semibold">
            Processing
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-[#4F46E5]/10 text-[#4F46E5] border-transparent font-semibold">
            Confirmed
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-[#8B5CF6]/10 text-[#7C3AED] border-transparent font-semibold">
            Shipped
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-transparent font-semibold">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#6B7280]/10 text-[#4B5563] border-transparent font-semibold">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          No orders found
        </h3>
        <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
          No customer orders recorded in the system yet.
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
                Order Type
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
            {transactions.map((tx) => {
              const isDelivered = tx.status?.toUpperCase() === "DELIVERED";

              return (
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

                  {/* 4. Commission (Only Delivered orders show realized commission, otherwise ৳0.00) */}
                  <TableCell className="py-3.5 text-sm">
                    {isDelivered ? (
                      <span className="inline-flex items-center font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-sm border border-[#D1FAE5]">
                        {formatCurrency(tx.commission)}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] font-medium">৳0.00</span>
                    )}
                  </TableCell>

                  {/* 5. Order Type (Current Order Status Badge) */}
                  <TableCell className="py-3.5">
                    {getStatusBadge(tx.status)}
                  </TableCell>

                  {/* 6. Date */}
                  <TableCell className="py-3.5 text-sm text-[#4B5563]">
                    {formatDate(tx.date)}
                  </TableCell>

                  {/* 7. Actions */}
                  <TableCell className="py-3.5 text-right pr-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(tx.orderId)}
                      className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                      title="View order details"
                      aria-label="View order details"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
                ({pagination.total} total orders)
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
