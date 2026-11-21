export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  featureImage?: {
    url: string;
    publicId?: string;
  };
}

export interface Wishlist {
  _id?: string;
  buyer: string;
  products: WishlistProduct[];
}

