"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { ProductImage } from "@/features/products/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // If no images provided, prepare placeholder list
  const displayImages = images.length > 0 ? images : [];
  const activeImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 items-start w-full">
      {/* 4 Vertical Thumbnails on Left matching Figma */}
      <div className="flex sm:flex-col gap-3 w-full sm:w-20 md:w-24 shrink-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
        {displayImages.length > 0 ? (
          displayImages.slice(0, 4).map((img, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative aspect-square w-16 sm:w-full overflow-hidden rounded-md bg-[#F5F5F5] dark:bg-neutral-900 border-2 transition-all p-1 cursor-pointer shrink-0",
                  isActive
                    ? "border-primary ring-1 ring-primary/40 shadow-xs"
                    : "border-transparent hover:border-border",
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              </button>
            );
          })
        ) : (
          <div className="aspect-square w-full rounded-md bg-[#F5F5F5] dark:bg-neutral-900 flex items-center justify-center">
            <ImageOff className="size-6 text-muted-foreground opacity-40" />
          </div>
        )}
      </div>

      {/* Main Large Preview Image matching Figma */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-lg bg-[#F5F5F5] dark:bg-neutral-900 flex items-center justify-center p-6 sm:p-10">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt={productName}
            fill
            unoptimized
            priority
            className="object-contain p-4 transition-all duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <ImageOff className="size-16 mb-2 opacity-40" />
            <span className="text-sm font-medium">No Image Available</span>
          </div>
        )}
      </div>
    </div>
  );
}

