"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/features/categories/services/category-service";
import type { CategoryQueryParams } from "@/features/categories/types";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

/**
 * Hook to retrieve all active categories
 */
export function useCategories(params?: CategoryQueryParams) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, params],
    queryFn: () => categoryService.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

/**
 * Hook to retrieve category details by ID
 */
export function useCategoryDetail(categoryId: string) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60 * 1000,
  });
}

