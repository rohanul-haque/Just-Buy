export const EARNINGS_MESSAGES = {
  SUMMARY_RETRIEVED: "Earnings summary retrieved successfully",
  TRANSACTIONS_RETRIEVED: "Earnings transactions retrieved successfully",
  TRANSACTION_DETAILS_RETRIEVED:
    "Earnings transaction details retrieved successfully",
  ORDER_NOT_FOUND: "Delivered order earnings details not found",
  UNAUTHORIZED: "Only authorized administrators can access earnings data",
  VENDOR_SUMMARY_RETRIEVED: "Vendor earnings summary retrieved successfully",
  VENDOR_TRANSACTIONS_RETRIEVED: "Vendor earnings transactions retrieved successfully",
  VENDOR_DETAILS_RETRIEVED: "Vendor earnings transaction details retrieved successfully",
  VENDOR_NOT_FOUND: "Vendor profile not found",
  FORBIDDEN_ORDER_ACCESS: "Access denied: this order does not belong to your store",
} as const;

export const ADMIN_COMMISSION_RATE = 15;
export const VENDOR_COMMISSION_RATE = 85;
