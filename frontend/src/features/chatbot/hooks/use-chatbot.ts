import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/features/chatbot/services/chatbot-service";
import type { SendChatMessagePayload } from "@/features/chatbot/types";
import { CART_QUERY_KEY } from "@/features/cart/hooks/use-cart";
import { WISHLIST_KEYS } from "@/features/wishlist/hooks/use-wishlist";

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendChatMessagePayload) =>
      chatbotService.sendMessage(payload),
    onSuccess: (data) => {
      if (data.actions?.some((a) => a.type === "CART_UPDATED")) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      }
      if (data.actions?.some((a) => a.type === "WISHLIST_UPDATED")) {
        queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
      }
    },
  });
}
