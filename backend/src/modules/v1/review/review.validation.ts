import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createReviewSchema = z
  .object({
    product: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
    rating: z
      .number({ message: "Rating is required" })
      .int({ message: "Rating must be an integer" })
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot exceed 5" }),
    comment: z
      .string({ message: "Comment is required" })
      .trim()
      .min(1, { message: "Comment cannot be empty" })
      .max(1000, { message: "Comment cannot exceed 1000 characters" }),
  })
  .strict();

export const productIdParamsSchema = z
  .object({
    productId: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
  })
  .strict();

export type TCreateReviewInput = z.infer<typeof createReviewSchema>;
export type TProductIdParams = z.infer<typeof productIdParamsSchema>;

