export const VendorStatus = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type TVendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];

export const VENDOR_MESSAGES = {
  PROFILE_RETRIEVED: "Vendor profile retrieved successfully",
  PROFILE_UPDATED: "Vendor profile updated successfully",
  ALL_VENDORS_RETRIEVED: "Vendors retrieved successfully",
  STATUS_UPDATED: "Vendor status updated successfully",
  VENDOR_NOT_FOUND: "Vendor profile not found",
  LICENCE_ALREADY_EXISTS: "Licence number is already registered by another vendor",
  CANNOT_UPDATE_OWN_STATUS: "Vendors cannot update their own status",
  STATUS_ALREADY_SET: "Vendor status is already set to the requested value",
} as const;

