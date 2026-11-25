import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useSearchParams } from "react-router";

interface EarningsStatusFilterProps {
  className?: string;
}

export const EarningsStatusFilter: React.FC<EarningsStatusFilterProps> = ({
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status") || "ALL";
  const currentStatus =
    rawStatus === "DELIVERED" || rawStatus === "PENDING" || rawStatus === "CANCELLED"
      ? rawStatus
      : "ALL";

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val === "ALL" || !val) {
      params.delete("status");
    } else {
      params.set("status", val);
    }
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className={`w-full sm:w-48 ${className}`}>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full h-10 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#fe6201] focus:border-[#fe6201]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] shadow-md">
          <SelectItem value="ALL" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            All Statuses
          </SelectItem>
          <SelectItem value="DELIVERED" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Delivered
          </SelectItem>
          <SelectItem value="PENDING" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Pending
          </SelectItem>
          <SelectItem value="CANCELLED" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Cancelled
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EarningsStatusFilter;
