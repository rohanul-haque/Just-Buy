/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";
/**
 * Application Model
 */
import Category from "@/modules/v1/category/category.model";
/**
 * Types
 */
import type {
  ICategory,
  ICreateCategoryPaylod,
  IGetCategoriesParams,
  IGetCategoriesResult,
  IUpdateCategoryPaylod,
} from "@/modules/v1/category/category.interface";

/**
 * Create Category Service
 * @param {ICreateCategoryPaylod} params - user ID, payload and optional file
 * @returns {Promise<void>} Created category
 */
export const createCategory = async ({
  userId,
  payload,
  file,
}: ICreateCategoryPaylod): Promise<void> => {
  const { name } = payload;

  // Validate category image
  if (!file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.CATEGORY_IMAGE_REQUIRED,
      API_MESSAGES.CATEGORY_IMAGE_REQUIRED,
    );
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(
      StatusCodes.REQUEST_TOO_LONG,
      ERROR_CODE.FILE_TOO_LARGE,
      API_MESSAGES.FILE_TOO_LARGE,
    );
  }

  // Check whether the category already exists
  const existingCategory = await Category.exists({ name });

  if (existingCategory) {
    logger.warn(API_MESSAGES.CATEGORY_ALREADY_EXISTS, { name });

    throw new AppError(
      StatusCodes.CONFLICT,
      ERROR_CODE.CATEGORY_ALREADY_EXISTS,
      API_MESSAGES.CATEGORY_ALREADY_EXISTS,
    );
  }

  let cloudinaryData:
    | {
        public_id: string;
        secure_url: string;
        width?: number;
        height?: number;
      }
    | undefined;

  try {
    // Upload category image
    cloudinaryData = await uploadToCloudinary(file.buffer, "Just-Buy-API");

    // Save category in the database
    await Category.create({
      name,
      createdBy: userId,
      image: {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        width: cloudinaryData.width ?? null,
        height: cloudinaryData.height ?? null,
      },
    });
  } catch (error: unknown) {
    // Remove the uploaded image if database creation fails
    if (cloudinaryData?.public_id) {
      try {
        await deleteFromCloudinary(cloudinaryData.public_id);
      } catch (cleanupError: unknown) {
        logger.error("Failed to clean up category image", {
          publicId: cloudinaryData.public_id,
          error: cleanupError,
        });
      }
    }

    // Handle duplicate-name race conditions
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new AppError(
        StatusCodes.CONFLICT,
        ERROR_CODE.CATEGORY_ALREADY_EXISTS,
        API_MESSAGES.CATEGORY_ALREADY_EXISTS,
      );
    }

    throw error;
  }
};

/**
 * Get All Categories Service
 * @returns {Promise<IGetCategoriesResult>} Paginated category results
 */
export const getAllCategories = async ({
  limit,
  offset,
}: IGetCategoriesParams): Promise<IGetCategoriesResult> => {
  // Fetch the total count and current page concurrently.
  const [total, categories] = await Promise.all([
    Category.countDocuments().exec(),

    Category.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  // Calculate pagination metadata.
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + categories.length < total;
  const hasPrevPage = offset > 0 && total > 0;

  return {
    categories,
    total,
    limit,
    skip: offset,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Get Category By ID Service
 * @param {string} id - Category ID
 * @returns {Promise<ICategory>} Category document
 */
export const getCategoryById = async (id: string): Promise<ICategory> => {
  const category = await Category.findById(id).lean().exec();

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, { id });
    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  return category;
};

/**
 * Update Category Service
 * @param {IUpdateCategoryPaylod} params - category ID, payload and optional file
 * @returns {Promise<void>} Updated category document
 */
export const updateCategory = async ({
  id,
  payload,
  file,
}: IUpdateCategoryPaylod): Promise<void> => {
  const { name } = payload;

  // Validate uploaded category image
  if (file) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        StatusCodes.REQUEST_TOO_LONG,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        ERROR_CODE.INVALID_FILE_TYPE,
        "Only JPEG, PNG, and WebP images are allowed",
      );
    }
  }

  // Find the existing category
  const category = await Category.findById(id);

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, { id });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // Normalize and validate the category name
  let normalizedName: string | undefined;

  if (name !== undefined) {
    normalizedName = name.trim().toLowerCase();

    // Check whether another category already uses this name
    const existingCategory = await Category.exists({
      name: normalizedName,
      _id: { $ne: category._id },
    });

    if (existingCategory) {
      throw new AppError(
        StatusCodes.CONFLICT,
        ERROR_CODE.CATEGORY_ALREADY_EXISTS,
        API_MESSAGES.CATEGORY_ALREADY_EXISTS,
      );
    }
  }

  // Reject empty update requests
  if (normalizedName === undefined && !file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      "At least one field must be provided for update",
    );
  }

  // Keep the previous image until the update succeeds
  const previousImagePublicId = category.image?.publicId;
  let newImagePublicId: string | undefined;

  try {
    // Upload the new image before modifying the database
    if (file) {
      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API",
      );

      newImagePublicId = cloudinaryData.public_id;

      // Assign the new image metadata
      category.image = {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        height: cloudinaryData.height ?? null,
        width: cloudinaryData.width ?? null,
      };
    }

    // Apply the category name if provided
    if (normalizedName !== undefined) {
      category.name = normalizedName;
    }

    // Persist the category update
    await category.save();
  } catch (error: unknown) {
    // Handle duplicate-name race conditions
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      // Clean up the newly uploaded image
      if (newImagePublicId) {
        try {
          await deleteFromCloudinary(newImagePublicId);
        } catch (cleanupError: unknown) {
          logger.error("Failed to clean up the new category image", {
            id,
            publicId: newImagePublicId,
            error: cleanupError,
          });
        }
      }

      throw new AppError(
        StatusCodes.CONFLICT,
        ERROR_CODE.CATEGORY_ALREADY_EXISTS,
        API_MESSAGES.CATEGORY_ALREADY_EXISTS,
      );
    }

    // Best-effort cleanup if the database update fails
    if (newImagePublicId) {
      try {
        await deleteFromCloudinary(newImagePublicId);
      } catch (cleanupError: unknown) {
        logger.error("Failed to clean up the new category image", {
          id,
          publicId: newImagePublicId,
          error: cleanupError,
        });
      }
    }

    throw error;
  }

  // Delete the previous image only after the database update succeeds
  if (
    file &&
    previousImagePublicId &&
    previousImagePublicId !== newImagePublicId
  ) {
    try {
      await deleteFromCloudinary(previousImagePublicId);
    } catch (error: unknown) {
      // Cleanup failure must not invalidate a successful update
      logger.error("Failed to delete the previous category image", {
        id,
        publicId: previousImagePublicId,
        error,
      });
    }
  }
};

/**
 * Delete Category Service
 * @param params - Category ID
 * @returns Promise that resolves when the category is deleted
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  // Find the existing category
  const category = await Category.findById(categoryId).exec();

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, {
      categoryId,
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // Keep the image ID for cleanup after deletion
  const imagePublicId = category.image?.publicId;

  // Delete the category from the database
  await Category.deleteOne({ _id: category._id }).exec();

  // Clean up the image only after database deletion succeeds
  if (imagePublicId) {
    try {
      await deleteFromCloudinary(imagePublicId);
    } catch (error: unknown) {
      logger.error("Failed to delete category image from Cloudinary", {
        categoryId,
        publicId: imagePublicId,
        error,
      });
    }
  }
};

/**
 * Category Service Instance
 */
const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

/**
 * Export Category Service
 */
export default categoryService;
