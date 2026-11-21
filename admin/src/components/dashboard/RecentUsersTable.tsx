import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IRecentUser, IRecentUsersResponse } from "@/types/dashboard";
import { ChevronLeft, ChevronRight, Info, Users as UsersIcon } from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

interface RecentUsersTableProps {
  data: IRecentUsersResponse;
  isLoading?: boolean;
  onViewDetails: (user: IRecentUser) => void;
}

export const RecentUsersTable: React.FC<RecentUsersTableProps> = ({
  data,
  isLoading = false,
  onViewDetails,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const users = data?.users || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const formatDate = (val?: string | Date) => {
    if (!val) return "N/A";
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadge = (role?: string) => {
    const r = role?.toUpperCase();
    if (r === "VENDOR") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-md font-semibold text-xs"
        >
          Vendor
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE] rounded-md font-semibold text-xs"
      >
        Buyer
      </Badge>
    );
  };

  return (
    <Card className="rounded-md p-6 border-[#E5E7EB] bg-white space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5E7EB] gap-2">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            Recent Users &amp; Vendors
          </h3>
          <p className="text-xs text-[#4B5563] mt-0.5">
            Registered platform accounts ordered by registration date
          </p>
        </div>
        {pagination.total > 0 && (
          <span className="text-xs text-[#4B5563] font-medium">
            Total {pagination.total} registered accounts
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-[#4B5563]">
          <UsersIcon className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
          <p className="text-sm font-medium">No users or vendors found.</p>
          <p className="text-xs text-[#4B5563] mt-1">
            Registered buyer and vendor accounts will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-[#E5E7EB] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase py-3.5 px-4">
                  Full Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase py-3.5 px-4">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase py-3.5 px-4">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase py-3.5 px-4">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase py-3.5 px-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const displayName =
                  user.fullName || user.name || "Anonymous User";
                const initials = displayName
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <TableRow
                    key={user._id}
                    className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB]"
                  >
                    {/* Full Name with Avatar */}
                    <TableCell className="py-3 px-4 font-medium text-[#0F172A]">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={displayName}
                            className="w-9 h-9 rounded-md object-cover border border-[#E5E7EB] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] font-bold text-xs shrink-0">
                            {initials || "U"}
                          </div>
                        )}
                        <span className="font-semibold text-sm truncate max-w-[200px]">
                          {displayName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-3 px-4 text-xs text-[#4B5563]">
                      <span className="truncate block max-w-[220px]">
                        {user.email}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-3 px-4 text-xs text-[#4B5563] whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell className="py-3 px-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </TableCell>

                    {/* Actions: Info Icon */}
                    <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(user)}
                        className="h-8 w-8 p-0 rounded-md border-[#E5E7EB] text-[#4F46E5] hover:bg-[#E0E7FF] hover:text-[#4338CA]"
                        title="View user details"
                        aria-label={`View details for ${displayName}`}
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
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB]">
          <span className="text-xs text-[#4B5563]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="h-8 px-2.5 rounded-md border-[#E5E7EB] text-xs text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="h-8 px-2.5 rounded-md border-[#E5E7EB] text-xs text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentUsersTable;
