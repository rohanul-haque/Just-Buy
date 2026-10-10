/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";
/**
 * Model
 */
import Category from "@/modules/v1/category/category.model";
/**
 * Types
 */
import type {
  ICategory,
  ICategoryId,
  ICreateCategoryRequest,
  IGetCategoriesResult,
  IUpdateCategoryRequest,
} from "@/modules/v1/category/category.interface";

/**
 * Create Category Service
 * @param {ICreateCategoryRequest} params - user ID, payload and optional file
 * @returns {Promise<void>} Created category
 */
export const createCategoryService = async ({
  userId,
  payload,
  file,
}: ICreateCategoryRequest): Promise<void> => {
  const { name } = payload;

  let cloudinaryData;
  // Check if category with the same name already exists
  const existingCategory = await Category.findOne({
    name: name.toLowerCase().trim(),
  })
    .lean()
    .exec();

  if (existingCategory) {
    logger.warn(API_MESSAGES.CATEGORY_ALREADY_EXISTS, { name });
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      ERROR_CODE.CATEGORY_ALREADY_EXISTS,
      API_MESSAGES.CATEGORY_ALREADY_EXISTS,
    );
  }

  // if file send then update the avatar
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }

    // Upload to cloudinary
    cloudinaryData = await uploadToCloudinary(file.buffer, "Just-Buy-API");
  } else {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.CATEGORY_IMAGE_REQUIRED,
      API_MESSAGES.CATEGORY_IMAGE_REQUIRED,
    );
  }

  // Create new category document
  const category = await Category.create({
    name,
    image: {
      publicId: cloudinaryData?.public_id,
      url: cloudinaryData?.secure_url,
      height: cloudinaryData?.height,
      width: cloudinaryData?.width,
    },
    createdBy: userId,
  });

  return category;
};

/**
 * Get All Categories Service
 * @returns {Promise<IGetCategoriesResult>} Paginated category results
 */
export const getAllCategoriesService =
  async (): Promise<IGetCategoriesResult> => {
    const [categories, total] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).lean().exec(),
      Category.countDocuments().exec(),
    ]);

    return {
      categories,
      total,
    };
  };

/**
 * Get Category By ID Service
 * @param {string} categoryId - Category ObjectId string
 * @returns {Promise<ICategory>} Category document
 */
export const getCategoryByIdService = async ({
  categoryId,
}: ICategoryId): Promise<ICategory> => {
  const category = await Category.findById(categoryId).lean().exec();

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, { categoryId });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  return category;
};

/**
 * Update Category Service
 * @param {IUpdateCategoryRequest} params - category ID, payload and optional file
 * @returns {Promise<ICategory>} Updated category document
 */
export const updateCategoryService = async ({
  categoryId,
  payload,
  file,
}: IUpdateCategoryRequest): Promise<void> => {
  const { name } = payload;

  // Find existing category
  const category = await Category.findById(categoryId);

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, { categoryId });

    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // Update category name when provided
  if (name !== undefined) {
    category.name = name;
  }

  // Upload and update image when a new file is provided
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }

    // Keep the old image until the new upload succeeds
    const oldPublicId = category.image?.publicId;

    const cloudinaryData = await uploadToCloudinary(
      file.buffer,
      "Just-Buy-API",
    );

    category.image = {
      publicId: cloudinaryData.public_id,
      url: cloudinaryData.secure_url,
      width: cloudinaryData.width ?? null,
      height: cloudinaryData.height ?? null,
    };

    try {
      await category.save();
    } catch (error) {
      // Clean up the newly uploaded image if saving fails
      await deleteFromCloudinary(cloudinaryData.public_id);
      throw error;
    }

    // Delete the old image only after the database update succeeds
    if (oldPublicId) {
      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (error) {
        logger.error("Failed to delete old category image", {
          categoryId,
          oldPublicId,
          error,
        });
      }
    }

    return category;
  }

  // Save name-only updates without changing the existing image
  await category.save();
};

/**
 * Delete Category Service
 * @param params - Category ID
 * @returns Promise that resolves when the category is deleted
 */
export const deleteCategoryService = async ({
  categoryId,
}: ICategoryId): Promise<void> => {
  // Find category
  const category = await Category.findById(categoryId);

  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, { categoryId });

    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // Delete category from database first
  await Category.findByIdAndDelete(categoryId);

  // Delete image from Cloudinary if it exists
  if (category.image?.publicId) {
    try {
      await deleteFromCloudinary(category.image.publicId);
    } catch (error) {
      logger.error("Failed to delete category image from Cloudinary", {
        categoryId,
        publicId: category.image.publicId,
        error,
      });
    }
  }
};
