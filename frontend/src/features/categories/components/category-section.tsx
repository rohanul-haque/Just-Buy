"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryCard } from "@/features/categories/components/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export function CategorySection() {
  const { data: categories, isLoading, isError } = useCategories();
  const [api, setApi] = React.useState<CarouselApi>();

  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );

  if (isError) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 border-t border-gray-200">
      {/* Section Header */}
      <div className="space-y-3.5 mb-8">
        <div className="flex items-center gap-3">
          <span className="h-9 w-4 sm:w-5 rounded-[4px] bg-[#fe6201] inline-block shrink-0" />
          <span className="text-sm sm:text-base font-semibold text-[#fe6201] tracking-wide">
            Categories
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Browse By Category
          </h2>

          {/* Left/Right circle arrow controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              aria-label="Previous categories"
              className="size-10 sm:size-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              aria-label="Next categories"
              className="size-10 sm:size-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            >
              <ArrowRight className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Carousel: 5 visible across on large screens with Embla Autoplay */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-sm bg-[#DFE1E3]" />
              <Skeleton className="h-4 w-3/4 mx-auto rounded-sm" />
            </div>
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No categories found.
        </div>
      ) : (
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-5 sm:-ml-6 pb-3">
            {categories.map((category) => (
              <CarouselItem
                key={category._id}
                className="pl-5 sm:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <CategoryCard category={category} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </section>
  );
}

export default CategorySection;
