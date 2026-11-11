import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import Category from "@/modules/v1/category/category.model";
import {
  PRODUCT_DEFAULT_LIMIT,
  PRODUCT_DEFAULT_PAGE,
  PRODUCT_MESSAGES,
} from "@/modules/v1/product/product.constant";
import type {
  ICreateProductInput,
  IPaginatedProductsResult,
  IProduct,
  IProductImage,
  IProductQueryOptions,
  IUpdateProductInput,
} from "@/modules/v1/product/product.interface";
import Product from "@/modules/v1/product/product.model";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import Vendor from "@/modules/v1/vendor/vendor.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { status } from "http-status";

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const resolveApprovedVendor = async (userId: string) => {
  const vendor = await Vendor.findOne({ vendor: userId }).exec();

  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  if (vendor.status !== VendorStatus.APPROVED) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.SELLER_NOT_APPROVED,
      MESSAGES.SELLER_CANNOT_CREATE_PRODUCT,
    );
  }

  return vendor;
};

const createProduct = async (
  userId: string,
  payload: ICreateProductInput,
  files?: { [fieldname: string]: Express.Multer.File[] },
): Promise<IProduct> => {
  // 1. Resolve and verify approved vendor profile
  const vendor = await resolveApprovedVendor(userId);

  // 2. Verify selected Category exists and is active
  const category = await Category.findById(payload.category).exec();
  if (!category) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CATEGORY_NOT_FOUND,
      PRODUCT_MESSAGES.CATEGORY_NOT_FOUND,
    );
  }

  if (!category.isActive) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      PRODUCT_MESSAGES.CATEGORY_NOT_ACTIVE,
    );
  }

  // 3. Verify featureImage file is present
  const featureImageFile = files?.featureImage?.[0];
  if (!featureImageFile) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
      PRODUCT_MESSAGES.FEATURE_IMAGE_REQUIRED,
    );
  }

  // 4. Upload images to Cloudinary
  let uploadedFeatureImage: IProductImage | null = null;
  const uploadedAdditionalImages: IProductImage[] = [];

  try {
    const featureUploadRes = await cloudinaryService.uploadImage(
      featureImageFile.buffer,
      "jus-buy/products",
    );
    uploadedFeatureImage = {
      publicId: featureUploadRes.publicId,
      url: featureUploadRes.url,
      width: featureUploadRes.width,
      height: featureUploadRes.height,
    };

    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        const imgUploadRes = await cloudinaryService.uploadImage(
          file.buffer,
          "jus-buy/products",
        );
        uploadedAdditionalImages.push({
          publicId: imgUploadRes.publicId,
          url: imgUploadRes.url,
          width: imgUploadRes.width,
          height: imgUploadRes.height,
        });
      }
    }

    // 5. Save product to MongoDB
    const product = await Product.create({
      vendor: vendor._id,
      category: category._id,
      name: payload.name.trim(),
      description: payload.description.trim(),
      brand: payload.brand?.trim() || "",
      price: payload.price,
      stock: payload.stock,
      sizes: payload.sizes || [],
      featureImage: uploadedFeatureImage,
      images: uploadedAdditionalImages,
      salesCount: 0,
      isActive: true,
      isFeatured: false,
    });

    return await product.populate("category", "name image isActive");
  } catch (error) {
    // Cleanup newly uploaded images on database or processing failure
    if (uploadedFeatureImage?.publicId) {
      cloudinaryService
        .deleteImage(uploadedFeatureImage.publicId)
        .catch((err) => {
          logger.error(
            "Failed to cleanup feature image on product creation failure:",
            err,
          );
        });
    }

    for (const img of uploadedAdditionalImages) {
      if (img.publicId) {
        cloudinaryService.deleteImage(img.publicId).catch((err) => {
          logger.error(
            "Failed to cleanup additional image on product creation failure:",
            err,
          );
        });
      }
    }

    throw error;
  }
};

const getMyProducts = async (
  userId: string,
  options: IProductQueryOptions,
): Promise<IPaginatedProductsResult> => {
  const vendor = await resolveApprovedVendor(userId);

  const filter: Record<string, any> = {
    vendor: vendor._id,
  };

  if (options.search) {
    const regex = new RegExp(escapeRegex(options.search), "i");
    filter.$or = [{ name: regex }, { brand: regex }, { description: regex }];
  }

  if (options.category) {
    filter.category = options.category;
  }

  if (options.isActive !== undefined) {
    filter.isActive = options.isActive;
  }

  const page = Math.max(1, options.page || PRODUCT_DEFAULT_PAGE);
  const limit = Math.max(1, options.limit || PRODUCT_DEFAULT_LIMIT);
  const skipCount =
    options.skip !== undefined ? options.skip : (page - 1) * limit;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter).exec(),
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("category", "name image isActive")
      .exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: products,
    pagination: {
      page,
      skip: skipCount,
      limit,
      total,
      totalPages,
      hasPrevPage: options.skip !== undefined ? skipCount > 0 : page > 1,
      hasNextPage: skipCount + limit < total,
    },
  };
};

const updateMyProduct = async (
  userId: string,
  productId: string,
  payload: IUpdateProductInput,
  files?: { [fieldname: string]: Express.Multer.File[] },
): Promise<IProduct> => {
  const vendor = await resolveApprovedVendor(userId);

  const existingProduct = await Product.findOne({
    _id: productId,
    vendor: vendor._id,
  }).exec();

  if (!existingProduct) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Verify category if changed
  if (payload.category) {
    const category = await Category.findById(payload.category).exec();
    if (!category) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.CATEGORY_NOT_FOUND,
        PRODUCT_MESSAGES.CATEGORY_NOT_FOUND,
      );
    }
    if (!category.isActive) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        PRODUCT_MESSAGES.CATEGORY_NOT_ACTIVE,
      );
    }
  }

  // Handle image uploads
  let newFeatureImage: IProductImage | null = null;
  let oldFeatureImagePublicId: string | null = null;
  const newUploadedImages: IProductImage[] = [];

  try {
    if (files?.featureImage?.[0]) {
      const uploadRes = await cloudinaryService.uploadImage(
        files.featureImage[0].buffer,
        "jus-buy/products",
      );
      newFeatureImage = {
        publicId: uploadRes.publicId,
        url: uploadRes.url,
        width: uploadRes.width,
        height: uploadRes.height,
      };
      oldFeatureImagePublicId = existingProduct.featureImage?.publicId || null;
    }

    if (files?.images && files.images.length > 0) {
      for (const file of files.images) {
        const uploadRes = await cloudinaryService.uploadImage(
          file.buffer,
          "jus-buy/products",
        );
        newUploadedImages.push({
          publicId: uploadRes.publicId,
          url: uploadRes.url,
          width: uploadRes.width,
          height: uploadRes.height,
        });
      }
    }

    const updateFields: Record<string, any> = {};

    if (payload.name !== undefined) updateFields.name = payload.name.trim();
    if (payload.description !== undefined)
      updateFields.description = payload.description.trim();
    if (payload.brand !== undefined) updateFields.brand = payload.brand.trim();
    if (payload.price !== undefined) updateFields.price = payload.price;
    if (payload.stock !== undefined) updateFields.stock = payload.stock;
    if (payload.sizes !== undefined) updateFields.sizes = payload.sizes;
    if (payload.category !== undefined)
      updateFields.category = payload.category;
    if (payload.isActive !== undefined)
      updateFields.isActive = payload.isActive;
    if (newFeatureImage) updateFields.featureImage = newFeatureImage;
    if (newUploadedImages.length > 0) {
      updateFields.images = [...existingProduct.images, ...newUploadedImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .populate("category", "name image isActive")
      .exec();

    if (!updatedProduct) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.PRODUCT_NOT_FOUND,
        MESSAGES.PRODUCT_NOT_FOUND,
      );
    }

    // Cleanup old feature image from Cloudinary after successful DB update
    if (newFeatureImage && oldFeatureImagePublicId) {
      cloudinaryService.deleteImage(oldFeatureImagePublicId).catch((err) => {
        logger.error(
          "Failed to delete old feature image from Cloudinary on update:",
          err,
        );
      });
    }

    return updatedProduct;
  } catch (error) {
    // Cleanup newly uploaded images if update failed
    if (newFeatureImage?.publicId) {
      cloudinaryService.deleteImage(newFeatureImage.publicId).catch((err) => {
        logger.error(
          "Failed to cleanup newly uploaded feature image on update failure:",
          err,
        );
      });
    }

    for (const img of newUploadedImages) {
      if (img.publicId) {
        cloudinaryService.deleteImage(img.publicId).catch((err) => {
          logger.error(
            "Failed to cleanup newly uploaded additional image on update failure:",
            err,
          );
        });
      }
    }

    throw error;
  }
};

const deleteMyProduct = async (
  userId: string,
  productId: string,
): Promise<{ message: string }> => {
  const vendor = await resolveApprovedVendor(userId);

  const product = await Product.findOne({
    _id: productId,
    vendor: vendor._id,
  }).exec();

  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Delete product from MongoDB
  await Product.findByIdAndDelete(productId).exec();

  // Collect Cloudinary images for cleanup
  const imagesToDelete: string[] = [];
  if (product.featureImage?.publicId) {
    imagesToDelete.push(product.featureImage.publicId);
  }
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        imagesToDelete.push(img.publicId);
      }
    }
  }

  // Delete from Cloudinary in background with error handling
  for (const publicId of imagesToDelete) {
    cloudinaryService.deleteImage(publicId).catch((err) => {
      logger.error(
        "Failed to delete product asset from Cloudinary on deletion:",
        { publicId, error: err },
      );
    });
  }

  return { message: MESSAGES.PRODUCT_DELETED };
};

const getPublicProducts = async (
  options: IProductQueryOptions,
): Promise<IPaginatedProductsResult> => {
  const filter: Record<string, any> = {
    isActive: true,
  };

  if (options.search) {
    const regex = new RegExp(escapeRegex(options.search), "i");
    filter.$or = [{ name: regex }, { brand: regex }, { description: regex }];
  }

  if (options.category) {
    filter.category = options.category;
  }

  const page = Math.max(1, options.page || PRODUCT_DEFAULT_PAGE);
  const limit = Math.max(1, options.limit || PRODUCT_DEFAULT_LIMIT);
  const skipCount =
    options.skip !== undefined ? options.skip : (page - 1) * limit;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter).exec(),
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .populate("category", "name image")
      .populate({
        path: "vendor",
        select: "shopName profile location",
      })
      .exec(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: products,
    pagination: {
      page,
      skip: skipCount,
      limit,
      total,
      totalPages,
      hasPrevPage: options.skip !== undefined ? skipCount > 0 : page > 1,
      hasNextPage: skipCount + limit < total,
    },
  };
};

const getNewArrivals = async (
  limit = PRODUCT_DEFAULT_LIMIT,
): Promise<IProduct[]> => {
  const safeLimit = Math.max(1, limit);
  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate("category", "name image")
    .populate({
      path: "vendor",
      select: "shopName profile location",
    })
    .exec();

  return products;
};

const getProductById = async (productId: string): Promise<IProduct> => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  })
    .populate("category", "name image")
    .populate({
      path: "vendor",
      select: "shopName profile location",
    })
    .exec();

  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  return product;
};

const getRelatedProducts = async (
  productId: string,
  limit = 10,
): Promise<IProduct[]> => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).exec();

  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(Math.max(1, limit))
    .populate("category", "name image")
    .populate({
      path: "vendor",
      select: "shopName profile location",
    })
    .exec();

  return related;
};

const productService = {
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  getPublicProducts,
  getNewArrivals,
  getProductById,
  getRelatedProducts,
};

export default productService;
