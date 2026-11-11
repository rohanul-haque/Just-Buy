"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buyerService } from "@/features/buyer/services/buyer-service";
import type {
  BuyerProfile,
  UpdateBuyerProfileInput,
  Order,
  OrdersPagination,
} from "@/features/buyer/types";
import { AUTH_QUERY_KEY } from "@/features/auth/hooks/use-auth";
import type { ApiErrorResponse } from "@/lib/api-error";

export const BUYER_PROFILE_KEY = ["buyer", "me"] as const;
export const BUYER_ORDERS_KEY = ["orders", "my-orders"] as const;

/**
 * Hook to retrieve current buyer's profile
 */
export function useBuyerProfile() {
  return useQuery({
    queryKey: BUYER_PROFILE_KEY,
    queryFn: () => buyerService.getProfile(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to update buyer profile and/or avatar
 */
export function useUpdateBuyerProfile() {
  const queryClient = useQueryClient();

  return useMutation<BuyerProfile, ApiErrorResponse, UpdateBuyerProfileInput>({
    mutationFn: (payload) => buyerService.updateProfile(payload),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(BUYER_PROFILE_KEY, updatedProfile);
      queryClient.invalidateQueries({ queryKey: BUYER_PROFILE_KEY });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}

/**
 * Hook to retrieve paginated buyer orders
 */
export function useMyOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  return useQuery<{ orders: Order[]; pagination?: OrdersPagination }>({
    queryKey: [...BUYER_ORDERS_KEY, params],
    queryFn: () => buyerService.getMyOrders(params),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

/**
 * Hook to retrieve single order detail
 */
export function useOrderDetail(orderId: string) {
  return useQuery<Order>({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => buyerService.getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, ApiErrorResponse, string>({
    mutationFn: (orderId) => buyerService.cancelOrder(orderId),
    onSuccess: (canceledOrder) => {
      queryClient.invalidateQueries({ queryKey: BUYER_ORDERS_KEY });
      queryClient.invalidateQueries({
        queryKey: ["orders", "detail", canceledOrder._id],
      });
    },
  });
}

