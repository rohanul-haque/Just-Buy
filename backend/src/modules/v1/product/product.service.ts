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
import Category from "@/modules/v1/category/category.model";
import Product from "@/modules/v1/product/product.model";
import User from "@/modules/v1/auth/auth.model";

/**
 * Roles & Types
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";
import type {
  ICreateProductRequest,
  IGetProductsQuery,
  IGetProductsResult,
  IProduct,
  IProductImage,
  IUpdateProductRequest,
} from "@/modules/v1/product/product.interface";
import { SellerVerificationStatus } from "../seller/seller.interface";

/**
 * Create Product Service (Add product)
 * @param {ICreateProductRequest} params - user ID, product payload, and optional files
 * @returns {Promise<IProduct>} Created product document
 */
export const createProductService = async ({
  userId,
  payload,
  files,
}: ICreateProductRequest): Promise<IProduct> => {
  const {} = payload
  // Determine seller ID: payload.seller if provided and valid, otherwise userId
  let sellerId = userId;
  if (payload.seller) {
    if (!Types.ObjectId.isValid(String(payload.seller))) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.BAD_REQUEST,
        "Invalid seller ID",
      );
    }

    const sellerExists = await User.findById(payload.seller);

    // Check if seller exists
    if (!sellerExists) {
      logger.warn(API_MESSAGES.USER_NOT_FOUND, { sellerId: payload.seller });
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.USER_NOT_FOUND,
        API_MESSAGES.USER_NOT_FOUND,
      );
    }

    // Check if seller is authorized to create products (seller role)
    if (sellerExists.verificationStatus !== SellerVerificationStatus.VERIFIED) {
      logger.warn(API_MESSAGES.SELLER_CANNOT_CREATE_PRODUCT, {
        userId: sellerExists._id,
      });
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODE.SELLER_UNAUTHORIZED_ACCESS,
        API_MESSAGES.SELLER_CANNOT_CREATE_PRODUCT,
      );
    }

    sellerId = new Types.ObjectId(payload.seller);
  }

  // Validate category existence
  const category = await Category.findById(payload.category);
  if (!category) {
    logger.warn(API_MESSAGES.CATEGORY_NOT_FOUND, {
      categoryId: payload.category,
    });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      API_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  const trimmedName = payload.name.trim();

  // Check if product with the same name already exists for this seller
  const existingProduct = await Product.findOne({
    seller: sellerId,
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
  });

  if (existingProduct) {
    logger.warn(API_MESSAGES.PRODUCT_ALREADY_EXISTS, {
      name: trimmedName,
      sellerId,
    });
    throw new AppError(
      HTTP_STATUS.CONFLICT,
      ERROR_CODE.PRODUCT_ALREADY_EXISTS,
      API_MESSAGES.PRODUCT_ALREADY_EXISTS,
    );
  }

  // Process images: combine payload images with uploaded files
  const images: IProductImage[] = Array.isArray(payload.images)
    ? [...payload.images]
    : [];

  if (files && files.length > 0) {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError(
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
          ERROR_CODE.FILE_TOO_LARGE,
          API_MESSAGES.FILE_TOO_LARGE,
        );
      }

      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API/products",
      );

      images.push({
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        width: cloudinaryData.width ?? null,
        height: cloudinaryData.height ?? null,
      });
    }
  }

  // Create product document
  const product = await Product.create({
    seller: sellerId,
    category: payload.category,
    name: trimmedName,
    description: payload.description ? payload.description.trim() : "",
    price: payload.price,
    stockQuantity: payload.stockQuantity ?? 0,
    images,
    isFeatured: payload.isFeatured ?? false,
  });

  await product.populate([
    { path: "seller", select: "fullName email role" },
    { path: "category", select: "name slug" },
  ]);

  return product;
};

/**
 * Get All Products Service (Product list)
 * @param {IGetProductsQuery} query - Filtering, pagination and sorting options
 * @returns {Promise<IGetProductsResult>} Paginated products results
 */
export const getAllProductsService = async (
  query: IGetProductsQuery,
): Promise<IGetProductsResult> => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  // Search filter by name or description
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // Category filter (supports ObjectId or slug)
  const categoryQuery =
    query.category ||
    (query as Record<string, unknown>).categoryId ||
    (query as Record<string, unknown>).category_id;

  if (categoryQuery && typeof categoryQuery === "string") {
    if (Types.ObjectId.isValid(categoryQuery)) {
      filter.category = categoryQuery;
    } else {
      const foundCategory = await Category.findOne({
        slug: categoryQuery.trim().toLowerCase(),
      })
        .select("_id")
        .lean();

      if (foundCategory) {
        filter.category = foundCategory._id;
      } else {
        filter.category = new Types.ObjectId();
      }
    }
  }

  // Seller filter
  const sellerQuery =
    query.seller ||
    (query as Record<string, unknown>).sellerId ||
    (query as Record<string, unknown>).seller_id;

  if (
    sellerQuery &&
    typeof sellerQuery === "string" &&
    Types.ObjectId.isValid(sellerQuery)
  ) {
    filter.seller = sellerQuery;
  }

  // Featured filter
  const isFeatured =
    query.isFeatured !== undefined
      ? query.isFeatured
      : (query as Record<string, unknown>).is_featured;

  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured;
  }

  // Price range filter
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) {
      priceFilter.$gte = Number(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      priceFilter.$lte = Number(query.maxPrice);
    }
    filter.price = priceFilter;
  }

  // Sorting
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  // Execute query and count documents in parallel
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "fullName email role")
      .populate("category", "name slug")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    products: products as unknown as IProduct[],
    total,
    page,
    limit,
    totalPages,
    skip,
  };
};

/**
 * Get Product By ID Service (Product details)
 * @param {string} productId - Product ObjectId string
 * @returns {Promise<IProduct>} Product document
 */
export const getProductByIdService = async (
  productId: string,
): Promise<IProduct> => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      "Invalid product ID",
    );
  }

  const product = await Product.findById(productId)
    .populate("seller", "fullName email role")
    .populate("category", "name slug")
    .lean();

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, { productId });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  return product as unknown as IProduct;
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
}: IUpdateProductRequest): Promise<IProduct> => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      "Invalid product ID",
    );
  }

  const product = await Product.findById(productId);

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, { productId });
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Authorization check: seller can only update their own product, Admin can update any
  if (userId) {
    const user = await User.findById(userId).select("role").lean();
    if (
      user &&
      user.role !== UserRole.ADMIN &&
      String(product.seller) !== String(userId)
    ) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        API_MESSAGES.FORBIDDEN,
      );
    }
  }

  // If category is updated, verify it exists
  if (payload.category) {
    if (!Types.ObjectId.isValid(String(payload.category))) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.BAD_REQUEST,
        "Invalid category ID",
      );
    }

    const category = await Category.findById(payload.category);
    if (!category) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.CATEGORY_NOT_FOUND,
        API_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }
    product.category = new Types.ObjectId(payload.category);
  }

  // If name is updated, check for duplicate name under the same seller
  if (payload.name && payload.name.trim() !== product.name) {
    const trimmedName = payload.name.trim();
    const duplicate = await Product.findOne({
      _id: { $ne: product._id },
      seller: product.seller,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (duplicate) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.PRODUCT_ALREADY_EXISTS,
        API_MESSAGES.PRODUCT_ALREADY_EXISTS,
      );
    }
    product.name = trimmedName;
  }

  if (payload.description !== undefined) {
    product.description = payload.description.trim();
  }

  if (payload.price !== undefined) {
    product.price = payload.price;
  }

  if (payload.stockQuantity !== undefined) {
    product.stockQuantity = payload.stockQuantity;
  }

  if (payload.isFeatured !== undefined) {
    product.isFeatured = payload.isFeatured;
  }

  // Replace images if payload specifies images
  if (payload.images !== undefined) {
    product.images = payload.images;
  }

  // Upload and append new files if provided
  if (files && files.length > 0) {
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        throw new AppError(
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
          ERROR_CODE.FILE_TOO_LARGE,
          API_MESSAGES.FILE_TOO_LARGE,
        );
      }

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
  await product.populate([
    { path: "seller", select: "fullName email role" },
    { path: "category", select: "name slug" },
  ]);

  return product;
};

/**
 * Delete Product Service
 * @param {string} productId - Product ObjectId string
 * @param {Types.ObjectId} [userId] - Optional user ID for authorization check
 * @returns {Promise<void>}
 */
export const deleteProductService = async (
  productId: string,
  userId?: Types.ObjectId,
): Promise<void> => {
  if (!Types.ObjectId.isValid(productId)) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.BAD_REQUEST,
      "Invalid product ID",
    );
  }

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
    if (
      user &&
      user.role !== UserRole.ADMIN &&
      String(product.seller) !== String(userId)
    ) {
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
