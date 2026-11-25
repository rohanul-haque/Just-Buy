"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

const PRICE_TIERS = [
  { label: "Value Under $20", min: 0, max: 20 },
  { label: "Mid-range $20-$60", min: 20, max: 60 },
  { label: "High-end $60 & Above", min: 60, max: undefined },
];

interface ProductFiltersProps {
  selectedCategory?: string;
  onSelectCategory: (categoryId?: string) => void;
  selectedPriceTier?: string;
  onSelectPriceTier: (tierLabel?: string, min?: number, max?: number) => void;
  budgetInput?: string;
  onBudgetChange: (budget: string) => void;
  onReset: () => void;
}

export function ProductFilters({
  selectedCategory,
  onSelectCategory,
  selectedPriceTier,
  onSelectPriceTier,
  budgetInput,
  onBudgetChange,
  onReset,
}: ProductFiltersProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(true);
  const [isPriceOpen, setIsPriceOpen] = React.useState(true);

  const hasActiveFilters = Boolean(
    selectedCategory || selectedPriceTier || budgetInput,
  );

  const categoryItems = (categories ?? []).map((c) => ({
    id: c._id,
    name: c.name,
  }));

  return (
    <div className="flex flex-col rounded-md border border-neutral-200/90 bg-white overflow-hidden shadow-xs">
      {/* Orange Filters Header matching Mockup */}
      <div className="flex items-center justify-between bg-[#ff6200] px-4 py-3 text-white">
        <span className="font-bold text-base tracking-wide">Filters</span>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </button>
        ) : null}
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* Category Filter Accordion */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsCategoryOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-semibold text-[#ff6200] cursor-pointer select-none"
          >
            <span>Category</span>
            {isCategoryOpen ? (
              <ChevronUp className="size-4 text-[#ff6200]" />
            ) : (
              <ChevronDown className="size-4 text-[#ff6200]" />
            )}
          </button>

          {isCategoryOpen && (
            <div className="mt-2.5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {isCategoriesLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full rounded-xs" />
                  ))}
                </div>
              ) : (
                categoryItems.map((cat) => {
                  const isChecked = selectedCategory === cat.id;
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800 hover:text-neutral-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onSelectCategory(isChecked ? undefined : cat.id)
                        }
                        className="size-4 rounded-xs border-neutral-300 text-[#ff6200] accent-[#ff6200] focus:ring-[#ff6200] cursor-pointer"
                      />
                      <span className="capitalize text-neutral-800">{cat.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Price Filter Accordion */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setIsPriceOpen((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-semibold text-[#ff6200] cursor-pointer select-none"
          >
            <span>Price</span>
            {isPriceOpen ? (
              <ChevronUp className="size-4 text-[#ff6200]" />
            ) : (
              <ChevronDown className="size-4 text-[#ff6200]" />
            )}
          </button>

          {isPriceOpen && (
            <div className="mt-2.5 space-y-3">
              <div className="space-y-2.5">
                {PRICE_TIERS.map((tier) => {
                  const isChecked = selectedPriceTier === tier.label;
                  return (
                    <label
                      key={tier.label}
                      className="flex items-center gap-3 text-xs sm:text-sm text-neutral-800 hover:text-neutral-900 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onSelectPriceTier(
                            isChecked ? undefined : tier.label,
                            isChecked ? undefined : tier.min,
                            isChecked ? undefined : tier.max,
                          )
                        }
                        className="size-4 rounded-xs border-neutral-300 text-[#ff6200] accent-[#ff6200] focus:ring-[#ff6200] cursor-pointer"
                      />
                      <span>{tier.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Custom Budget Input matching Mockup: "Enter budget $" */}
              <div className="pt-2">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter budget"
                    min="0"
                    value={budgetInput}
                    onChange={(e) => onBudgetChange(e.target.value)}
                    className="w-full rounded-xs border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#ff6200] focus:outline-hidden focus:ring-1 focus:ring-[#ff6200] pr-7 shadow-2xs"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500 pointer-events-none">
                    $
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductFilters;
