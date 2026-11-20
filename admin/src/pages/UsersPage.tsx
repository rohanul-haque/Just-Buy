import React, { useEffect, useState, useCallback } from "react";
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Loader2,
} from "lucide-react";
import userService from "@/api/services/user.service";
import type { IBuyer } from "@/types/user";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const UsersPage: React.FC = () => {
  const [buyers, setBuyers] = useState<IBuyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

  // Status Change Confirmation Modal
  const [selectedBuyer, setSelectedBuyer] = useState<IBuyer | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "BLOCKED">("BLOCKED");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchBuyers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getAllBuyers({ limit: 100 });
      setBuyers(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const getBuyerName = (buyer: IBuyer) =>
    buyer.buyer?.name || (buyer as any).name || "Anonymous Buyer";
  const getBuyerEmail = (buyer: IBuyer) =>
    buyer.buyer?.email || (buyer as any).email || "No email";
  const getBuyerPhone = (buyer: IBuyer) =>
    buyer.phoneNumber || (buyer as any).phone || "";

  const handleConfirmStatusChange = async () => {
    if (!selectedBuyer) return;
    setIsUpdatingStatus(true);
    try {
      await userService.updateBuyerStatus(selectedBuyer._id, targetStatus);
      toast.success(
        `User ${getBuyerName(selectedBuyer)} marked as ${targetStatus.toLowerCase()}!`,
      );
      setSelectedBuyer(null);
      await fetchBuyers();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredBuyers = buyers.filter((buyer) => {
    const search = searchQuery.toLowerCase();
    const name = getBuyerName(buyer).toLowerCase();
    const email = getBuyerEmail(buyer).toLowerCase();
    const phone = getBuyerPhone(buyer).toLowerCase();
    const matchesSearch =
      name.includes(search) || email.includes(search) || phone.includes(search);

    const isBlocked =
      (buyer as any).isBlocked ||
      buyer.buyer?.status === "BLOCKED" ||
      (buyer as any).status === "BLOCKED";
    const status = isBlocked ? "BLOCKED" : "ACTIVE";
    const matchesStatus = statusFilter === "ALL" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Registered Users
          </h2>
          <p className="text-sm text-[#4B5563] mt-1 font-normal">
            View and manage buyer customer accounts on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchBuyers}
            disabled={isLoading}
            className="rounded-md border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#F8FAFC]"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar (shadcn Input & Button) */}
      <Card className="rounded-md p-3 border-[#E5E7EB] bg-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-9 h-9 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["ALL", "ACTIVE", "BLOCKED"] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-8 px-3 rounded-md text-xs font-medium ${
                  statusFilter === status
                    ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                    : "bg-white text-[#1F2937] hover:bg-[#F8FAFC] border-[#E5E7EB]"
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table (shadcn Table) */}
      <Card className="rounded-md border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        {error ? (
          <div className="p-6 text-center text-[#EF4444] text-sm">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563] text-sm">
            <UsersIcon className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
            No user accounts found matching your query.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">User</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Contact</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Joined Date</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBuyers.map((buyer) => {
                const bName = getBuyerName(buyer);
                const bEmail = getBuyerEmail(buyer);
                const bPhone = getBuyerPhone(buyer);
                const isBlocked =
                  (buyer as any).isBlocked ||
                  buyer.buyer?.status === "BLOCKED" ||
                  (buyer as any).status === "BLOCKED";

                return (
                  <TableRow
                    key={buyer._id}
                    className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {(bName || bEmail || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A] text-sm leading-tight">
                            {bName}
                          </p>
                          <p className="text-xs text-[#4B5563]">
                            ID: {buyer._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[#111827]">
                          <Mail className="w-3.5 h-3.5 text-[#4B5563]" />
                          <span>{bEmail}</span>
                        </div>
                        {bPhone && (
                          <div className="flex items-center gap-1.5 text-[#4B5563]">
                            <Phone className="w-3.5 h-3.5 text-[#4B5563]" />
                            <span>{bPhone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-[#4B5563]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#4B5563]" />
                        <span>
                          {buyer.createdAt
                            ? new Date(buyer.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`rounded-md text-xs font-semibold ${
                          isBlocked
                            ? "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/10"
                            : "bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF]"
                        }`}
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      {isBlocked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBuyer(buyer);
                            setTargetStatus("ACTIVE");
                          }}
                          className="h-8 px-3 rounded-md text-xs font-semibold bg-white text-[#4F46E5] border-[#E5E7EB] hover:bg-[#E0E7FF]"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          <span>Unblock</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBuyer(buyer);
                            setTargetStatus("BLOCKED");
                          }}
                          className="h-8 px-3 rounded-md text-xs font-semibold bg-white text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          <span>Block</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Confirmation Modal (shadcn Dialog with MD rounded buttons) */}
      <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
          <DialogTitle className="sr-only">Update User Status</DialogTitle>
          <div className="space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-md mx-auto flex items-center justify-center ${
                targetStatus === "BLOCKED"
                  ? "bg-[#EF4444]/10 text-[#EF4444]"
                  : "bg-[#E0E7FF] text-[#4F46E5]"
              }`}
            >
              {targetStatus === "BLOCKED" ? (
                <UserX className="w-6 h-6" />
              ) : (
                <UserCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                {targetStatus === "BLOCKED" ? "Block User Account" : "Unblock User Account"}
              </h3>
              <p className="text-sm text-[#4B5563] mt-1">
                Are you sure you want to mark{" "}
                <span className="font-semibold text-[#0F172A]">
                  {selectedBuyer ? getBuyerName(selectedBuyer) : "this user"}
                </span>{" "}
                as {targetStatus.toLowerCase()}?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                disabled={isUpdatingStatus}
                onClick={() => setSelectedBuyer(null)}
                className="flex-1 h-10 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusChange}
                className={`flex-1 h-10 rounded-md text-white font-semibold ${
                  targetStatus === "BLOCKED"
                    ? "bg-[#EF4444] hover:bg-[#DC2626]"
                    : "bg-[#6366F1] hover:bg-[#4F46E5]"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Updating...</span>
                  </>
                ) : (
                  `Yes, ${targetStatus === "BLOCKED" ? "Block" : "Unblock"}`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
