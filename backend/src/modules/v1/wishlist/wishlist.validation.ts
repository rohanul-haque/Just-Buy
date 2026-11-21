import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addWishlistItemSchema = z
  .object({
    productId: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
  })
  .strict();

export const productIdParamsSchema = z
  .object({
    productId: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
  })
  .strict();

export type TAddWishlistItemInput = z.infer<typeof addWishlistItemSchema>;
export type TProductIdParams = z.infer<typeof productIdParamsSchema>;

