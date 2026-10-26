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
import config from "@/config";
import { logger } from "@/lib/winston";
import asyncHandler from "@/utils/asyncHandler";
import { API_MESSAGES } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Services
 */
import categoryService from "@/modules/v1/category/category.service";

/**
 * Type
 */
import { Request, Response } from "express";

/**
 * Controller for create category
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // Get category user ID from request
    await categoryService.createCategory({
      userId: req.userId!,
      payload: req.body,
      file: req.file,
    });

    // Log success
    logger.info(API_MESSAGES.CATEGORY_CREATED);

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: API_MESSAGES.CATEGORY_CREATED,
    });
  },
);

/**
 * Controller for get all categories
 */
export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    // Pagination query parameters
    const limit = Number(req.query.limit) || config.DEFAULT_LIMIT;
    const offset = Number(req.query.offset) || config.DEFAULT_OFFSET;

    // Call get all categories service
    const result = await categoryService.getAllCategories({
      limit,
      offset,
    });

    // Log the get all categories successfully
    if (result) {
      logger.info(API_MESSAGES.CATEGORIES_FETCHED);
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.CATEGORIES_FETCHED,
      data: result.categories,
      pagination: {
        limit: result.limit,
        skip: result.skip,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  },
);

/**
 * Controller for get category by ID
 */
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    // Get buyer user ID from params
    const { id } = req.params;

    // Call get category by ID service
    const result = await categoryService.getCategoryById(id as string);

    // Log the get category successfully
    if (result) {
      logger.info(API_MESSAGES.CATEGORY_FETCHED);
    }

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      data: result,
    });
  },
);

/**
 * Controller for update category
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // Get category user ID from params
    const { id } = req.params;

    // Call update category service
    await categoryService.updateCategory({
      id: id as string,
      payload: req.body,
      file: req.file,
    });

    // Log success
    logger.info(API_MESSAGES.CATEGORY_UPDATED, {
      id: id,
    });

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: API_MESSAGES.CATEGORY_UPDATED,
    });
  },
);

/**
 * Controller for delete category
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // Get category user ID from params
    const { id } = req.params;

    // Call delete category service
    await categoryService.deleteCategory(id as string);

    // Log success
    logger.info(API_MESSAGES.CATEGORY_DELETED, { id });

    // Send success response
    sendResponse(res, {
      statusCode: StatusCodes.NO_CONTENT,
      success: true,
      message: API_MESSAGES.CATEGORY_DELETED,
    });
  },
);

/**
 * Category Controller Instance
 */
const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

/**
 * Export Category Controller
 */
export default categoryController;
