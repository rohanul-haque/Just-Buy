/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import { Types } from "mongoose";

/**
 * Application Modules
 */
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Models
 */
import User from "@/modules/v1/auth/auth.model";
import Product from "@/modules/v1/product/product.model";

/**
 * Roles & Types
 */
import type {
  ICreateProductRequest,
  IGetProductsQuery,
  IGetProductsResult,
  IProduct,
  IProductId,
  IUpdateProductRequest,
} from "@/modules/v1/product/product.interface";
import { UserRole } from "../auth/auth.intarface";
import Category from "../category/category.model";

/**
 * Create Product Service (Add product)
 * @param {ICreateProductRequest} params - user ID, product payload, and optional files
 * @returns {Promise<IProduct>} Created product document
 */
export const createProductService = async ({
  sellerId,
  payload,
  files = [],
}: ICreateProductRequest): Promise<IProduct> => {
  // Validate product images
  if (files.length === 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      "At least one product image is required",
    );
  }

  if (payload.category) {
    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${payload.category.trim()}$`,
        $options: "i",
      },
    });

    if (!existingCategory) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        "Category not found. Please select an existing category.",
      );
    }
  }

  // Validate image size (5 MB per image)
  const maxFileSize = 5 * 1024 * 1024;

  if (files.some((file) => file.size > maxFileSize)) {
    throw new AppError(
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      ERROR_CODE.FILE_TOO_LARGE,
      "Each product image must not exceed 5 MB",
    );
  }

  const uploadedPublicIds: string[] = [];

  try {
    // Upload images to Cloudinary
    const images = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(
          file.buffer,
          "Just-Buy-API/products",
        );

        uploadedPublicIds.push(result.public_id);

        return {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width ?? null,
          height: result.height ?? null,
        };
      }),
    );

    // Create product in MongoDB
    const product = await Product.create({
      ...payload,
      seller: sellerId,
      images,
    });

    logger.info("Product created successfully", {
      productId: product._id,
      sellerId,
    });

    return product;
  } catch (error) {
    // Clean up uploaded images if product creation fails
    await Promise.allSettled(
      uploadedPublicIds.map((publicId) => deleteFromCloudinary(publicId)),
    );

    logger.error("Failed to create product", {
      sellerId,
      error,
    });

    throw error;
  }
};

/**
 * Get All Products Service (Product list)
 * @param {IGetProductsQuery} query - Filtering, pagination and sorting options
 * @returns {Promise<IGetProductsResult>} Paginated products results
 */

export const getAllProductsService = async (
  query: IGetProductsQuery,
): Promise<IGetProductsResult> => {
  const limit = query.limit;
  const skip = query.offset;

  const filter: Record<string, unknown> = {};

  // Filter by product name
  if (query.name) {
    filter.name = new RegExp(query.name.trim(), "i");
  }

  // Search by name or description
  if (query.search?.trim()) {
    const searchRegex = new RegExp(query.search.trim(), "i");

    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // Filter by category
  if (query.category) {
    filter.category = new RegExp(`^${query.category.trim()}$`, "i");
  }

  // Filter by exact price
  if (query.price !== undefined) {
    filter.price = query.price;
  }

  // Fetch products and count in parallel
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "_id fullName email role")
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    limit: Number(limit),
    skip: Number(skip),
  };
};

/**
 * Get Product By ID Service (Product details)
 * @param {IProductId} params - Product ObjectId
 * @returns {Promise<IProduct>} Product document
 */
export const getProductByIdService = async ({
  productId,
}: IProductId): Promise<IProduct> => {
  const product = await Product.findById(productId)
    .populate("seller", "fullName email role")
    .lean()
    .exec();

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, { productId });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  return product;
};

/**
 * Update Product Service
 * @param {IUpdateProductRequest} params - Product ID, user ID, payload, and optional files
 * @returns {Promise<IProduct>} Updated product document
 */

export const updateProductService = async ({
  productId,
  userId,
  payload,
  files,
}: IUpdateProductRequest): Promise<void> => {
  const { name, description, category, brand, price, stockQuantity, sizes } =
    payload;

  // Find product
  const product = await Product.findById(productId);

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, { productId });

    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Verify seller and product ownership
  if (!userId) {
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODE.UNAUTHORIZED,
      "Authentication required",
    );
  }

  const user = await User.findById(userId).select("role").lean();

  if (!user || user.role !== UserRole.SELLER) {
    throw new AppError(
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      API_MESSAGES.FORBIDDEN,
    );
  }

  // Validate category created by admin
  if (category) {
    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${category.trim()}$`,
        $options: "i",
      },
    });

    if (!existingCategory) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        "Category not found",
      );
    }

    product.category = existingCategory;
  }

  // Update product name
  if (name) {
    product.name = name;
  }

  // Update description
  if (description) {
    product.description = description;
  }

  // Update brand
  if (brand) {
    product.brand = brand;
  }

  // Update price, including zero
  if (price) {
    product.price = price;
  }

  // Update stock, including zero
  if (stockQuantity) {
    product.stockQuantity = stockQuantity;
  }

  // Update sizes
  if (sizes) {
    product.sizes = sizes;
  }

  // Validate image size and upload new images
  if (files?.length) {
    const maxFileSize = 5 * 1024 * 1024;

    if (files.some((file) => file.size > maxFileSize)) {
      throw new AppError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }

    for (const file of files) {
      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API/products",
      );

      product.images.push({
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        width: cloudinaryData.width ?? null,
        height: cloudinaryData.height ?? null,
      });
    }
  }

  await product.save();
};

/**
 * Delete Product Service
 * @param {Types.ObjectId} productId - Product ObjectId string
 * @param {Types.ObjectId} [userId] - Optional user ID for authorization check
 * @returns {Promise<void>}
 */
export const deleteProductService = async (
  productId: Types.ObjectId,
  userId?: Types.ObjectId,
): Promise<void> => {
  const product = await Product.findById(productId);

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, { productId });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  if (userId) {
    const user = await User.findById(userId).select("role").lean();
    if (user && user.role !== UserRole.SELLER) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        API_MESSAGES.FORBIDDEN,
      );
    }
  }

  // Delete product images from Cloudinary if present
  if (product.images && product.images.length > 0) {
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await deleteFromCloudinary(image.publicId);
        } catch (error) {
          logger.error("Failed to delete product image from Cloudinary", {
            publicId: image.publicId,
            error,
          });
        }
      }
    }
  }

  await Product.findByIdAndDelete(productId);
};
