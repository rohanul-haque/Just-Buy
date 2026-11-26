import React from "react";
import { Eye, Receipt, Search, X } from "lucide-react";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VendorPagination from "@/components/ui/vendor-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
  IVendorEarningsTransaction,
} from "@/types/earnings";

interface VendorEarningsTransactionsTableProps {
  transactions: IVendorEarningsTransaction[];
  pagination: IEarningsPagination | null;
  currentPage: number;
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onPageChange: (newPage: number) => void;
  onViewDetails: (orderId: string) => void;
}

export const VendorEarningsTransactionsTable: React.FC<
  VendorEarningsTransactionsTableProps
> = ({
  transactions,
  pagination,
  currentPage,
  isLoading = false,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onViewDetails,
}) => {
  const total = pagination?.total ?? transactions.length;
  const limit = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  const formatCurrency = (val?: number | null) => {
    return `$${(Number(val) || 0).toLocaleString("en-US", {
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return (
          <Badge className="bg-[#10B981]/15 text-[#059669] border-[#10B981]/30 font-semibold rounded-md text-xs">
            Delivered
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/15 text-[#D97706] border-[#F59E0B]/30 font-semibold rounded-md text-xs">
            Pending
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-[#0284C7]/15 text-[#0284C7] border-[#0284C7]/30 font-semibold rounded-md text-xs">
            Processing
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge className="bg-[#fe6201]/15 text-[#fe6201] border-[#fe6201]/30 font-semibold rounded-md text-xs">
            Confirmed
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-[#8B5CF6]/15 text-[#7C3AED] border-[#8B5CF6]/30 font-semibold rounded-md text-xs">
            Shipped
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 font-semibold rounded-md text-xs">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#6B7280]/15 text-[#4B5563] border-[#6B7280]/30 font-semibold rounded-md text-xs">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Matching Admin Design */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Full width Search Box */}
        <div className="relative flex-1 w-full min-w-0">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by transaction ID or customer name..."
            className="w-full pl-9 pr-8 h-10 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#94A3B8] shadow-xs outline-none focus:outline-none focus:border-[#fe6201] focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#fe6201]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48 md:w-52 shrink-0">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 w-full text-xs sm:text-sm rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] text-[#1F2937] shadow-xs focus:ring-[#fe6201]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#FFE7D9] border border-[#ffceb0]/80">
              <SelectItem value="ALL" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                All Status
              </SelectItem>
              <SelectItem value="DELIVERED" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Delivered
              </SelectItem>
              <SelectItem value="PENDING" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Pending
              </SelectItem>
              <SelectItem value="PROCESSING" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Processing
              </SelectItem>
              <SelectItem value="CONFIRMED" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Confirmed
              </SelectItem>
              <SelectItem value="SHIPPED" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Shipped
              </SelectItem>
              <SelectItem value="CANCELLED" className="text-xs sm:text-sm cursor-pointer hover:bg-[#ffceb0]/60">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Earnings History Table */}
      <div className="rounded-xl border border-[#ffceb0]/60 bg-[#FFE7D9] overflow-hidden shadow-xs">
        {!isLoading && transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#ffceb0]/40 border border-[#ffceb0] text-[#fe6201] flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937]">
              No earnings records found
            </h3>
            <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL"
                ? "No transactions match your search or filter criteria."
                : "No earnings history recorded for your store yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#CB4E01] text-white">
                <TableRow className="border-b border-[#CB4E01] hover:bg-[#CB4E01]">
                  {/* 1. Customer */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 pl-6 align-middle">
                    Customer
                  </TableHead>
                  {/* 2. Date & Time */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Date & Time
                  </TableHead>
                  {/* 3. Amount */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Amount
                  </TableHead>
                  {/* 4. Vendor Commission */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Vendor Commission
                  </TableHead>
                  {/* 5. Order Status */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Order Status
                  </TableHead>
                  {/* 6. Actions */}
                  <TableHead className="font-semibold text-xs text-white uppercase tracking-wider h-10 py-2.5 pr-6 text-right align-middle">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-[#FFE7D9]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-[#ffceb0]/40">
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-28 rounded-sm" />
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-4 w-32 rounded-sm" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-4 w-20 rounded-sm" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-5 w-20 rounded-sm" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-5 w-20 rounded-md" />
                      </TableCell>
                      <TableCell className="py-3.5 pr-6 text-right">
                        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  transactions.map((tx) => {
                    const isDelivered = tx.status?.toUpperCase() === "DELIVERED";

                    return (
                      <TableRow
                        key={tx._id}
                        className="border-b border-[#ffceb0]/40 hover:bg-[#ffceb0]/40 transition-colors"
                      >
                        {/* 1. Customer */}
                        <TableCell className="py-3.5 pl-6 align-middle">
                          <div className="flex items-center gap-3">
                            <ProfileAvatar
                              src={tx.buyerImage}
                              alt={tx.buyerName}
                              className="w-9 h-9 rounded-full border border-[#ffceb0]/80 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm text-[#1F2937] truncate">
                                {tx.buyerName}
                              </p>
                              {tx.transactionId && (
                                <p className="font-mono text-[10px] text-[#64748B] truncate mt-0.5">
                                  {tx.transactionId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Date & Time */}
                        <TableCell className="py-3.5 px-4 text-xs text-[#4B5563] align-middle whitespace-nowrap">
                          {formatDate(tx.date)}
                        </TableCell>

                        {/* 3. Amount */}
                        <TableCell className="py-3.5 px-4 text-xs sm:text-sm font-semibold text-[#1F2937] align-middle">
                          {formatCurrency(tx.amount)}
                        </TableCell>

                        {/* 4. Vendor Commission */}
                        <TableCell className="py-3.5 px-4 text-xs sm:text-sm align-middle whitespace-nowrap">
                          {isDelivered ? (
                            <span className="inline-flex items-center font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-sm border border-[#D1FAE5]">
                              {formatCurrency(tx.commission)}
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF] font-medium">
                              $0.00
                            </span>
                          )}
                        </TableCell>

                        {/* 5. Order Status */}
                        <TableCell className="py-3.5 px-4 align-middle">
                          {getStatusBadge(tx.status)}
                        </TableCell>

                        {/* 6. Actions */}
                        <TableCell className="py-3.5 pr-6 text-right align-middle">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(tx.orderId)}
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#CB4E01] hover:bg-[#ffceb0]/60 transition-colors cursor-pointer"
                            title="View Earning Details"
                            aria-label="View Earning Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="pt-2">
          <VendorPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default VendorEarningsTransactionsTable;
