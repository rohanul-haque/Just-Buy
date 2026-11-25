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

  const displayImages = images.length > 0 ? images : [];
  const activeImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4 items-start w-full max-w-xl mx-auto lg:mx-0">
      {/* Thumbnails on Left: No background, no border, no rounded border */}
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
                  "relative aspect-square w-16 sm:w-full overflow-hidden bg-transparent transition-opacity cursor-pointer shrink-0",
                  isActive
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </button>
            );
          })
        ) : (
          <div className="aspect-square w-full bg-transparent flex items-center justify-center">
            <ImageOff className="size-6 text-muted-foreground opacity-40" />
          </div>
        )}
      </div>

      {/* Main Feature Image: No background, no border, no rounded border */}
      <div className="relative aspect-[4/3.5] sm:aspect-square w-full max-w-[460px] max-h-[460px] overflow-hidden bg-transparent flex items-center justify-center p-2">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt={productName}
            fill
            unoptimized
            priority
            className="object-contain transition-all duration-300"
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

export default ProductGallery;
