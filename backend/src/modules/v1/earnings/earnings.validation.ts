import { z } from "zod";

export const earningsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  skip: z.coerce.number().int().nonnegative().optional(),
  search: z.string().trim().optional(),
});

export const earningsOrderIdSchema = z.object({
  orderId: z.string().trim().min(1, { message: "Order ID is required" }),
});

export type TEarningsQuery = z.infer<typeof earningsQuerySchema>;
export type TEarningsOrderIdParam = z.infer<typeof earningsOrderIdSchema>;
