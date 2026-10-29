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
 * Add To Cart Validation Schema
 */
export const addToCartSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .default(1),
});

/**
 * Product ID Schema
 */
export const IdSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid Product ID",
  }),
});
