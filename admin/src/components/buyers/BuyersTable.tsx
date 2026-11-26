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
import AdminPagination from "@/components/ui/admin-pagination";
import { cn } from "@/lib/utils";
import type { IBuyer, IBuyerPagination } from "@/types/buyer";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

interface BuyersTableProps {
  buyers: IBuyer[];
  pagination: IBuyerPagination | null;
  currentPage: number;
  isLoading?: boolean;
  onViewDetails: (buyer: IBuyer) => void;
  onSoftDelete: (buyer: IBuyer) => void;
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

export const BuyersTable: React.FC<BuyersTableProps> = ({
  buyers,
  pagination,
  currentPage,
  isLoading = false,
  onViewDetails,
  onSoftDelete,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const limit = pagination?.limit || 10;
  const total = pagination?.total ?? buyers.length;
  const totalPages = pagination?.totalPages || Math.ceil(total / limit) || 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

  const activeSearch = searchParams.get("search");
  const activeStatus = searchParams.get("status");

  if (!isLoading && buyers.length === 0) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A]">
          No buyers found
        </h3>
        <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
          {activeSearch || activeStatus
            ? "No buyers match your search and filter criteria. Try adjusting your search term or status filter."
            : "No registered buyers found in the platform."}
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
              {/* 1. Buyer Name (Profile Image + Name) */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 pl-6 align-middle">
                Buyer Name
              </TableHead>
              {/* 2. Email */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Email
              </TableHead>
              {/* 3. Role (immediately after Email) */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Role
              </TableHead>
              {/* 4. Join Date */}
              <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                Join Date
              </TableHead>
              {/* 5. Actions */}
              <TableHead className="w-28 text-xs font-semibold text-white uppercase h-10 py-2 pr-6 text-right align-middle">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#FFE7D9]">
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-[#ffceb0]/40 hover:bg-transparent"
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
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5 px-4">
                      <Skeleton className="h-4 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="py-2.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Skeleton className="w-8 h-8 rounded-md" />
                        <Skeleton className="w-8 h-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : buyers.map((buyer) => {
                  const user = buyer.buyer;
                  const name = user?.name || "Anonymous Buyer";
                  const email = user?.email || "No email";
                  const role = user?.role || "BUYER";
                  const isBlocked = user?.status === "BLOCKED";
                  const rawDate = user?.createdAt || buyer.createdAt;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A";

                  const avatarUrl = buyer.profile?.url;
                  const initials = (name || "B")
                    .split(" ")
                    .map((w) => w[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow
                      key={buyer._id}
                      className="border-b border-[#ffceb0]/40 hover:bg-[#ffceb0]/40 transition-colors"
                    >
                      {/* 1. Buyer Name (Profile Image + Name together) */}
                      <TableCell className="py-2.5 pl-6 align-middle">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-9 h-9 rounded-md object-cover border border-[#ffceb0]/80 shadow-xs flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-md bg-[#ffefe6] text-[#fe6201] font-bold text-xs flex items-center justify-center border border-[#ffceb0] shadow-xs flex-shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-[#0F172A] leading-tight truncate">
                                {name}
                              </p>
                              {isBlocked && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EF4444]/10 text-[#EF4444] flex-shrink-0">
                                  Blocked
                                </span>
                              )}
                            </div>
                            {buyer.phoneNumber && (
                              <p className="text-xs text-[#6B7280] truncate mt-0.5">
                                {buyer.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Email */}
                      <TableCell className="py-2.5 px-4 text-sm text-[#374151] align-middle">
                        <span className="truncate block max-w-xs">{email}</span>
                      </TableCell>

                      {/* 3. Role (immediately after Email) */}
                      <TableCell className="py-2.5 px-4 align-middle">
                        <Badge
                          variant="outline"
                          className="rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-white/70 text-[#fe6201] border-[#ffceb0]"
                        >
                          {role}
                        </Badge>
                      </TableCell>

                      {/* 4. Join Date */}
                      <TableCell className="py-2.5 px-4 text-sm text-[#4B5563] align-middle">
                        {formattedDate}
                      </TableCell>

                      {/* 5. Actions (Exactly two icon-only actions: Info first, then Delete/Block) */}
                      <TableCell className="py-2.5 pr-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Action 1: Information Icon (First) */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(buyer)}
                            className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#fe6201] hover:bg-[#ffceb0]/60 transition-colors"
                            title="View buyer details"
                            aria-label="View buyer details"
                          >
                            <Info className="w-4 h-4" />
                          </Button>

                          {/* Action 2: Soft Delete / Block Icon (After Information Icon) */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onSoftDelete(buyer)}
                            className={`w-8 h-8 rounded-md transition-colors ${
                              isBlocked
                                ? "text-[#10B981] hover:text-[#059669] hover:bg-[#10B981]/10"
                                : "text-[#EF4444] hover:text-[#DC2626] hover:bg-[#EF4444]/10"
                            }`}
                            title={
                              isBlocked
                                ? "Unblock buyer account"
                                : "Soft delete / Block buyer"
                            }
                            aria-label={
                              isBlocked
                                ? "Unblock buyer"
                                : "Soft delete or block buyer"
                            }
                          >
                            {isBlocked ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
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
        <div className="pt-2">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default BuyersTable;
