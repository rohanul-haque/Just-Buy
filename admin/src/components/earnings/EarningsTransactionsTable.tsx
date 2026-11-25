import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  IEarningsPagination,
  IEarningsTransaction,
} from "@/types/earnings";
import { ChevronLeft, ChevronRight, Info, Receipt } from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

interface EarningsTransactionsTableProps {
  transactions: IEarningsTransaction[];
  pagination: IEarningsPagination | null;
  currentPage: number;
  isLoading?: boolean;
  onViewDetails: (orderId: string) => void;
}

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, "...", total);
  } else if (current >= total - 2) {
    pages.push(1, "...", total - 2, total - 1, total);
  } else {
    pages.push(1, "...", current, "...", total);
  }
  return pages;
};

export const EarningsTransactionsTable: React.FC<
  EarningsTransactionsTableProps
> = ({
  transactions,
  pagination,
  currentPage,
  isLoading = false,
  onViewDetails,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const total = pagination?.total ?? transactions.length;
  const limit = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? Math.ceil(total / limit) ?? 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

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
          <Badge className="bg-[#CB4E01]/10 text-[#CB4E01] border-transparent font-semibold">
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

  if (!isLoading && transactions.length === 0) {
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
      <div className="rounded-xl border border-[#ffceb0]/60 bg-[#FFE7D9] overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#fe6201] text-white">
            <TableRow className="border-b border-[#fe6201] hover:bg-[#fe6201]">
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 pl-6 align-middle">
                Transaction ID
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 px-4 align-middle">
                Name
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 px-4 align-middle">
                Amount
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 px-4 align-middle">
                Commission
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 px-4 align-middle">
                Order Type
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 px-4 align-middle">
                Date
              </TableHead>
              <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2 pr-6 text-right align-middle">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-[#FFE7D9]">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#ffceb0]/40">
                    <TableCell className="py-3 pl-6">
                      <Skeleton className="h-6 w-24 rounded-sm" />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-28 rounded-sm" />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-16 rounded-sm" />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-5 w-16 rounded-sm" />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-5 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-20 rounded-sm" />
                    </TableCell>
                    <TableCell className="py-3 pr-6 text-right">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : transactions.map((tx) => {
                  const isDelivered = tx.status?.toUpperCase() === "DELIVERED";

                  return (
                    <TableRow
                      key={tx._id}
                      className="border-b border-[#ffceb0]/40 hover:bg-[#ffceb0]/40 transition-colors"
                    >
                      {/* 1. Transaction ID */}
                      <TableCell className="py-3 pl-6 align-middle">
                        <span className="font-mono text-xs font-semibold text-[#0F172A] bg-white/70 px-2 py-1 rounded-sm border border-[#ffceb0]/60">
                          {tx.transactionId}
                        </span>
                      </TableCell>

                      {/* 2. Name */}
                      <TableCell className="py-3 px-4 text-sm font-medium text-[#0F172A] align-middle">
                        {tx.buyerName}
                      </TableCell>

                      {/* 3. Amount */}
                      <TableCell className="py-3 px-4 text-sm font-semibold text-[#0F172A] align-middle">
                        {formatCurrency(tx.amount)}
                      </TableCell>

                      {/* 4. Commission (Only Delivered orders show realized commission, otherwise ৳0.00) */}
                      <TableCell className="py-3 px-4 text-sm align-middle">
                        {isDelivered ? (
                          <span className="inline-flex items-center font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-sm border border-[#D1FAE5]">
                            {formatCurrency(tx.commission)}
                          </span>
                        ) : (
                          <span className="text-[#9CA3AF] font-medium">
                            ৳0.00
                          </span>
                        )}
                      </TableCell>

                      {/* 5. Order Type (Current Order Status Badge) */}
                      <TableCell className="py-3 px-4 align-middle">
                        {getStatusBadge(tx.status)}
                      </TableCell>

                      {/* 6. Date */}
                      <TableCell className="py-3 px-4 text-sm text-[#4B5563] align-middle">
                        {formatDate(tx.date)}
                      </TableCell>

                      {/* 7. Actions */}
                      <TableCell className="py-3 pr-6 text-right align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(tx.orderId)}
                          className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#fe6201] hover:bg-[#ffceb0]/60 transition-colors"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-[#4B5563]">
          <div>
            Showing{" "}
            <span className="font-semibold text-[#0F172A]">{startRecord}</span>–
            <span className="font-semibold text-[#0F172A]">{endRecord}</span> of{" "}
            <span className="font-semibold text-[#0F172A]">{total}</span>{" "}
            transactions
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev || isLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 px-2.5 rounded-md border-[#ffceb0]/60 bg-[#FFE7D9] text-xs font-medium text-[#0F172A] hover:bg-[#ffceb0]/40 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`dots-${idx}`}
                    className="px-1.5 text-xs text-[#9CA3AF]"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handlePageChange(Number(p))}
                    className={cn(
                      "h-8 w-8 p-0 text-xs rounded-md",
                      p === currentPage
                        ? "bg-[#fe6201] text-white hover:bg-[#e55801] border-[#fe6201] font-bold"
                        : "border-[#ffceb0]/60 bg-[#FFE7D9] text-[#0F172A] hover:bg-[#ffceb0]/40",
                    )}
                  >
                    {p}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext || isLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-2.5 rounded-md border-[#ffceb0]/60 bg-[#FFE7D9] text-xs font-medium text-[#0F172A] hover:bg-[#ffceb0]/40 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTransactionsTable;
