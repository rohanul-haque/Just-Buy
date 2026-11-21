import { z } from "zod";

export const createReviewSchema = z.object({
  product: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Please select at least 1 star")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .trim()
    .min(2, "Review comment must be at least 2 characters")
    .max(1000, "Review comment cannot exceed 1000 characters"),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;

