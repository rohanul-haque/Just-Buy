import { PRODUCT_MESSAGES } from "@/modules/v1/product/product.constant";
import productService from "@/modules/v1/product/product.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const createProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;

    const result = await productService.createProduct(
      req.user!.userId,
      req.body,
      files,
    );

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_CREATED,
      data: result,
    });
  },
);

const getMyProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await productService.getMyProducts(
      req.user!.userId,
      req.query,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const updateMyProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.productId as string;
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;

    const result = await productService.updateMyProduct(
      req.user!.userId,
      productId,
      req.body,
      files,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED,
      data: result,
    });
  },
);

const deleteMyProduct = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.productId as string;
    const result = await productService.deleteMyProduct(
      req.user!.userId,
      productId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const getPublicProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await productService.getPublicProducts(req.query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getNewArrivals = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await productService.getNewArrivals(limit);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED,
      data: result,
    });
  },
);

const getProductById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.productId as string;
    const result = await productService.getProductById(productId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCT_FETCHED,
      data: result,
    });
  },
);

const getRelatedProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const productId = req.params.productId as string;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await productService.getRelatedProducts(productId, limit);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: PRODUCT_MESSAGES.PRODUCTS_FETCHED,
      data: result,
    });
  },
);

const productController = {
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  getPublicProducts,
  getNewArrivals,
  getProductById,
  getRelatedProducts,
};

export default productController;
