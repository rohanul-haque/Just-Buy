export type TChatMessageRole = "user" | "assistant";

export interface IChatProductCard {
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

export interface IChatAction {
  type: "CART_UPDATED" | "WISHLIST_UPDATED";
  productId: string;
}

export interface IChatHistoryItem {
  role: TChatMessageRole;
  content: string;
}

export interface ISendChatMessageInput {
  message: string;
  history?: IChatHistoryItem[];
}

export interface IChatResponse {
  reply: string;
  products?: IChatProductCard[];
  actions?: IChatAction[];
}
