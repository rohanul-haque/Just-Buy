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
import { OrderStatus, PaymentMethod } from "@/modules/v1/order/order.interface";
import { Types } from "mongoose";

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
 * Update Order Status Schema
 */
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

/**
 * Object Id Schema
 */
export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: "Invalid ID",
  });

export const orderIdSchema = z.object({
  orderId: objectIdSchema,
});

/**
 * Type
 */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderIdParamsInput = z.infer<typeof orderIdSchema>;
