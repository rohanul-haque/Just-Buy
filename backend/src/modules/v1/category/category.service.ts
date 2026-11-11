import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import { CATEGORY_MESSAGES } from "@/modules/v1/category/category.constant";
import type {
  ICategory,
  ICategoryImage,
  ICategoryQueryOptions,
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from "@/modules/v1/category/category.interface";
import Category from "@/modules/v1/category/category.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import { status } from "http-status";
import mongoose from "mongoose";

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const createCategory = async (
  adminId: string,
  payload: ICreateCategoryInput,
  file?: Express.Multer.File,
): Promise<ICategory> => {
  const trimmedName = payload.name.trim();

  // 1. Case-insensitive duplicate check
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") },
  }).exec();

  if (existingCategory) {
    throw new AppError(
      status.CONFLICT,
      ERROR_CODE.CATEGORY_ALREADY_EXISTS,
      CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS,
    );
  }

  // 2. Upload image to Cloudinary if provided
  let newImageData: ICategoryImage = {
    publicId: "",
    url: "",
    width: null,
    height: null,
  };

  if (file) {
    const uploadRes = await cloudinaryService.uploadImage(
      file.buffer,
      "jus-buy/categories",
    );
    newImageData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
  }

  // 3. Save category to MongoDB
  try {
    const category = await Category.create({
      admin: adminId,
      name: trimmedName,
      image: newImageData,
      isActive: true,
    });

    return category;
  } catch (error) {
    // Cleanup newly uploaded image if database insert fails
    if (newImageData.publicId) {
      cloudinaryService.deleteImage(newImageData.publicId).catch((err) => {
        logger.error(
          "Failed to cleanup newly uploaded category image on database failure:",
          err,
        );
      });
    }

    throw error;
  }
};

const getAllCategories = async (
  options: ICategoryQueryOptions,
): Promise<ICategory[]> => {
  const filter: Record<string, any> = {};

  // Default to isActive: true unless explicitly specified
  if (options.isActive !== undefined) {
    filter.isActive = options.isActive;
  } else {
    filter.isActive = true;
  }

  // Case-insensitive search on category name
  if (options.search) {
    filter.name = { $regex: new RegExp(escapeRegex(options.search), "i") };
  }

  const categories = await Category.find(filter)
    .populate("admin", "name email")
    .sort({ createdAt: -1 })
    .exec();

  return categories;
};

const getCategoryById = async (categoryId: string): Promise<ICategory> => {
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  })
    .populate("admin", "name email")
    .exec();

  if (!category) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  return category;
};

const updateCategory = async (
  categoryId: string,
  payload: IUpdateCategoryInput,
  file?: Express.Multer.File,
): Promise<ICategory> => {
  const existingCategory = await Category.findById(categoryId).exec();
  if (!existingCategory) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // 1. Check uniqueness if name is updated
  if (
    payload.name &&
    payload.name.trim().toLowerCase() !== existingCategory.name.toLowerCase()
  ) {
    const conflict = await Category.findOne({
      _id: { $ne: categoryId },
      name: {
        $regex: new RegExp(`^${escapeRegex(payload.name.trim())}$`, "i"),
      },
    }).exec();

    if (conflict) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.CATEGORY_ALREADY_EXISTS,
        CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS,
      );
    }
  }

  const oldPublicId = existingCategory.image?.publicId;
  let newImageData: ICategoryImage | undefined;

  // 2. Upload new image to Cloudinary outside transaction if provided
  if (file) {
    const uploadRes = await cloudinaryService.uploadImage(
      file.buffer,
      "jus-buy/categories",
    );
    newImageData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
  }

  // 3. Update category document in MongoDB
  const updateFields: Record<string, any> = {};

  if (payload.name !== undefined) {
    updateFields.name = payload.name.trim();
  }
  if (payload.isActive !== undefined) {
    updateFields.isActive = payload.isActive;
  }
  if (newImageData) {
    updateFields.image = newImageData;
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .populate("admin", "name email")
      .exec();

    if (!updatedCategory) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.CATEGORY_NOT_FOUND,
        CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }

    // 4. Cleanup old image after successful database update
    if (newImageData && oldPublicId) {
      cloudinaryService.deleteImage(oldPublicId).catch((err) => {
        logger.error(
          "Failed to delete old category image from Cloudinary:",
          err,
        );
      });
    }

    return updatedCategory;
  } catch (error) {
    // 5. Cleanup newly uploaded image if database update fails
    if (newImageData?.publicId) {
      cloudinaryService.deleteImage(newImageData.publicId).catch((err) => {
        logger.error(
          "Failed to delete newly uploaded category image on failure:",
          err,
        );
      });
    }

    throw error;
  }
};

const deleteCategory = async (
  categoryId: string,
): Promise<{ message: string }> => {
  const category = await Category.findById(categoryId).exec();
  if (!category) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  // Check whether the category is referenced by existing products
  if (mongoose.models.Product) {
    const productCount = await mongoose.models.Product.countDocuments({
      category: categoryId,
    });
    if (productCount > 0) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.CATEGORY_IN_USE,
        CATEGORY_MESSAGES.CATEGORY_IN_USE,
      );
    }
  }

  // Delete category from MongoDB
  await Category.findByIdAndDelete(categoryId).exec();

  // Delete image from Cloudinary after successful database deletion
  if (category.image?.publicId) {
    cloudinaryService.deleteImage(category.image.publicId).catch((err) => {
      logger.error(
        "Failed to delete category image from Cloudinary on deletion:",
        err,
      );
    });
  }

  return { message: CATEGORY_MESSAGES.CATEGORY_DELETED };
};

const updateCategoryStatus = async (
  categoryId: string,
  isActive: boolean,
): Promise<ICategory> => {
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: { isActive } },
    { new: true, runValidators: true },
  )
    .populate("admin", "name email")
    .exec();

  if (!updatedCategory) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      CATEGORY_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  return updatedCategory;
};

const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};

export default categoryService;
