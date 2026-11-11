import { z } from "zod";

export const updateAdminProfileSchema = z
  .object({
    phoneNumber: z
      .string()
      .trim()
      .regex(/^[+0-9\s-]{7,20}$/, { message: "Invalid phone number format" })
      .optional(),
  })
  .strict();

export type TUpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
