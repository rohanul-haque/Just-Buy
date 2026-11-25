"use client";

import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";
import { Folder } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const hasImage = Boolean(category.image?.url);

  return (
    <Link
      href={`/products?category=${encodeURIComponent(category._id)}`}
      className={cn(
        "group flex flex-col items-center transition-all duration-200 cursor-pointer",
        className,
      )}
    >
      {/* Clean card with no background, just light border */}
      <div className="relative aspect-square w-full rounded-xl border border-neutral-200 bg-white overflow-hidden flex items-center justify-center p-4 transition-all duration-200 hover:shadow-xs group-hover:border-neutral-300">
        {hasImage ? (
          <Image
            src={category.image!.url}
            alt={category.name}
            fill
            unoptimized
            className="object-contain mx-auto p-3 transition-transform duration-300 group-hover:scale-105 max-w-[120px] w-full"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400 group-hover:text-[#ff6200] transition-colors">
            <Folder className="size-12 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Label in brand orange text without underline on hover */}
      <span className="text-sm sm:text-base font-semibold text-[#ff6200] text-center mt-3 capitalize line-clamp-1 transition-colors">
        {category.name}
      </span>
    </Link>
  );
}

export default CategoryCard;
