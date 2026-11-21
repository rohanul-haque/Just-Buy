import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useSearchParams } from "react-router";

interface CategoryFilterSelectProps {
  className?: string;
}

export const CategoryFilterSelect: React.FC<CategoryFilterSelectProps> = ({
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = (
    searchParams.get("status") ||
    searchParams.get("filter") ||
    "all"
  ).toLowerCase();
  const currentStatus =
    rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "all";

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val === "all") {
      params.delete("status");
      params.delete("filter");
    } else {
      params.set("status", val);
      params.delete("filter");
    }
    setSearchParams(params);
  };

  return (
    <div className={`w-full sm:w-52 ${className}`}>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full h-10 rounded-md bg-white border-[#E5E7EB] text-sm text-[#0F172A] shadow-xs focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent className="rounded-md border-[#E5E7EB] bg-white shadow-md">
          <SelectItem value="all" className="rounded-sm text-sm">
            All Categories
          </SelectItem>
          <SelectItem value="active" className="rounded-sm text-sm">
            Active Categories
          </SelectItem>
          <SelectItem value="inactive" className="rounded-sm text-sm">
            Inactive Categories
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export { CategoryFilterSelect as CategoryStatusFilter };
export default CategoryFilterSelect;
