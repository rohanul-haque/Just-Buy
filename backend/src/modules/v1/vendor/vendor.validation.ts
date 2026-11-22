import { z } from "zod";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";

export const updateVendorProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" })
    .optional(),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email format" })
    .optional(),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(300, { message: "Location cannot exceed 300 characters" })
    .optional(),
  licenceNumber: z
    .string()
    .trim()
    .min(3, { message: "Licence number must be at least 3 characters" })
    .max(100, { message: "Licence number cannot exceed 100 characters" })
    .optional(),
});

export const vendorIdParamsSchema = z.object({
  vendorId: z
    .string({ message: "Vendor ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid Vendor ID format" }),
});

export const updateVendorStatusSchema = z.object({
  status: z.enum(Object.values(VendorStatus) as [string, ...string[]], {
    message: "Invalid vendor status",
  }),
});

export const vendorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  skip: z.coerce.number().int().nonnegative().optional(),
  search: z.string().trim().optional(),
  status: z
    .enum(
      [...Object.values(VendorStatus), "ALL"] as unknown as [
        string,
        ...string[],
      ],
      {
        message: "Invalid vendor status",
      },
    )
    .optional(),
  tab: z.enum(["requests", "approved", "all"]).optional(),
});

export type TUpdateVendorProfileInput = z.infer<
  typeof updateVendorProfileSchema
>;
export type TVendorIdParams = z.infer<typeof vendorIdParamsSchema>;
export type TUpdateVendorStatus = z.infer<typeof updateVendorStatusSchema>;
export type TVendorQuery = z.infer<typeof vendorQuerySchema>;
