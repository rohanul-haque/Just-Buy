/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Request, Response } from "express";

/**
 * Application Modules
 */
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES, HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Services
 */
import config from "@/config";
import {
  createProductService,
  deleteProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
} from "@/modules/v1/product/product.service";
import { Types } from "mongoose";

/**
 * Create Product Controller (Add product)
 * @access - Private (Seller, Admin)
 * @method - POST
 * @route - /api/v1/products
 */

/**
 * Create Product Controller
 */
export const createProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];

    await createProductService({
      sellerId: req.userId!,
      payload: req.body,
      files,
    });

    logger.info(API_MESSAGES.PRODUCT_CREATED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: API_MESSAGES.PRODUCT_CREATED,
    });
  },
);

/**
 * Get All Products Controller (Product list)
 * @access - Public
 * @method - GET
 * @route - /api/v1/products
 */

export const getAllProductsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { category, name, price, search } = req.query;

    const limit =
      parseInt(req.query.limit as string, 10) || config.DEFAULT_LIMIT;

    const offset =
      parseInt(req.query.offset as string, 10) || config.DEFAULT_OFFSET;

    const result = await getAllProductsService({
      category: category as string,
      name: name as string,
      price: price ? Number(price) : undefined,
      search: search as string,
      limit,
      offset,
    });

    logger.info(API_MESSAGES.PRODUCTS_FETCHED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result.products,
      total: result.total,
      skip: result.skip,
      limit: result.limit,
    });
  },
);

/**
 * Get Product By ID Controller (Product details)
 * @access - Public
 * @method - GET
 * @route - /api/v1/products/:id
 */
export const getProductByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;

    const result = await getProductByIdService({
      productId: productId as unknown as Types.ObjectId,
    });

    logger.info(API_MESSAGES.PRODUCT_FETCHED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Update Product Controller
 * @access - Private (Seller, Admin)
 * @method - PATCH
 * @route - /api/v1/products/:id
 */
export const updateProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const files =
      (req.files as Express.Multer.File[]) ||
      (req.file ? [req.file] : undefined);

    await updateProductService({
      productId: req.params.productId as unknown as Types.ObjectId,
      userId: req.userId!,
      payload: req.body,
      files,
    });

    logger.info(API_MESSAGES.PRODUCT_UPDATED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.PRODUCT_UPDATED,
    });
  },
);

/**
 * Delete Product Controller
 * @access - Private (Seller, Admin)
 * @method - DELETE
 * @route - /api/v1/products/:id
 */
export const deleteProductController = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.productId;

    await deleteProductService(
      productId as unknown as Types.ObjectId,
      req.userId!,
    );

    logger.info(API_MESSAGES.PRODUCT_DELETED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.NO_CONTENT,
      success: true,
      message: API_MESSAGES.PRODUCT_DELETED,
    });
  },
);
