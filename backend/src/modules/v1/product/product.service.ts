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
 * Application Models
 */
import Category from "@/modules/v1/category/category.model";
import Product from "@/modules/v1/product/product.model";
import Seller from "@/modules/v1/seller/seller.model";

/**
 * Types
 */
import type {
  ICreateProductPayload,
  IDeleteProductPayload,
  IGetProductsQuery,
  IGetProductsResponse,
  IGetProductsResult,
  IProduct,
  IUpdateProductPayload,
} from "@/modules/v1/product/product.interface";
import { SellerVerificationStatus } from "@/modules/v1/seller/seller.interface";

/**
 * Service for Creating Product
 * @param {Object} sellerId, payload, files
 * @returns {Promise<IProduct>} Created product document
 */
const createProduct = async ({
  sellerId,
  payload,
  files = [],
}: ICreateProductPayload): Promise<IProduct> => {
  // check files
  if (files.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      "At least one product image is required",
    );
  }

  // check file size and number of files
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_IMAGES = 5;

  // check number of files
  if (files.length > MAX_IMAGES) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      `You can upload a maximum of ${MAX_IMAGES} product images`,
    );
  }

  // check file size
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        StatusCodes.REQUEST_TOO_LONG,
        ERROR_CODE.FILE_TOO_LARGE,
        "Each product image must not exceed 5 MB",
      );
    }
  }

  // find seller
  const seller = await Seller.findOne({
    user: sellerId,
    verificationStatus: SellerVerificationStatus.VERIFIED,
  })
    .select("_id")
    .lean()
    .exec();

  // check if seller is verified
  if (!seller) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      ERROR_CODE.VALIDATION_ERROR,
      "Only verified sellers can create products",
    );
  }

  // find category
  const existingCategory = await Category.findById(payload.category)
    .select("_id")
    .lean()
    .exec();

  // check if category exists
  if (!existingCategory) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      "Category not found. Please select an existing category.",
    );
  }

  // array to store uploaded image public IDs for cleanup
  const uploadedPublicIds: string[] = [];

  try {
    const images: IProduct["images"] = [];

    // upload files to cloudinary
    for (const file of files) {
      const result = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API/products",
      );

      // store uploaded image public IDs
      uploadedPublicIds.push(result.public_id);

      // add image to images array
      images.push({
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width ?? null,
        height: result.height ?? null,
      });
    }

    // create product
    const product = await Product.create({
      name: payload.name,
      description: payload.description,
      category: existingCategory._id,
      brand: payload.brand,
      price: payload.price,
      stockQuantity: payload.stockQuantity ?? 0,
      sizes: payload.sizes ?? [],
      seller: sellerId,
      sellCount: 0,
      images,
    });

    // populate seller and category
    await product.populate([
      { path: "seller", select: "fullName email role" },
      { path: "category", select: "name" },
    ]);

    // return created product
    return product;
  } catch (error) {
    // cleanup uploaded images on error
    await Promise.allSettled(
      uploadedPublicIds.map((publicId) => deleteFromCloudinary(publicId)),
    );
  }
};

/**
 * Get Product By ID Service (Product details)
 * @param {id} params - Product ID
 * @returns {Promise<IGetProductsResult>} Product document
 */
export const getProductById = async (
  id: string,
): Promise<IGetProductsResult> => {
  // find product
  const product = await Product.findById(id)
    .populate("seller", "fullName email role")
    .populate("category", "name")
    .lean()
    .exec();

  // check if product exists
  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, {
      productId: id,
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // return product
  return product;
};

/**
 * Service for getting all products
 * @param {IGetProductsQuery} query
 * @returns {Promise<IGetProductsResponse>}
 */
export const getAllProducts = async (
  query: IGetProductsQuery,
): Promise<IGetProductsResponse> => {
  // extract limit and offset
  const { limit, offset: skip } = query;

  // filter object
  const filter: Record<string, unknown> = {};

  // escape regex characters
  const escapeRegex = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Search by product name or description.
  if (query.search?.trim()) {
    const searchRegex = new RegExp(escapeRegex(query.search.trim()), "i");

    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  // Filter by Category ObjectId.
  if (query.category) {
    filter.category = query.category;
  }

  // Fetch products and total count in parallel.
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("seller", "_id fullName email role")
      .populate("category", "name")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),

    Product.countDocuments(filter).exec(),
  ]);

  // Calculate pagination metadata.
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = skip + products.length < total;
  const hasPrevPage = skip > 0 && skip < total;

  // return paginated products with metadata
  return {
    products,
    total,
    limit,
    skip,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Service for updating product
 * @param {IUpdateProductRequest} params
 * @returns {Promise<IProduct>} Updated product document
 */
export const updateProduct = async ({
  id,
  sellerId,
  payload,
  files = [],
}: IUpdateProductPayload): Promise<void> => {
  // find product owned by current seller
  const product = await Product.findOne({
    _id: id,
    seller: sellerId,
  });

  // check if product exists and belongs to the seller
  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, {
      productId: id,
      sellerId: String(sellerId),
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // destructure all fields from payload
  const { name, description, category, brand, price, stockQuantity, sizes } =
    payload;

  // validate category ID and ensure the category exists
  if (category !== undefined) {
    const existingCategory = await Category.findById(category)
      .select("_id")
      .lean()
      .exec();

    // check if category exists
    if (!existingCategory) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        "Category not found",
      );
    }

    product.category = existingCategory._id;
  }

  // Update fields only when provided.
  if (name !== undefined) {
    product.name = name;
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (brand !== undefined) {
    product.brand = brand;
  }

  // Zero is a valid price or stock value if permitted by the schema.
  if (price !== undefined) {
    product.price = price;
  }

  if (stockQuantity !== undefined) {
    product.stockQuantity = stockQuantity;
  }

  if (sizes !== undefined) {
    product.sizes = sizes;
  }

  // max file size and max images
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_IMAGES = 5;

  // check if product has more than max images
  if (product.images.length + files.length > MAX_IMAGES) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      `A product can have a maximum of ${MAX_IMAGES} images`,
    );
  }

  // check if file size is more than max file size
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        StatusCodes.REQUEST_TOO_LONG,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }
  }

  // Track newly uploaded images for cleanup on failure.
  const uploadedPublicIds: string[] = [];

  try {
    // Upload new images and append them to existing images.
    for (const file of files) {
      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API/products",
      );

      uploadedPublicIds.push(cloudinaryData.public_id);

      // push uploaded images into product
      product.images.push({
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        width: cloudinaryData.width ?? null,
        height: cloudinaryData.height ?? null,
      });
    }

    // Run schema validation and persist changes.
    await product.save();

    logger.info(API_MESSAGES.PRODUCT_UPDATED, {
      productId: String(product._id),
      sellerId: String(sellerId),
      uploadedImageCount: uploadedPublicIds.length,
    });
  } catch (error) {
    // Remove newly uploaded images if saving or uploading fails.
    await Promise.allSettled(
      uploadedPublicIds.map((publicId) => deleteFromCloudinary(publicId)),
    );

    throw error;
  }
};

/**
 * Delete Product Service
 * @param {Types.ObjectId} productId - Product ObjectId string
 * @param {Types.ObjectId} [userId] - Optional user ID for authorization check
 * @returns {Promise<void>}
 */
export const deleteProduct = async ({
  id,
  sellerId,
}: IDeleteProductPayload): Promise<void> => {
  // Delete only the product owned by this seller.
  // The deleted document contains the image information for cleanup.
  const product = await Product.findOneAndDelete({
    _id: id,
    seller: sellerId,
  })
    .lean()
    .exec();

  if (!product) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, {
      productId: id,
      sellerId,
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Clean up product images after successful database deletion.
  const publicIds = [
    ...new Set(
      (product.images ?? [])
        .map((image: any) => image.publicId)
        .filter(
          (publicId: any): publicId is string =>
            typeof publicId === "string" && publicId.length > 0,
        ),
    ),
  ];

  await Promise.allSettled(
    publicIds.map((publicId: any) => deleteFromCloudinary(publicId)),
  );
};

const productService = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
};

export default productService;
