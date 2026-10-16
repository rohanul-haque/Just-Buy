/**
 * @copyright 2026
 * @author Rohanul Hauqe Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import mongoose from "mongoose";
import { z } from "zod";

/**
 * Update Seller Schema
 */
export const updateSellerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Please provide a valid email")
    .max(254, "Email cannot exceed 254 characters")
    .trim()
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number cannot be empty")
    .max(15, "Phone number cannot exceed 15 digits")
    .trim()
    .optional(),
  shopAddress: z
    .string()
    .min(10, "Shop address must be at least 10 characters")
    .max(254, "Shop address cannot exceed 254 characters")
    .trim()
    .optional(),
  storeName: z
    .string()
    .min(3, "Store name must be at least 3 characters")
    .max(150, "Store name cannot exceed 150 characters")
    .trim()
    .optional(),
});

/**
 * Object ID Schema
 */
export const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid User ID",
  });

/**
 * User ID Schema
 */
export const userIdSchema = z.object({
  userId: objectIdSchema,
});

/**
 * Seller List Query Schema
 */
export const sellerListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  offset: z.coerce.number().int().min(0).default(0),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
});

/**
 * Type
 */
export type SellerListQueryInput = z.infer<typeof sellerListQuerySchema>;
export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
export type UserIdParamsInput = z.infer<typeof userIdSchema>;
