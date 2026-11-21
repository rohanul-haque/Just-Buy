export const ProductSize = {
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
} as const;

export type TProductSize = (typeof ProductSize)[keyof typeof ProductSize];

export const PRODUCT_MESSAGES = {
  PRODUCT_CREATED: "Product created successfully",
  PRODUCT_UPDATED: "Product updated successfully",
  PRODUCT_DELETED: "Product deleted successfully",
  PRODUCT_NOT_FOUND: "Product not found",
  PRODUCT_FETCHED: "Product fetched successfully",
  PRODUCTS_FETCHED: "Products fetched successfully",
  FEATURE_IMAGE_REQUIRED: "Product feature image is required",
  CATEGORY_NOT_ACTIVE: "Selected category is not active",
  CATEGORY_NOT_FOUND: "Selected category does not exist",
  DUPLICATE_SIZES: "Duplicate size entries are prohibited",
  UNAUTHORIZED_ACCESS:
    "You do not have permission to access or modify this product",
} as const;

export const PRODUCT_DEFAULT_PAGE = 1;
export const PRODUCT_DEFAULT_LIMIT = 15;
