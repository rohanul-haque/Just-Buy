/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-party Module
 */
import { z } from "zod";

/**
 * Application InterFace
 */
import { PaymentMethod } from "@/modules/v1/order/order.interface";

/**
 * Order Validation
 */
export const createOrderSchema = z
  .object({
    shippingAddress: z
      .object({
        fullName: z.string().trim().min(2).max(100),
        location: z.string().trim(),
        phoneNumber: z.string().trim().min(10).max(20),
        emailAddress: z.string().trim().email(),
      })
      .strict(),

    paymentMethod: z.nativeEnum(PaymentMethod),
  })
  .strict();

/**
 * Type
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
