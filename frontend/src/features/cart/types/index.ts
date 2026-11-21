import type { ProductSize } from "@/features/products/types";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  featureImage?: {
    url: string;
    publicId?: string;
  };
  quantity?: number;
}

export interface CartItem {
  _id: string;
  product: CartProduct;
  quantity: number;
  size?: ProductSize;
}

export interface Cart {
  _id?: string;
  buyer: string;
  productItems: CartItem[];
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  size?: ProductSize;
}

export interface UpdateCartItemInput {
  itemId: string;
  quantity: number;
}

