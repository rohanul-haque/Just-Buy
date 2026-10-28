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

  category: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid Category ID",
  }),

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

  sizes: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      return value;
    },
    z
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
  ),
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

  sizes: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }

      return value;
    },
    z
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
  ),
});

/**
 * Get Products Query Validation Schema
 */
export const getProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(15).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

/**
 * Product ID Schema
 */
export const productIdSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid Product ID",
  }),
});
