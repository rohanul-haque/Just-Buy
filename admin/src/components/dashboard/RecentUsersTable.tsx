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
import type { IRecentUser, IRecentUsersResponse } from "@/types/dashboard";
import { Info, Users as UsersIcon } from "lucide-react";
import React from "react";

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
  const users = data?.users || [];

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
        className="bg-[#ffefe6] text-[#CB4E01] border-[#ffceb0] rounded-md font-semibold text-xs"
      >
        Buyer
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border border-[#ffceb0]/60 bg-[#FFE7D9] shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="space-y-2.5 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-[#4B5563]">
          <UsersIcon className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
          <p className="text-sm font-medium">No users or vendors found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#CB4E01] text-white">
              <TableRow className="border-b border-[#CB4E01] hover:bg-[#CB4E01]">
                <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                  Full Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 align-middle">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-white uppercase h-10 py-2 px-4 text-right align-middle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#FFE7D9]">
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
                    className="hover:bg-[#ffceb0]/40 transition-colors border-b border-[#ffceb0]/40"
                  >
                    {/* Full Name with Avatar */}
                    <TableCell className="py-2 px-4 font-medium text-[#0F172A] align-middle">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={displayName}
                            className="w-8 h-8 rounded-md object-cover border border-[#E5E7EB] shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-[#ffefe6] border border-[#ffceb0] flex items-center justify-center text-[#CB4E01] font-bold text-xs shrink-0">
                            {initials || "U"}
                          </div>
                        )}
                        <span className="font-semibold text-sm truncate max-w-[200px]">
                          {displayName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="py-2 px-4 text-xs text-[#4B5563] align-middle">
                      <span className="truncate block max-w-[220px]">
                        {user.email}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-2 px-4 text-xs text-[#4B5563] whitespace-nowrap align-middle">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell className="py-2 px-4 whitespace-nowrap align-middle">
                      {getRoleBadge(user.role)}
                    </TableCell>

                    {/* Actions: Info Icon */}
                    <TableCell className="py-2 px-4 text-right whitespace-nowrap align-middle">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(user)}
                        className="h-7.5 w-7.5 p-0 rounded-md border-[#E5E7EB] text-[#CB4E01] hover:bg-[#ffefe6] hover:text-[#cb4e01]"
                        title="View user details"
                        aria-label={`View details for ${displayName}`}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecentUsersTable;
