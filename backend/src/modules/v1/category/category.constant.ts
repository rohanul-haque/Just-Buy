export const CATEGORY_MESSAGES = {
  CATEGORY_CREATED: "Category created successfully",
  CATEGORIES_RETRIEVED: "Categories retrieved successfully",
  CATEGORY_RETRIEVED: "Category retrieved successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_STATUS_UPDATED: "Category status updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_ALREADY_EXISTS: "A category with this name already exists",
  CATEGORY_IN_USE:
    "Cannot delete category as it is referenced by existing products",
  INVALID_CATEGORY_ID: "Invalid category ID",
  IMAGE_REQUIRED: "Category image is required",
  IMAGE_UPLOAD_FAILED: "Failed to upload category image",
} as const;
