import { z } from "zod";

export const recentUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const userDetailsParamsSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
});
