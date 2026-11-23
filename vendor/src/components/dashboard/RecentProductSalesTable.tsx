import React from "react";
import { Eye, Package, ShoppingBag } from "lucide-react";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IVendorRecentSale } from "@/types/dashboard";

interface RecentProductSalesTableProps {
  sales: IVendorRecentSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  currentPage: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onViewDetails: (sale: IVendorRecentSale) => void;
}

export const RecentProductSalesTable: React.FC<RecentProductSalesTableProps> = ({
  sales,
  pagination,
  currentPage,
  isLoading = false,
  onPageChange,
  onViewDetails,
}) => {
  const total = pagination?.total ?? sales.length;
  const limit = pagination?.limit ?? 10;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));

  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

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

  return (
    <Card className="rounded-lg border-[#E5E7EB] bg-white shadow-xs p-5 space-y-4">
      {/* Table Content (External text removed) */}
      <div className="rounded-md border border-[#E5E7EB] overflow-hidden">
        {!isLoading && sales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#0F172A]">
              No records found
            </h4>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              When orders are completed, records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#F8FAFC]">
                <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
                  {/* 1. Product */}
                  <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider h-10 py-2.5 pl-6 align-middle">
                    Product
                  </TableHead>
                  {/* 2. Customer */}
                  <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Customer
                  </TableHead>
                  {/* 3. Date */}
                  <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Date
                  </TableHead>
                  {/* 4. Amount */}
                  <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider h-10 py-2.5 px-4 align-middle">
                    Amount
                  </TableHead>
                  {/* 5. Actions */}
                  <TableHead className="font-semibold text-xs text-[#4B5563] uppercase tracking-wider h-10 py-2.5 pr-6 text-right align-middle">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx} className="border-b border-[#E5E7EB]">
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="py-3.5 pr-6 text-right">
                        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  sales.map((sale, i) => (
                    <TableRow
                      key={`${sale.orderId}-${i}`}
                      className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors"
                    >
                      {/* 1. Product Column */}
                      <TableCell className="py-3.5 pl-6 align-middle">
                        <div className="flex items-center gap-3">
                          {sale.product.image ? (
                            <img
                              src={sale.product.image}
                              alt={sale.product.name}
                              className="w-10 h-10 rounded-md object-cover border border-[#E5E7EB] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-[#0F172A] truncate max-w-xs">
                              {sale.product.name}
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              Qty: {sale.product.quantity}
                              {sale.product.size ? ` • Size: ${sale.product.size}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Customer Column */}
                      <TableCell className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            src={sale.customer.profileImage}
                            alt={sale.customer.name}
                            className="w-9 h-9 rounded-full border border-[#E5E7EB] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm text-[#0F172A] truncate">
                              {sale.customer.name}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate">
                              {sale.customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 3. Date Column */}
                      <TableCell className="py-3.5 px-4 text-xs text-[#4B5563] align-middle whitespace-nowrap">
                        {formatDate(sale.createdAt)}
                      </TableCell>

                      {/* 4. Amount Column */}
                      <TableCell className="py-3.5 px-4 text-xs sm:text-sm font-semibold text-[#0F172A] align-middle">
                        {formatCurrency(sale.amount)}
                      </TableCell>

                      {/* 5. Actions Column */}
                      <TableCell className="py-3.5 pr-6 text-right align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(sale)}
                          className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                          title="View Sale Details"
                          aria-label="View Sale Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 text-xs text-[#4B5563]">
          <div>
            Showing <span className="font-semibold text-[#0F172A]">{startRecord}</span>–<span className="font-semibold text-[#0F172A]">{endRecord}</span> of{" "}
            <span className="font-semibold text-[#0F172A]">{total}</span> records
          </div>

          <Pagination className="justify-center sm:justify-end mx-0 w-auto">
            <PaginationContent className="gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className={
                    currentPage <= 1 || isLoading
                      ? "pointer-events-none opacity-50 cursor-not-allowed text-xs h-8 px-2.5"
                      : "cursor-pointer text-xs h-8 px-2.5"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                  );
                })
                .reduce<(number | string)[]>((acc, curr, index, arr) => {
                  if (
                    index > 0 &&
                    (curr as number) - (arr[index - 1] as number) > 1
                  ) {
                    acc.push(`ellipsis-${curr}`);
                  }
                  acc.push(curr);
                  return acc;
                }, [])
                .map((item) => {
                  if (typeof item === "string") {
                    return (
                      <PaginationItem key={item}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return (
                    <PaginationItem key={item}>
                      <PaginationLink
                        isActive={currentPage === item}
                        onClick={() => onPageChange(item)}
                        className="h-8 w-8 text-xs cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  className={
                    currentPage >= totalPages || isLoading
                      ? "pointer-events-none opacity-50 cursor-not-allowed text-xs h-8 px-2.5"
                      : "cursor-pointer text-xs h-8 px-2.5"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};

export default RecentProductSalesTable;
