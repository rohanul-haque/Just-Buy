import { ProductSize } from "@/modules/v1/product/product.constant";
import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const booleanPreprocessor = (val: unknown): unknown => {
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    if (trimmed === "true" || trimmed === "1") return true;
    if (trimmed === "false" || trimmed === "0") return false;
  }
  return val;
};

const jsonOrArrayPreprocessor = (val: unknown): unknown => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

const sizesValidation = z.preprocess(
  jsonOrArrayPreprocessor,
  z
    .array(
      z.enum(Object.values(ProductSize) as [string, ...string[]], {
        message: "Size must be one of S, M, L, XL, XXL",
      }),
    )
    .refine((items) => new Set(items).size === items.length, {
      message: "Duplicate size entries are prohibited",
    })
    .optional(),
);

export const createProductSchema = z
  .object({
    category: z
      .string({ message: "Category ID is required" })
      .regex(objectIdRegex, { message: "Invalid category ID format" }),
    name: z
      .string({ message: "Product name is required" })
      .trim()
      .min(2, { message: "Product name must be at least 2 characters" })
      .max(200, { message: "Product name cannot exceed 200 characters" }),
    description: z
      .string({ message: "Product description is required" })
      .trim()
      .min(5, { message: "Product description must be at least 5 characters" }),
    brand: z.string().trim().max(100).optional(),
    price: z.coerce
      .number({ message: "Price is required" })
      .positive({ message: "Price must be greater than zero" }),
    stock: z.coerce.number({ message: "Stock is required" }).int().nonnegative({
      message: "Stock must be a non-negative integer",
    }),
    sizes: sizesValidation,
  })
  .strict();

export const updateProductSchema = z
  .object({
    category: z
      .string()
      .regex(objectIdRegex, { message: "Invalid category ID format" })
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, { message: "Product name must be at least 2 characters" })
      .max(200, { message: "Product name cannot exceed 200 characters" })
      .optional(),
    description: z
      .string()
      .trim()
      .min(5, { message: "Product description must be at least 5 characters" })
      .optional(),
    brand: z.string().trim().max(100).optional(),
    price: z.coerce
      .number()
      .positive({ message: "Price must be greater than zero" })
      .optional(),
    stock: z.coerce
      .number()
      .int()
      .nonnegative({
        message: "Stock must be a non-negative integer",
      })
      .optional(),
    sizes: sizesValidation,
    isActive: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  })
  .strict();

export const productIdParamsSchema = z
  .object({
    productId: z
      .string({ message: "Product ID is required" })
      .regex(objectIdRegex, { message: "Invalid product ID format" }),
  })
  .strict();

export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(15),
    skip: z.coerce.number().int().nonnegative().optional(),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    isActive: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  })
  .strict();

export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
export type TProductIdParams = z.infer<typeof productIdParamsSchema>;
export type TProductQuery = z.infer<typeof productQuerySchema>;
