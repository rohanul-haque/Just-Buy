"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryCard } from "@/features/categories/components/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function CategorySection() {
  const { data: categories, isLoading, isError } = useCategories();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isError || (!isLoading && (!categories || categories.length === 0))) {
    return null;
  }

  return (
    <section className="space-y-6 py-6 sm:py-8">
      {/* Section Header matching Figma */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-7 w-3 rounded-xs bg-primary inline-block" />
          <span className="text-xs sm:text-sm font-semibold text-primary tracking-wide">
            Categories
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Browse By Category
          </h2>

          {/* Left/Right scroll controls matching Figma */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full bg-muted/40 hover:bg-muted"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-9 rounded-full bg-muted/40 hover:bg-muted"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Row/Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {categories?.map((category) => (
            <div
              key={category._id}
              className="w-[140px] sm:w-[160px] md:w-[170px] shrink-0"
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

