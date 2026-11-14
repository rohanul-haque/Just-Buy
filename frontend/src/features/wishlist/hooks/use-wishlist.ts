"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistService } from "@/features/wishlist/services/wishlist-service";
import type { Wishlist } from "@/features/wishlist/types";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";

export const WISHLIST_KEYS = {
  all: ["wishlist"] as const,
  current: () => [...WISHLIST_KEYS.all, "current"] as const,
};

export function useWishlist() {
  const { data: user } = useCurrentUser();

  return useQuery<Wishlist, Error>({
    queryKey: WISHLIST_KEYS.current(),
    queryFn: () => wishlistService.getWishlist(),
    enabled: Boolean(user),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation<Wishlist, Error, string>({
    mutationFn: (productId) => wishlistService.addToWishlist(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_KEYS.current(), data);
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.current() });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation<Wishlist, Error, string>({
    mutationFn: (productId) => wishlistService.removeFromWishlist(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(WISHLIST_KEYS.current(), data);
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.current() });
    },
  });
}

