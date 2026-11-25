"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CATEGORIES = [
  { name: "Woman's Fashion", href: "/products?category=womans-fashion" },
  { name: "Men's Fashion", href: "/products?category=mens-fashion" },
  { name: "Electronics", href: "/products?category=electronics" },
  { name: "Home & Lifestyle", href: "/products?category=home-lifestyle" },
  { name: "Medicine", href: "/products?category=medicine" },
  { name: "Sports & Outdoor", href: "/products?category=sports-outdoor" },
  { name: "Baby's & Toys", href: "/products?category=babys-toys" },
  { name: "Groceries & Pets", href: "/products?category=groceries-pets" },
  { name: "Health & Beauty", href: "/products?category=health-beauty" },
];

export function HeroSection() {
  const { data: categories, isLoading } = useCategories();

  // If backend categories exist, use them; otherwise use default mockup categories
  const displayCategories =
    categories && categories.length > 0
      ? categories.slice(0, 12).map((cat) => ({
          id: cat._id,
          name: cat.name,
          href: `/products?category=${encodeURIComponent(cat._id)}`,
        }))
      : DEFAULT_CATEGORIES.map((cat, idx) => ({
          id: String(idx),
          name: cat.name,
          href: cat.href,
        }));

  return (
    <section className="pb-10 sm:pb-14">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-start">
        {/* Left Category Sidebar with clean vertical divider - Desktop */}
        <aside className="hidden lg:block lg:col-span-3 border-r border-gray-200/80 pr-6 pt-8 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-3/4 rounded-md" />
              ))}
            </div>
          ) : (
            <nav className="flex flex-col space-y-2.5">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="text-[15px] font-medium text-black hover:text-[#fe6201] transition-colors leading-tight block"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}
        </aside>

        {/* Right Hero Section Banner matching uploaded mockup */}
        <div className="lg:col-span-9 pt-6 lg:pt-8 lg:pl-6">
          <div className="relative w-full aspect-[590/227] rounded-2xl overflow-hidden shadow-xs group bg-black">
            <Link
              href="/products"
              className="block w-full h-full relative cursor-pointer"
              aria-label="Shop Online Promo"
            >
              <Image
                src="/hero-banner.png"
                alt="Shop Online Hero Banner"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 75vw"
                className="object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </Link>
          </div>

          {/* Responsive Mobile Category Scroll for small screens */}
          <div className="lg:hidden mt-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="shrink-0 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-800 hover:border-[#fe6201] hover:text-[#fe6201] transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
