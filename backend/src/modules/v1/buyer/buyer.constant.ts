export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export type TGender = (typeof Gender)[keyof typeof Gender];

export const BUYER_MESSAGES = {
  PROFILE_RETRIEVED: "Buyer profile retrieved successfully",
  PROFILE_UPDATED: "Buyer profile updated successfully",
  PROFILE_DELETED: "Buyer account deleted successfully",
  BUYERS_RETRIEVED: "Buyers retrieved successfully",
  BUYER_NOT_FOUND: "Buyer profile not found",
  STATUS_UPDATED: "Buyer account status updated successfully",
} as const;
