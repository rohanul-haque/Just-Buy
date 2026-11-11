import { AccountStatus } from "@/modules/v1/user/user.constant";
import { z } from "zod";
import { Gender } from "@/modules/v1/buyer/buyer.constant";

export const updateBuyerProfileSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, { message: "Invalid phone number format" })
    .optional(),
  gender: z
    .enum(Object.values(Gender) as [string, ...string[]], {
      message: "Gender must be MALE, FEMALE, or OTHER",
    })
    .optional(),
  address: z
    .string()
    .trim()
    .max(500, { message: "Address cannot exceed 500 characters" })
    .optional(),
});

export const buyerIdParamsSchema = z.object({
  buyerId: z
    .string({ message: "Buyer ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Buyer ID format" }),
});

export const updateBuyerStatusSchema = z.object({
  status: z.enum(Object.values(AccountStatus) as [string, ...string[]], {
    message: "Status must be either ACTIVE or BLOCKED",
  }),
});

export const buyerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  skip: z.coerce.number().int().nonnegative().optional(),
  search: z.string().trim().optional(),
  gender: z.enum(Object.values(Gender) as [string, ...string[]]).optional(),
});

export type TUpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;
export type TBuyerIdParams = z.infer<typeof buyerIdParamsSchema>;
export type TUpdateBuyerStatus = z.infer<typeof updateBuyerStatusSchema>;
export type TBuyerQuery = z.infer<typeof buyerQuerySchema>;
