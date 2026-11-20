import { z } from "zod";

export const updateAdminProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Full name cannot be empty" })
      .max(100, { message: "Full name cannot exceed 100 characters" })
      .optional(),
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email address format" })
      .max(255, { message: "Email cannot exceed 255 characters" })
      .optional(),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^[+0-9\s-]{7,20}$/, { message: "Invalid phone number format" })
      .optional(),
  })
  .strict();

export type TUpdateAdminProfileInput = z.infer<typeof updateAdminProfileSchema>;
