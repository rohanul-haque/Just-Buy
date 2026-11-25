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
  IVendor,
  IVendorPagination,
  TVendorCategory,
  VendorStatus,
} from "@/types/vendor";
import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

interface VendorsTableProps {
  vendors: IVendor[];
  pagination: IVendorPagination | null;
  category?: TVendorCategory;
  activeTab?: "requests" | "list";
  currentPage: number;
  isLoading?: boolean;
  onViewDetails: (vendor: IVendor) => void;
  onApprove?: (vendor: IVendor) => void;
  onDeleteRequest?: (vendor: IVendor) => void;
  onSuspend?: (vendor: IVendor) => void;
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

export const VendorsTable: React.FC<VendorsTableProps> = ({
  vendors,
  pagination,
  category,
  activeTab,
  currentPage,
  isLoading = false,
  onViewDetails,
  onApprove,
  onDeleteRequest,
  onSuspend,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory: TVendorCategory =
    category || (activeTab === "requests" ? "requests" : "list");

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const limit = pagination?.limit || 10;
  const total = pagination?.total ?? vendors.length;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

  const activeSearch = searchParams.get("search");

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-[#10B981]/10 text-[#10B981] border-transparent font-semibold">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-transparent font-semibold">
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-transparent font-semibold">
            Rejected
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge className="bg-[#6B7280]/10 text-[#6B7280] border-transparent font-semibold">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#E5E7EB] text-[#374151] border-transparent font-semibold">
            {status}
          </Badge>
        );
    }
  };

  if (!isLoading && vendors.length === 0) {
    let emptyHeading = "No approved vendors found";
    let emptyDescription =
      "No approved merchant accounts registered on the platform.";

    if (currentCategory === "requests") {
      emptyHeading = "No vendor requests found";
      emptyDescription =
        "There are currently no new vendor applications or requests.";
    } else if (currentCategory === "pending") {
      emptyHeading = "No pending requests found";
      emptyDescription =
        "There are currently no vendor requests waiting for review.";
    } else if (currentCategory === "rejected") {
      emptyHeading = "No rejected vendors found";
      emptyDescription = "No vendor requests or accounts have been rejected.";
    } else if (currentCategory === "suspended") {
      emptyHeading = "No suspended vendors found";
      emptyDescription = "No vendor accounts are currently suspended.";
    }

    if (activeSearch) {
      emptyDescription = `No vendors match "${activeSearch}" in this category. Try adjusting your search term.`;
    }

    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          {emptyHeading}
        </h3>
        <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
          {emptyDescription}
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
              {/* 1. Vendor Name */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 pl-6 align-middle">
                Vendor Name
              </TableHead>
              {/* 2. Email */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Email
              </TableHead>
              {/* 3. Join Date */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Join Date
              </TableHead>
              {/* 4. Status */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Status
              </TableHead>
              {/* 5. Actions */}
              <TableHead className="w-32 text-xs font-semibold text-white uppercase h-10 py-2 pr-6 text-right align-middle">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#FFE7D9]">
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-[#E5E7EB] hover:bg-transparent"
                  >
                    <TableCell className="py-2.5 pl-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-md flex-shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-32 rounded-md" />
                          <Skeleton className="h-3 w-20 rounded-md" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <Skeleton className="h-4 w-36 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <Skeleton className="h-5 w-20 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="w-8 h-8 rounded-md" />
                        <Skeleton className="w-8 h-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : vendors.map((vendor) => {
                  const user = vendor.vendor;
                  const merchantName = user?.name || "Merchant";
                  const email = user?.email || "No email";
                  const shopName = vendor.shopName || "Store not set";
                  const rawDate = user?.createdAt || vendor.createdAt;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  const avatarUrl = vendor.profile?.url;
                  const initials = (shopName || merchantName || "V")
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  const canApprove =
                    vendor.status !== "APPROVED" &&
                    (currentCategory === "requests" ||
                      currentCategory === "pending" ||
                      currentCategory === "rejected");
                  const isSuspended = vendor.status === "SUSPENDED";
                  const canDelete =
                    vendor.status === "PENDING" ||
                    currentCategory === "requests" ||
                    currentCategory === "pending";
                  const canSuspendOrUnsuspend =
                    currentCategory === "list" ||
                    currentCategory === "suspended" ||
                    vendor.status === "APPROVED" ||
                    vendor.status === "SUSPENDED";

                  return (
                    <TableRow
                      key={vendor._id}
                      className="border-b border-[#ffceb0]/40 hover:bg-[#ffceb0]/40 transition-colors"
                    >
                      {/* 1. Vendor Name (Profile Image + Name together) */}
                      <TableCell className="py-2.5 pl-6 align-middle">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={shopName}
                              className="w-9 h-9 rounded-md object-cover border border-[#E5E7EB] shadow-xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-[#ffefe6] text-[#CB4E01] font-bold text-xs flex items-center justify-center border border-[#ffceb0] shadow-xs flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#0F172A] leading-tight truncate">
                              {merchantName}
                            </p>
                            <p className="text-xs text-[#6B7280] truncate mt-0.5">
                              {shopName}
                              {vendor.location ? ` • ${vendor.location}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Email */}
                      <TableCell className="py-2.5 px-4 text-sm text-[#374151] align-middle">
                        <span className="truncate block max-w-xs">{email}</span>
                      </TableCell>

                      {/* 3. Join Date */}
                      <TableCell className="py-2.5 px-4 text-sm text-[#4B5563] align-middle">
                        {formattedDate}
                      </TableCell>

                      {/* 4. Status */}
                      <TableCell className="py-2.5 px-4 align-middle">
                        {getStatusBadge(vendor.status)}
                      </TableCell>

                      {/* 5. Actions */}
                      <TableCell className="py-2.5 pr-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Accept Icon (Approve Request) */}
                          {canApprove && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onApprove?.(vendor)}
                              className="w-8 h-8 rounded-md text-[#10B981] hover:text-[#059669] hover:bg-[#10B981]/10 transition-colors"
                              title="Approve vendor request"
                              aria-label="Approve vendor request"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}

                          {/* 2. Information Icon */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(vendor)}
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#CB4E01] hover:bg-[#ffe7d9] transition-colors"
                            title="View vendor details"
                            aria-label="View vendor details"
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {/* 3. Delete/Reject Icon */}
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteRequest?.(vendor)}
                              className="w-8 h-8 rounded-md text-[#EF4444] hover:text-[#DC2626] hover:bg-[#EF4444]/10 transition-colors"
                              title="Reject / Delete vendor request"
                              aria-label="Reject / Delete vendor request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}

                          {/* 4. Suspend / Unsuspend Icon */}
                          {canSuspendOrUnsuspend && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onSuspend?.(vendor)}
                              className={`w-8 h-8 rounded-md transition-colors ${
                                isSuspended
                                  ? "text-[#10B981] hover:text-[#059669] hover:bg-[#10B981]/10"
                                  : "text-[#D97706] hover:text-[#B45309] hover:bg-[#F59E0B]/10"
                              }`}
                              title={
                                isSuspended
                                  ? "Re-activate vendor shop"
                                  : "Suspend vendor shop"
                              }
                              aria-label={
                                isSuspended
                                  ? "Re-activate vendor shop"
                                  : "Suspend vendor shop"
                              }
                            >
                              {isSuspended ? (
                                <ShieldCheck className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
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
            vendors
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev || isLoading}
              className="h-8 px-2.5 rounded-md border-[#ffceb0]/60 bg-[#FFE7D9] text-xs font-medium text-[#0F172A] hover:bg-[#ffceb0]/40 disabled:opacity-50"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            {/* Page number buttons */}
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
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext || isLoading}
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

export default VendorsTable;
