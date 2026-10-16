/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Types } from "mongoose";
import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),

  category: z.string().trim().min(1, "Category is required"),

  brand: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters")
    .max(50, "Brand name cannot exceed 50 characters"),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .finite("Price must be a valid number"),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0),

  sizes: z
    .array(
      z.enum(["S", "M", "L", "XL", "XXL"], {
        message: "Invalid product size",
      }),
    )
    .max(5, "Maximum 5 sizes are allowed")
    .refine(
      (sizes) => new Set(sizes).size === sizes.length,
      "Duplicate sizes are not allowed",
    )
    .default([]),
});

/**
 * Update Product Validation Schema
 */
export const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  category: z.string().trim().min(1, "Category is required").optional(),

  brand: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters")
    .max(50, "Brand name cannot exceed 50 characters")
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .finite("Price must be a valid number")
    .optional(),

  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0)
    .optional(),

  sizes: z
    .array(
      z
        .enum(["S", "M", "L", "XL", "XXL"], {
          message: "Invalid product size",
        })
        .optional(),
    )
    .max(5, "Maximum 5 sizes are allowed")
    .refine(
      (sizes) => new Set(sizes).size === sizes.length,
      "Duplicate sizes are not allowed",
    )
    .default([]),
});

/**
 * Product ID Param Validation Schema
 */
// export const productIdSchema = z.object({
//   id: z.string().regex(objectIdRegex, "Invalid product ID"),
// });

/**
 * Product ID Param Validation Schema (Alternative parameter name)
 */
// export const productIdParamSchema = z.object({
//   productId: z.string().regex(objectIdRegex, "Invalid product ID"),
// });

/**
 * Get Products Query Validation Schema
 */
export const getProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  name: z.string().trim().optional(),
  price: z.coerce.number().min(0).optional(),
});

/**
 * Object ID Schema
 */
export const categoryObjectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid Category ID",
  });

/**
 * Category ID Schema
 */
export const productIdSchema = z.object({
  productId: categoryObjectIdSchema,
});

/**
 * Types
 */
// export type ProductImageInput = z.infer<typeof productImageSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
// export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdInput = z.infer<typeof productIdSchema>;
// export type ProductIdParamInput = z.infer<typeof productIdParamSchema>;
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>;
