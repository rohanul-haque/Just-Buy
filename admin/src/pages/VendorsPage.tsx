import React, { useEffect, useState, useCallback } from "react";
import {
  Store,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import vendorService from "@/api/services/vendor.service";
import type { IVendor, VendorStatus } from "@/types/vendor";
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

export const VendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "ALL">("ALL");

  // Status Action Modal
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [targetStatus, setTargetStatus] = useState<VendorStatus>("APPROVED");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await vendorService.getAllVendors({ limit: 100 });
      setVendors(res.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const getVendorName = (v: IVendor) =>
    v.vendor?.name || (v as any).user?.name || "Merchant";
  const getVendorEmail = (v: IVendor) =>
    v.vendor?.email || (v as any).user?.email || "No email";
  const getVendorLocation = (v: IVendor) =>
    v.location || (v as any).address?.city || "Location not set";
  const getVendorProfileUrl = (v: IVendor) =>
    v.profile?.url || (v as any).logo?.url || null;

  const handleConfirmStatusChange = async () => {
    if (!selectedVendor) return;
    setIsUpdatingStatus(true);
    try {
      await vendorService.updateVendorStatus(selectedVendor._id, targetStatus);
      toast.success(
        `Vendor "${selectedVendor.shopName || "store"}" status set to ${targetStatus}!`,
      );
      setSelectedVendor(null);
      await fetchVendors();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status?: VendorStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-[#E0E7FF] text-[#4F46E5] hover:bg-[#E0E7FF] rounded-md border-none font-semibold">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md border-none font-semibold">
            Rejected
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="outline" className="bg-[#F8FAFC] text-[#1F2937] border-[#E5E7EB] rounded-md font-semibold">
            Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-[#F8FAFC] text-[#4B5563] border-[#E5E7EB] rounded-md font-semibold">
            {status || "Pending"}
          </Badge>
        );
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase();
    const name = getVendorName(v).toLowerCase();
    const email = getVendorEmail(v).toLowerCase();
    const loc = getVendorLocation(v).toLowerCase();
    const shop = (v.shopName || "").toLowerCase();

    const matchesSearch =
      shop.includes(q) || name.includes(q) || email.includes(q) || loc.includes(q);

    const matchesStatus =
      statusFilter === "ALL" || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Platform Vendors
          </h2>
          <p className="text-sm text-[#4B5563] mt-1 font-normal">
            Review vendor registrations, approve merchant stores, and manage store statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchVendors}
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
              placeholder="Search by store name, owner, city..."
              className="pl-9 h-9 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A]"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {(["ALL", "APPROVED", "PENDING", "SUSPENDED", "REJECTED"] as const).map(
              (status) => (
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
              ),
            )}
          </div>
        </div>
      </Card>

      {/* Vendors Table (shadcn Table) */}
      <Card className="rounded-md border-[#E5E7EB] bg-white overflow-hidden shadow-xs">
        {error ? (
          <div className="p-6 text-center text-[#EF4444] text-sm">{error}</div>
        ) : isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="py-12 text-center text-[#4B5563] text-sm">
            <Store className="w-8 h-8 mx-auto text-[#4B5563]/40 mb-2" />
            No vendor stores match your selected criteria.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-b border-[#E5E7EB]">
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Store</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Merchant Contact</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Location</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#4B5563] uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow
                  key={vendor._id}
                  className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getVendorProfileUrl(vendor) ? (
                        <img
                          src={getVendorProfileUrl(vendor)!}
                          alt={vendor.shopName}
                          className="w-10 h-10 rounded-md object-cover border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center font-bold text-sm">
                          {(vendor.shopName || "S")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#0F172A] text-sm">
                          {vendor.shopName || "Unnamed Store"}
                        </p>
                        <p className="text-xs text-[#4B5563]">
                          License: {vendor.licenceNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <p className="font-medium text-[#0F172A]">
                        {getVendorName(vendor)}
                      </p>
                      <div className="flex items-center gap-1.5 text-[#4B5563]">
                        <Mail className="w-3.5 h-3.5 text-[#4B5563]" />
                        <span>{getVendorEmail(vendor)}</span>
                      </div>
                      {(vendor as any).contactPhone && (
                        <div className="flex items-center gap-1.5 text-[#4B5563]">
                          <Phone className="w-3.5 h-3.5 text-[#4B5563]" />
                          <span>{(vendor as any).contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-[#111827]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#4B5563] flex-shrink-0" />
                      <span>{getVendorLocation(vendor)}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(vendor.status)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {vendor.status !== "APPROVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setTargetStatus("APPROVED");
                          }}
                          className="h-8 px-3 rounded-md text-xs font-medium bg-white text-[#4F46E5] border-[#E5E7EB] hover:bg-[#E0E7FF]"
                        >
                          Approve
                        </Button>
                      )}
                      {vendor.status !== "SUSPENDED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setTargetStatus("SUSPENDED");
                          }}
                          className="h-8 px-3 rounded-md text-xs font-medium bg-white text-[#1F2937] border-[#E5E7EB] hover:bg-[#F8FAFC]"
                        >
                          Suspend
                        </Button>
                      )}
                      {vendor.status !== "REJECTED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setTargetStatus("REJECTED");
                          }}
                          className="h-8 px-3 rounded-md text-xs font-medium bg-white text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Status Confirmation Modal (shadcn Dialog with MD rounded buttons) */}
      <Dialog
        open={!!selectedVendor}
        onOpenChange={() => setSelectedVendor(null)}
      >
        <DialogContent className="sm:max-w-md p-6 bg-white rounded-md border border-[#E5E7EB] shadow-lg font-sans">
          <DialogTitle className="sr-only">Change Vendor Status</DialogTitle>
          <div className="space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-md mx-auto flex items-center justify-center ${
                targetStatus === "APPROVED"
                  ? "bg-[#E0E7FF] text-[#4F46E5]"
                  : targetStatus === "SUSPENDED"
                  ? "bg-[#F8FAFC] text-[#1F2937] border border-[#E5E7EB]"
                  : "bg-[#EF4444]/10 text-[#EF4444]"
              }`}
            >
              {targetStatus === "APPROVED" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : targetStatus === "SUSPENDED" ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Change Store Status to {targetStatus}
              </h3>
              <p className="text-sm text-[#4B5563] mt-1">
                Are you sure you want to mark{" "}
                <span className="font-semibold text-[#0F172A]">
                  {selectedVendor?.shopName}
                </span>{" "}
                as {targetStatus}?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                disabled={isUpdatingStatus}
                onClick={() => setSelectedVendor(null)}
                className="flex-1 h-10 rounded-md border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                disabled={isUpdatingStatus}
                onClick={handleConfirmStatusChange}
                className={`flex-1 h-10 rounded-md text-white font-semibold ${
                  targetStatus === "REJECTED"
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
                  `Confirm ${targetStatus}`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorsPage;
