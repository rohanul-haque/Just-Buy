import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useSearchParams } from "react-router";

interface BuyerStatusFilterProps {
  className?: string;
}

export const BuyerStatusFilter: React.FC<BuyerStatusFilterProps> = ({
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get("status") || "ALL";
  const currentStatus =
    rawStatus === "ACTIVE" || rawStatus === "BLOCKED" ? rawStatus : "ALL";

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
        <SelectTrigger className="w-full h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-[#E5E7EB] bg-white shadow-md">
          <SelectItem value="ALL" className="rounded-sm text-sm">
            All Statuses
          </SelectItem>
          <SelectItem value="ACTIVE" className="rounded-sm text-sm">
            Active
          </SelectItem>
          <SelectItem value="BLOCKED" className="rounded-sm text-sm">
            Blocked
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BuyerStatusFilter;
