import { z } from "zod";

export const updateBuyerProfileSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, {
      message: "Please enter a valid phone number (7-20 digits)",
    })
    .or(z.literal(""))
    .optional(),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER"], {
      message: "Please select a valid gender option",
    })
    .optional(),
  address: z
    .string()
    .trim()
    .max(500, { message: "Address cannot exceed 500 characters" })
    .optional(),
});

export type UpdateBuyerProfileFormValues = z.infer<
  typeof updateBuyerProfileSchema
>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long" }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "Please confirm your new password" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

