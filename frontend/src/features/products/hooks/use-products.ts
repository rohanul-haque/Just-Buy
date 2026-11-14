import { useQuery } from "@tanstack/react-query";
import { productService } from "@/features/products/services/product-service";
import type {
  Product,
  ProductQueryParams,
  PaginatedProductsResponse,
} from "@/features/products/types";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  list: (params?: ProductQueryParams) =>
    [...PRODUCT_KEYS.all, "list", params] as const,
  newArrivals: (limit: number) =>
    [...PRODUCT_KEYS.all, "new-arrivals", limit] as const,
  explore: (limit: number) => [...PRODUCT_KEYS.all, "explore", limit] as const,
  detail: (productId: string) =>
    [...PRODUCT_KEYS.all, "detail", productId] as const,
  related: (productId: string, limit: number) =>
    [...PRODUCT_KEYS.all, "related", productId, limit] as const,
};

export function usePublicProducts(params?: ProductQueryParams) {
  return useQuery<PaginatedProductsResponse, Error>({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productService.getPublicProducts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useNewArrivals(limit: number = 4) {
  return useQuery<Product[], Error>({
    queryKey: PRODUCT_KEYS.newArrivals(limit),
    queryFn: () => productService.getNewArrivals(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useExploreProducts(limit: number = 8) {
  return useQuery<Product[], Error>({
    queryKey: PRODUCT_KEYS.explore(limit),
    queryFn: () => productService.getExploreProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetail(productId: string) {
  return useQuery<Product, Error>({
    queryKey: PRODUCT_KEYS.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRelatedProducts(productId: string, limit: number = 4) {
  return useQuery<Product[], Error>({
    queryKey: PRODUCT_KEYS.related(productId, limit),
    queryFn: () => productService.getRelatedProducts(productId, limit),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });
}

