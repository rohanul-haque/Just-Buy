import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ICategory } from "@/types/category";
import React from "react";

interface CategoryCardProps {
  category: ICategory;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
  onToggleStatus?: (category: ICategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80";
  const imageUrl = category.image?.url || fallbackImage;

  return (
    <Card className="rounded-md p-5 border-[#E5E7EB] bg-white flex flex-col justify-between transition-colors shadow-xs">
      {/* Category Icon / Image */}
      <div className="relative w-full flex items-center justify-center py-2 mb-3">
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={category.name}
            className="w-full h-full object-cover object-center rounded-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>

        {/* Clear Active / Inactive Status Badge (shadcn/ui Badge) */}
        <Badge
          variant="outline"
          onClick={() => onToggleStatus?.(category)}
          className={cn(
            "absolute top-0 right-1 text-[11px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5 transition-colors",
            onToggleStatus ? "cursor-pointer hover:opacity-80" : "",
            category.isActive
              ? "bg-[#E0E7FF] text-[#4F46E5] border-[#C7D2FE]"
              : "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
          )}
          title={onToggleStatus ? `Status: ${category.isActive ? "Active" : "Inactive"} (Click to switch)` : `Status: ${category.isActive ? "Active" : "Inactive"}`}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full inline-block",
              category.isActive ? "bg-[#4F46E5]" : "bg-[#94A3B8]",
            )}
          />
          {category.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Category Name */}
      <h3
        className="text-sm font-semibold text-[#0F172A] text-center mb-4 truncate px-1"
        title={category.name}
      >
        {category.name}
      </h3>

      {/* Actions (Standardized shadcn/ui Buttons with MD border-radius) */}
      <div className="flex items-center gap-2 w-full pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(category)}
          className="flex-1 h-9 rounded-md text-xs font-medium bg-white text-[#0F172A] border-[#E5E7EB] hover:bg-[#F8FAFC] hover:text-[#EF4444]"
        >
          Delete
        </Button>
        <Button
          size="sm"
          onClick={() => onEdit(category)}
          className="flex-1 h-9 rounded-md text-xs font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          Edit
        </Button>
      </div>
    </Card>
  );
};

export default CategoryCard;
