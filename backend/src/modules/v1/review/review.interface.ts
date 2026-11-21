import type { Document, Types } from "mongoose";

export interface IReview extends Document {
  product: Types.ObjectId;
  buyer: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReviewInput {
  product: string;
  rating: number;
  comment: string;
}

