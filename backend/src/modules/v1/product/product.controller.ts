/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";
import config from "@/config";

/**
 * Application Service
 */
import productService from "@/modules/v1/product/product.service";

/**
 * Type
 */
import { Request, Response } from "express";

/**
 * Controller for Creating Product
 */
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // get files
  const files = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : [];

  // Call product service to create product
  await productService.createProduct({
    sellerId: req.userId!,
    payload: req.body,
    files,
  });

  // log product created
  logger.info(API_MESSAGES.PRODUCT_CREATED, {
    sellerId: req.userId,
  });

  // send success response
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: API_MESSAGES.PRODUCT_CREATED,
  });
});

/**
 * Controller for Getting Product By ID
 */
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    // get product id
    const { id } = req.params;

    // Call product service to get product by ID
    const product = await productService.getProductById(id as string);

    // log product fetched
    logger.info(API_MESSAGES.PRODUCT_FETCHED, {
      productId: id,
    });

    // send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: product,
    });
  },
);

/**
 * Controller for Getting All Products
 */
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response) => {
    // get limit and offset
    const limit = Number(req.query.limit) || config.DEFAULT_LIMIT;
    const offset = Number(req.query.offset) || config.DEFAULT_OFFSET;

    // get category and search
    const { category, search } = req.query as {
      category?: string;
      search?: string;
    };

    // call service to get all products
    const result = await productService.getAllProducts({
      category,
      search,
      limit,
      offset,
    });

    // log products fetched
    logger.info(API_MESSAGES.PRODUCTS_FETCHED, {
      total: result.total,
      limit: result.limit,
      offset: result.skip,
    });

    // send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result.products,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  },
);

/**
 * Controller for Updating Product
 */
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // get product id
    const { id } = req.params;

    // get files
    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : req.file
        ? [req.file]
        : [];

    // call service to update product
    await productService.updateProduct({
      id: id as string,
      sellerId: req.userId!,
      payload: req.body,
      files,
    });

    // log product updated
    logger.info(API_MESSAGES.PRODUCT_UPDATED, {
      productId: id,
      sellerId: req.userId,
    });

    // send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.PRODUCT_UPDATED,
    });
  },
);

/**
 * Controller for Deleting Product
 */
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // get product id
    const { id } = req.params;

    // delete product
    await productService.deleteProduct({
      id: id as string,
      sellerId: req.userId!,
    });

    // log product deleted
    logger.info(API_MESSAGES.PRODUCT_DELETED, {
      productId: id,
      sellerId: String(req.userId),
    });

    // send 204 no content response
    res.status(StatusCodes.NO_CONTENT).end();
  },
);

/**
 * Product controller Instance
 */
const productController = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
};

/**
 * Export product controller
 */
export default productController;
