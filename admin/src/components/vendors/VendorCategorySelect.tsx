import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TVendorCategory } from "@/types/vendor";
import React from "react";
import { useSearchParams } from "react-router";

interface VendorCategorySelectProps {
  category: TVendorCategory;
  className?: string;
}

export const VendorCategorySelect: React.FC<VendorCategorySelectProps> = ({
  category,
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleCategoryChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === "list") {
      newParams.delete("category");
      newParams.delete("tab");
    } else {
      newParams.set("category", val);
      newParams.delete("tab");
    }
    newParams.delete("status");
    newParams.delete("page"); // Reset pagination
    setSearchParams(newParams);
  };

  return (
    <div className={`w-full sm:w-48 shrink-0 ${className}`}>
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-[#E5E7EB] bg-white shadow-md">
          <SelectItem value="list" className="rounded-sm text-sm">
            Vendor List
          </SelectItem>
          <SelectItem value="requests" className="rounded-sm text-sm">
            Vendor Requests
          </SelectItem>
          <SelectItem value="rejected" className="rounded-sm text-sm">
            Rejected
          </SelectItem>
          <SelectItem value="suspended" className="rounded-sm text-sm">
            Suspended
          </SelectItem>
          <SelectItem value="pending" className="rounded-sm text-sm">
            Pending
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VendorCategorySelect;
