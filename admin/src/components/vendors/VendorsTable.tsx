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
import type { IVendor, IVendorPagination, VendorStatus } from "@/types/vendor";
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
  activeTab: "requests" | "list";
  currentPage: number;
  onViewDetails: (vendor: IVendor) => void;
  onApprove?: (vendor: IVendor) => void;
  onDeleteRequest?: (vendor: IVendor) => void;
  onSuspend?: (vendor: IVendor) => void;
}

export const VendorsTable: React.FC<VendorsTableProps> = ({
  vendors,
  pagination,
  activeTab,
  currentPage,
  onViewDetails,
  onApprove,
  onDeleteRequest,
  onSuspend,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const limit = pagination?.limit || 10;
  const total = pagination?.total ?? vendors.length;
  const totalPages = pagination?.totalPages || 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const activeSearch = searchParams.get("search");
  const activeStatus = searchParams.get("status");

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

  if (vendors.length === 0) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center">
        <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          {activeTab === "requests"
            ? "No vendor requests found"
            : "No approved vendors found"}
        </h3>
        <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
          {activeSearch || activeStatus
            ? "No vendors match your search and filter criteria. Try adjusting your search term or status filter."
            : activeTab === "requests"
              ? "There are currently no new vendor applications or requests."
              : "No approved merchant accounts registered on the platform."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
              {/* 1. Vendor Name */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Vendor Name
              </TableHead>
              {/* 2. Email */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Email
              </TableHead>
              {/* 3. Join Date */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Join Date
              </TableHead>
              {/* 4. Status */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Status
              </TableHead>
              {/* 5. Actions */}
              <TableHead className="w-32 text-xs font-semibold text-[#4B5563] uppercase text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => {
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
                activeTab === "requests" && vendor.status !== "APPROVED";
              const isSuspended = vendor.status === "SUSPENDED";

              return (
                <TableRow
                  key={vendor._id}
                  className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* 1. Vendor Name (Profile Image + Name together) */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={shopName}
                          className="w-10 h-10 rounded-md object-cover border border-[#E5E7EB] shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center border border-[#C7D2FE] shadow-xs flex-shrink-0">
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
                  <TableCell className="py-3 text-sm text-[#374151]">
                    <span className="truncate block max-w-xs">{email}</span>
                  </TableCell>

                  {/* 3. Join Date */}
                  <TableCell className="py-3 text-sm text-[#4B5563]">
                    {formattedDate}
                  </TableCell>

                  {/* 4. Status */}
                  <TableCell className="py-3">
                    {getStatusBadge(vendor.status)}
                  </TableCell>

                  {/* 5. Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {activeTab === "requests" ? (
                        <>
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
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                            title="View vendor details"
                            aria-label="View vendor details"
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {/* 3. Delete/Reject Icon */}
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
                        </>
                      ) : (
                        <>
                          {/* Vendor List Actions: 1. Information Icon */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(vendor)}
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
                            title="View vendor details"
                            aria-label="View vendor details"
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {/* 2. Suspend / Unsuspend Icon */}
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
                        </>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-xs text-[#6B7280]">
            Showing{" "}
            <span className="font-semibold text-[#111827]">
              {(currentPage - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[#111827]">
              {Math.min(currentPage * limit, total)}
            </span>{" "}
            of <span className="font-semibold text-[#111827]">{total}</span>{" "}
            vendors
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
              className="h-8 px-2.5 rounded-md border-[#E5E7EB] text-xs font-medium text-[#374151] hover:bg-[#F8FAFC]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-[#4B5563] font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              className="h-8 px-2.5 rounded-md border-[#E5E7EB] text-xs font-medium text-[#374151] hover:bg-[#F8FAFC]"
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

export default VendorsTable;
