import { OrderStatus, OrderType } from "@/modules/v1/order/order.constant";
import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const phoneNumberRegex = /^[+0-9\s-]{7,20}$/;

export const shippingAddressSchema = z
  .object({
    fullName: z
      .string({ message: "Full name is required" })
      .trim()
      .min(1, "Full name cannot be empty")
      .max(100, "Full name cannot exceed 100 characters"),
    phoneNumber: z
      .string({ message: "Phone number is required" })
      .trim()
      .regex(phoneNumberRegex, { message: "Invalid phone number format" }),
    address: z
      .string({ message: "Address is required" })
      .trim()
      .min(1, "Address cannot be empty")
      .max(300, "Address cannot exceed 300 characters"),
    city: z
      .string({ message: "City is required" })
      .trim()
      .min(1, "City cannot be empty")
      .max(100, "City cannot exceed 100 characters"),
    postalCode: z
      .string({ message: "Postal code is required" })
      .trim()
      .min(1, "Postal code cannot be empty")
      .max(20, "Postal code cannot exceed 20 characters"),
    country: z.string().trim().default("Bangladesh").optional(),
  })
  .strict();

export const createOrderSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === "object" && !val.shippingAddress && val.address) {
      const { orderType, ...shippingAddress } = val;
      return { orderType, shippingAddress };
    }
    return val;
  },
  z
    .object({
      orderType: z
        .enum(Object.values(OrderType) as [string, ...string[]], {
          message: "Order type must be either COD or ONLINE",
        })
        .default(OrderType.COD)
        .optional(),
      shippingAddress: shippingAddressSchema,
    })
    .strict(),
);

export const orderIdParamsSchema = z
  .object({
    orderId: z
      .string({ message: "Order ID is required" })
      .regex(objectIdRegex, { message: "Invalid order ID format" }),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(Object.values(OrderStatus) as [string, ...string[]], {
      message: "Invalid order status",
    }),
    note: z
      .string()
      .trim()
      .max(500, "Note cannot exceed 500 characters")
      .optional(),
  })
  .strict();

export const orderQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    skip: z.coerce.number().int().nonnegative().optional(),
    status: z
      .enum(Object.values(OrderStatus) as [string, ...string[]])
      .optional(),
    orderType: z
      .enum(Object.values(OrderType) as [string, ...string[]])
      .optional(),
  })
  .strict();

export type TShippingAddress = z.infer<typeof shippingAddressSchema>;
export type TCreateOrderInput = z.infer<typeof createOrderSchema>;
export type TOrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type TUpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;
export type TOrderQuery = z.infer<typeof orderQuerySchema>;
