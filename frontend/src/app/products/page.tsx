"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductGrid } from "@/features/products/components/product-grid";
import { usePublicProducts } from "@/features/products/hooks/use-products";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchQuery);

  const [selectedCategory, setSelectedCategory] = React.useState<
    string | undefined
  >(searchParams.get("category") || undefined);

  const [selectedPriceTier, setSelectedPriceTier] = React.useState<
    string | undefined
  >(undefined);
  const [minPrice, setMinPrice] = React.useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = React.useState<number | undefined>(undefined);
  const [budgetInput, setBudgetInput] = React.useState<string>("");
  const [debouncedBudget, setDebouncedBudget] = React.useState<string>("");

  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce budget input for server-side filtering
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBudget(budgetInput);
      const trimmed = budgetInput.trim();
      if (trimmed) {
        const parsed = Number(trimmed);
        if (!isNaN(parsed) && parsed >= 0) {
          setMinPrice(0);
          setMaxPrice(parsed);
        }
      } else if (!selectedPriceTier) {
        setMinPrice(undefined);
        setMaxPrice(undefined);
      }
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [budgetInput, selectedPriceTier]);

  // Handle budget input
  const handleBudgetChange = (budget: string) => {
    setBudgetInput(budget);
    setSelectedPriceTier(undefined);
  };

  const handleSelectPriceTier = (
    tierLabel?: string,
    min?: number,
    max?: number,
  ) => {
    setSelectedPriceTier(tierLabel);
    setBudgetInput("");
    setDebouncedBudget("");
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  };

  const handleSelectCategory = (categoryId?: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory(undefined);
    setSelectedPriceTier(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setBudgetInput("");
    setDebouncedBudget("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Fetch paginated products using server-side query parameters (12 per page)
  const { data, isLoading } = usePublicProducts({
    page: currentPage,
    limit: 12,
    search: debouncedSearch.trim() || undefined,
    category: selectedCategory,
    minPrice,
    maxPrice,
  });

  const products = data?.data ?? [];

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const goToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage > 3) pages.push("ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="py-6 sm:py-10 bg-white min-h-screen">
      <Container className="space-y-8">
        {/* Top Header matching Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-8 w-3.5 rounded-xs bg-[#ff6200] inline-block shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-[#ff6200] tracking-wide">
                This Month
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900">
              All Products
            </h1>
          </div>

          {/* Search Box on right: Pure WHITE background as requested */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white pl-4 pr-10 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#ff6200] focus:outline-hidden focus:ring-1 focus:ring-[#ff6200] shadow-xs"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 text-neutral-800 pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden shrink-0 border-neutral-300 bg-white hover:bg-neutral-50"
              onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20">
            <ProductFilters
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedPriceTier={selectedPriceTier}
              onSelectPriceTier={handleSelectPriceTier}
              budgetInput={budgetInput}
              onBudgetChange={handleBudgetChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* Left Column: Filter Sidebar - Mobile Collapsible */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden col-span-1">
              <ProductFilters
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setIsMobileFiltersOpen(false);
                }}
                selectedPriceTier={selectedPriceTier}
                onSelectPriceTier={(label, min, max) => {
                  handleSelectPriceTier(label, min, max);
                  setIsMobileFiltersOpen(false);
                }}
                budgetInput={budgetInput}
                onBudgetChange={handleBudgetChange}
                onReset={() => {
                  handleResetFilters();
                  setIsMobileFiltersOpen(false);
                }}
              />
            </div>
          )}

          {/* Right Column: 3-column Product Grid */}
          <main className="col-span-1 lg:col-span-9 space-y-8">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              skeletonCount={12}
              columns={3}
            />

            {/* Bottom Pagination Bar */}
            {!isLoading && totalPages > 1 && (
              <div className="pt-6">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        disabled={currentPage <= 1}
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        className={cn(
                          "size-10 rounded-lg border border-neutral-200 bg-white shadow-none",
                          currentPage <= 1
                            ? "text-neutral-300 hover:bg-white cursor-not-allowed opacity-100"
                            : "text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900",
                        )}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((item, idx) =>
                      item === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis className="size-10 text-neutral-500" />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={item}>
                          <PaginationLink
                            isActive={item === currentPage}
                            onClick={() => goToPage(item)}
                            className={cn(
                              "size-10 rounded-lg text-sm font-medium shadow-none transition-colors",
                              item === currentPage
                                ? "bg-[#ff6200] hover:bg-[#e55800] text-white border border-[#ff6200]"
                                : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900",
                            )}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          goToPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={cn(
                          "size-10 rounded-lg border border-neutral-200 bg-white shadow-none",
                          currentPage >= totalPages
                            ? "text-neutral-300 hover:bg-white cursor-not-allowed opacity-100"
                            : "text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900",
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-12 text-center text-neutral-500 text-sm">
          Loading catalog...
        </div>
      }
    >
      <ProductsContent />
    </React.Suspense>
  );
}
