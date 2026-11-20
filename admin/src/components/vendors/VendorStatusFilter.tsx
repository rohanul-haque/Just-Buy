import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useSearchParams } from "react-router";

interface VendorStatusFilterProps {
  activeTab: "requests" | "list";
  className?: string;
}

export const VendorStatusFilter: React.FC<VendorStatusFilterProps> = ({
  activeTab,
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  if (activeTab === "list") {
    // In Vendor List tab, only APPROVED vendors are displayed.
    return (
      <div className={`w-full sm:w-44 ${className}`}>
        <Select value="APPROVED" disabled>
          <SelectTrigger className="w-full h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] shadow-xs">
            <SelectValue placeholder="Approved" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-[#E5E7EB] bg-white shadow-md">
            <SelectItem value="APPROVED" className="rounded-sm text-sm">
              Approved
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // In Vendor Requests tab: default view is PENDING, can filter by ALL, PENDING, REJECTED, SUSPENDED
  const rawStatus = searchParams.get("status");
  const currentStatus =
    rawStatus === "ALL" ||
    rawStatus === "REJECTED" ||
    rawStatus === "SUSPENDED"
      ? rawStatus
      : "PENDING";

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val === "PENDING") {
      params.delete("status"); // Default for requests
    } else {
      params.set("status", val);
    }
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className={`w-full sm:w-44 ${className}`}>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]">
          <SelectValue placeholder="Filter requests" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-[#E5E7EB] bg-white shadow-md">
          <SelectItem value="PENDING" className="rounded-sm text-sm">
            Pending
          </SelectItem>
          <SelectItem value="ALL" className="rounded-sm text-sm">
            All Requests
          </SelectItem>
          <SelectItem value="REJECTED" className="rounded-sm text-sm">
            Rejected
          </SelectItem>
          <SelectItem value="SUSPENDED" className="rounded-sm text-sm">
            Suspended
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VendorStatusFilter;
