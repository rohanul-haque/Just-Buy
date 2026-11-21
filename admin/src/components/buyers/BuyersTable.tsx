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
  onViewDetails: (buyer: IBuyer) => void;
  onSoftDelete: (buyer: IBuyer) => void;
}

export const BuyersTable: React.FC<BuyersTableProps> = ({
  buyers,
  pagination,
  currentPage,
  onViewDetails,
  onSoftDelete,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const limit = pagination?.limit || 10;
  const total = pagination?.total ?? buyers.length;
  const totalPages = pagination?.totalPages || 1;
  const hasPrev = pagination ? pagination.hasPrevPage : currentPage > 1;
  const hasNext = pagination
    ? pagination.hasNextPage
    : currentPage < totalPages;

  const activeSearch = searchParams.get("search");
  const activeStatus = searchParams.get("status");

  if (buyers.length === 0) {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-12 text-center">
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
      <div className="rounded-md border border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-[#F8FAFC]">
            <TableRow className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC]">
              {/* 1. Buyer Name (Profile Image + Name) */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Buyer Name
              </TableHead>
              {/* 2. Email */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Email
              </TableHead>
              {/* 3. Role (immediately after Email) */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Role
              </TableHead>
              {/* 4. Join Date */}
              <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">
                Join Date
              </TableHead>
              {/* 5. Actions */}
              <TableHead className="w-28 text-xs font-semibold text-[#4B5563] uppercase text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyers.map((buyer) => {
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
                  className="border-b border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* 1. Buyer Name (Profile Image + Name together) */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="w-10 h-10 rounded-md object-cover border border-[#E5E7EB] shadow-xs flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center border border-[#C7D2FE] shadow-xs flex-shrink-0">
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
                  <TableCell className="py-3 text-sm text-[#374151]">
                    <span className="truncate block max-w-xs">{email}</span>
                  </TableCell>

                  {/* 3. Role (immediately after Email) */}
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className="rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-[#F8FAFC] text-[#4338CA] border-[#C7D2FE]"
                    >
                      {role}
                    </Badge>
                  </TableCell>

                  {/* 4. Join Date */}
                  <TableCell className="py-3 text-sm text-[#4B5563]">
                    {formattedDate}
                  </TableCell>

                  {/* 5. Actions (Exactly two icon-only actions: Info first, then Delete/Block) */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Action 1: Information Icon (First) */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails(buyer)}
                        className="w-8 h-8 rounded-md text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors"
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
            buyers
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

export default BuyersTable;
