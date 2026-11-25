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
    <div className={`w-full sm:w-52 shrink-0 ${className}`}>
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full h-10 rounded-xl bg-[#FFE7D9] border border-[#ffceb0]/80 text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#fe6201] focus:border-[#fe6201]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border border-[#ffceb0]/80 bg-[#FFE7D9] shadow-md">
          <SelectItem value="list" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Vendor List
          </SelectItem>
          <SelectItem value="requests" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Vendor Requests
          </SelectItem>
          <SelectItem value="rejected" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Rejected
          </SelectItem>
          <SelectItem value="suspended" className="rounded-md text-sm hover:bg-[#ffceb0]/40">
            Suspended
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VendorCategorySelect;
