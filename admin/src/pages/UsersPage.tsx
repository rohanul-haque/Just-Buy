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
          <button
            type="button"
            onClick={fetchBuyers}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-white border border-[#E5E7EB] text-[#1F2937] hover:text-[#4F46E5] hover:bg-[#F8FAFC] transition cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-[16px] border border-[#E5E7EB]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-sm text-[#0F172A] placeholder:text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "ACTIVE", "BLOCKED"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`h-9 px-4 rounded-full text-xs font-medium transition cursor-pointer ${
                statusFilter === status
                  ? "bg-[#6366F1] text-white"
                  : "bg-white text-[#1F2937] hover:bg-[#F8FAFC] border border-[#E5E7EB]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-[#EF4444] text-sm">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#F8FAFC] rounded-[8px] animate-pulse" />
            ))}
          </div>
        ) : filteredBuyers.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563] text-sm">
            <UsersIcon className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
            No user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-xs font-semibold text-[#4B5563] uppercase tracking-wider bg-[#F8FAFC]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredBuyers.map((buyer) => {
                  const bName = getBuyerName(buyer);
                  const bEmail = getBuyerEmail(buyer);
                  const bPhone = getBuyerPhone(buyer);
                  const isBlocked =
                    (buyer as any).isBlocked ||
                    buyer.buyer?.status === "BLOCKED" ||
                    (buyer as any).status === "BLOCKED";

                  return (
                    <tr
                      key={buyer._id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#E0E7FF] text-[#4F46E5] font-bold text-sm flex items-center justify-center flex-shrink-0">
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
                      </td>

                      <td className="py-3.5 px-4">
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
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[#4B5563]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#4B5563]" />
                          <span>
                            {buyer.createdAt
                              ? new Date(buyer.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            isBlocked
                              ? "bg-[#EF4444]/10 text-[#EF4444]"
                              : "bg-[#E0E7FF] text-[#4F46E5]"
                          }`}
                        >
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isBlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBuyer(buyer);
                              setTargetStatus("ACTIVE");
                            }}
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-white text-[#4F46E5] border border-[#E5E7EB] hover:bg-[#E0E7FF] transition cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Unblock</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBuyer(buyer);
                              setTargetStatus("BLOCKED");
                            }}
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold bg-white text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/10 transition cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Block</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
        <DialogContent className="sm:max-w-md p-7 bg-white rounded-[16px] border border-[#E5E7EB] shadow-lg font-sans">
          <DialogTitle className="sr-only">Update User Status</DialogTitle>
          <div className="space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
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
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setSelectedBuyer(null)}
                className="flex-1 h-10 py-2 px-5 rounded-full bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E5E7EB] text-sm font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusChange}
                className={`flex-1 h-10 py-2 px-5 rounded-full text-white text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
                  targetStatus === "BLOCKED"
                    ? "bg-[#EF4444] hover:bg-[#DC2626]"
                    : "bg-[#6366F1] hover:bg-[#4F46E5]"
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  `Yes, ${targetStatus === "BLOCKED" ? "Block" : "Unblock"}`
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
