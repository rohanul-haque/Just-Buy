export type ChatMessageRole = "user" | "assistant";

export interface ChatProductCard {
  id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
  inStock: boolean;
  sizes: string[];
  image?: string;
  category?: string;
}

export interface ChatAction {
  type: "CART_UPDATED" | "WISHLIST_UPDATED";
  productId: string;
}

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  products?: ChatProductCard[];
  createdAt: string;
}

export interface ChatHistoryItem {
  role: ChatMessageRole;
  content: string;
}

export interface SendChatMessagePayload {
  message: string;
  history?: ChatHistoryItem[];
}

export interface SendChatMessageResponse {
  reply: string;
  products?: ChatProductCard[];
  actions?: ChatAction[];
}
