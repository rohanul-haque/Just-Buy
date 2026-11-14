"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/features/cart/services/cart-service";
import type {
  Cart,
  AddToCartInput,
  UpdateCartItemInput,
} from "@/features/cart/types";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";

export const CART_KEYS = {
  all: ["cart"] as const,
  current: () => [...CART_KEYS.all, "current"] as const,
};
export const CART_QUERY_KEY = CART_KEYS.all;

export function useCart() {
  const { data: user } = useCurrentUser();

  return useQuery<Cart, Error>({
    queryKey: CART_KEYS.current(),
    queryFn: () => cartService.getCart(),
    enabled: Boolean(user),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, AddToCartInput>({
    mutationFn: (payload) => cartService.addToCart(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_KEYS.current(), data);
      queryClient.invalidateQueries({ queryKey: CART_KEYS.current() });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, UpdateCartItemInput>({
    mutationFn: (payload) => cartService.updateCartItem(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_KEYS.current(), data);
      queryClient.invalidateQueries({ queryKey: CART_KEYS.current() });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, string>({
    mutationFn: (itemId) => cartService.removeCartItem(itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(CART_KEYS.current(), data);
      queryClient.invalidateQueries({ queryKey: CART_KEYS.current() });
    },
  });
}

