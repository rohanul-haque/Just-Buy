import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const paymentIdParamsSchema = z
  .object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .regex(objectIdRegex, { message: "Invalid payment ID format" }),
  })
  .strict();

export const orderIdParamsSchema = z
  .object({
    orderId: z
      .string({ message: "Order ID is required" })
      .regex(objectIdRegex, { message: "Invalid order ID format" }),
  })
  .strict();

export const sessionIdParamsSchema = z
  .object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .trim()
      .min(1, { message: "Session ID cannot be empty" }),
  })
  .strict();

export const sessionIdQuerySchema = z
  .object({
    session_id: z.string().trim().min(1).optional(),
    sessionId: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.session_id || data.sessionId, {
    message: "Either session_id or sessionId query parameter is required",
    path: ["session_id"],
  });

export type TPaymentIdParams = z.infer<typeof paymentIdParamsSchema>;
export type TOrderIdParams = z.infer<typeof orderIdParamsSchema>;
export type TSessionIdParams = z.infer<typeof sessionIdParamsSchema>;
export type TSessionIdQuery = z.infer<typeof sessionIdQuerySchema>;
