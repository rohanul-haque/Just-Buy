export interface ReviewBuyer {
  _id: string;
  name: string;
  email?: string;
  avatar?: { url?: string };
}

export interface Review {
  _id: string;
  product: string;
  buyer: ReviewBuyer;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewInput {
  product: string;
  rating: number;
  comment: string;
}

