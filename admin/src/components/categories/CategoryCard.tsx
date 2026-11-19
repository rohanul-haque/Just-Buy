import React from "react";
import type { ICategory } from "@/types/category";

interface CategoryCardProps {
  category: ICategory;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80";
  const imageUrl = category.image?.url || fallbackImage;

  return (
    <div className="bg-white rounded-[16px] p-5 md:p-[28px] border border-[#E5E7EB] flex flex-col justify-between transition-colors">
      {/* Category Image / Icon */}
      <div className="w-full aspect-square relative mb-4 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover object-center rounded-[16px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        {!category.isActive && (
          <span className="absolute top-2 right-2 bg-[#1F2937]/80 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* Category Name */}
      <h3
        className="text-sm md:text-base font-semibold text-[#0F172A] text-center mb-4 truncate"
        title={category.name}
      >
        {category.name}
      </h3>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full pt-1">
        <button
          type="button"
          onClick={() => onDelete(category)}
          className="flex-1 h-9 py-1.5 px-3 rounded-full text-xs font-medium bg-white text-[#0F172A] border border-[#E5E7EB] hover:bg-[#F8FAFC] hover:text-[#EF4444] transition-colors cursor-pointer text-center"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="flex-1 h-9 py-1.5 px-3 rounded-full text-xs font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-colors cursor-pointer text-center"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
