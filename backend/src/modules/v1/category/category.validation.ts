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

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Category name is required" })
      .max(100, { message: "Category name cannot exceed 100 characters" }),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Category name cannot be empty" })
      .max(100, { message: "Category name cannot exceed 100 characters" })
      .optional(),
    isActive: z.preprocess(booleanPreprocessor, z.boolean().optional()),
  })
  .strict();

export const updateCategoryStatusSchema = z
  .object({
    isActive: z.preprocess(
      booleanPreprocessor,
      z.boolean({
        message: "isActive is required and must be a boolean",
      }),
    ),
  })
  .strict();

export const categoryIdParamsSchema = z
  .object({
    categoryId: z
      .string()
      .regex(objectIdRegex, { message: "Invalid category ID" }),
  })
  .strict();

export const categoryQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    isActive: z.preprocess(booleanPreprocessor, z.boolean().optional()),
    sort: z.string().trim().optional(),
  })
  .strict();

export type TCreateCategoryInput = z.infer<typeof createCategorySchema>;
export type TUpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type TUpdateCategoryStatus = z.infer<typeof updateCategoryStatusSchema>;
export type TCategoryQuery = z.infer<typeof categoryQuerySchema>;
