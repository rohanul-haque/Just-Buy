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
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
} from "@/modules/v1/category/category.service";
import { Types } from "mongoose";

/**
 * Create Category Controller
 * @access - Private (Admin)
 * @method - POST
 * @route - /api/v1/category
 */
export const createCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    await createCategoryService({
      userId: req.userId!,
      payload: req.body,
      file: req.file,
    });

    logger.info(API_MESSAGES.CATEGORY_CREATED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: API_MESSAGES.CATEGORY_CREATED,
    });
  },
);

/**
 * Get All Categories Controller
 * @access - Public
 * @method - GET
 * @route - /api/v1/category
 */
export const getAllCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAllCategoriesService();

    logger.info(API_MESSAGES.CATEGORIES_FETCHED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result.categories,
      total: result.total,
    });
  },
);

/**
 * Get Category By ID Controller
 * @access - Public
 * @method - GET
 * @route - /api/v1/category/:id
 */
export const getCategoryByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    const result = await getCategoryByIdService({
      categoryId: categoryId as unknown as Types.ObjectId,
    });

    logger.info(API_MESSAGES.CATEGORY_FETCHED);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Update Category Controller
 * @access - Private (Admin)
 * @method - PATCH
 * @route - /api/v1/category/:id
 */
/**
 * Update Category Controller
 */
export const updateCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    await updateCategoryService({
      categoryId: categoryId as unknown as Types.ObjectId,
      payload: req.body,
      file: req.file,
    });

    logger.info(API_MESSAGES.CATEGORY_UPDATED, { categoryId });

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: API_MESSAGES.CATEGORY_UPDATED,
    });
  },
);

/**
 * Delete Category Controller
 */
export const deleteCategoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params;

    await deleteCategoryService({
      categoryId: categoryId as unknown as Types.ObjectId,
    });

    logger.info(API_MESSAGES.CATEGORY_DELETED, { categoryId });

    sendResponse(res, {
      statusCode: HTTP_STATUS.NO_CONTENT,
      success: true,
      message: API_MESSAGES.CATEGORY_DELETED,
    });
  },
);
