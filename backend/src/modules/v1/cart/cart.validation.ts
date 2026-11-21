import { ProductSize } from "@/modules/v1/product/product.constant";
import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addToCartSchema = z
  .object({
    productId: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
    quantity: z.coerce
      .number({ message: "Quantity is required" })
      .int({ message: "Quantity must be an integer" })
      .positive({ message: "Quantity must be a positive integer" }),
    size: z
      .enum(Object.values(ProductSize) as [string, ...string[]], {
        message: "Invalid product size",
      })
      .optional(),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce
      .number({ message: "Quantity is required" })
      .int({ message: "Quantity must be an integer" })
      .positive({ message: "Quantity must be a positive integer" }),
  })
  .strict();

export const cartItemParamsSchema = z
  .object({
    itemId: z
      .string({ message: "Item ID is required" })
      .regex(objectIdRegex, { message: "Invalid item ID format" }),
  })
  .strict();

export type TAddToCartInput = z.infer<typeof addToCartSchema>;
export type TUpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type TCartItemParams = z.infer<typeof cartItemParamsSchema>;
