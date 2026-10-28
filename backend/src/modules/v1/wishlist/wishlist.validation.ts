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
 * User ID Schema
 */
export const idSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid User ID",
  }),
});

/**
 * Wishlist Query Schema
 */
export const wishListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  offset: z.coerce.number().int().min(0).default(0),
});
