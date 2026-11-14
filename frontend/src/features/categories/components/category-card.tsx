"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Folder } from "lucide-react";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

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
        "group flex flex-col items-center justify-center rounded-xl border border-border/70 bg-muted/30 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs aspect-square",
        className,
      )}
    >
      <div className="relative size-16 sm:size-20 mb-3 flex items-center justify-center overflow-hidden rounded-lg">
        {hasImage ? (
          <Image
            src={category.image!.url}
            alt={category.name}
            fill
            unoptimized
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-muted-foreground group-hover:text-primary transition-colors">
            <Folder className="size-8" />
          </div>
        )}
      </div>

      <span className="text-xs sm:text-sm font-medium text-foreground transition-colors group-hover:text-primary text-center capitalize line-clamp-1">
        {category.name}
      </span>
    </Link>
  );
}

