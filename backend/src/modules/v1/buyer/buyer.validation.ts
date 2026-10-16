/**
 * @copyright 2026
 * @author Rohanul Hauqe Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Types } from "mongoose";
import { z } from "zod";

/**
 * Update Buyer Schema
 */
export const updateBuyerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .trim()
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
});

/**
 * Object ID Schema
 */
export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid User ID",
  });

/**
 * User ID Schema
 */
export const userIdSchema = z.object({
  userId: objectIdSchema,
});

/**
 * All Buyer List Query Schema
 */
export const buyerListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  offset: z.coerce.number().int().min(0).default(0),
  verificationStatus: z.enum(["pending", "verified", "rejected"]).optional(),
});

/**
 * Types
 */
export type BuyerListQueryInput = z.infer<typeof buyerListQuerySchema>;
export type UserIdParamsInput = z.infer<typeof userIdSchema>;
export type UpdateBuyerInput = z.infer<typeof updateBuyerSchema>;
