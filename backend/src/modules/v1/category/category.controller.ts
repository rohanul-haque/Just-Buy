import { CATEGORY_MESSAGES } from "@/modules/v1/category/category.constant";
import categoryService from "@/modules/v1/category/category.service";
import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";

const createCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await categoryService.createCategory(
      req.user!.userId,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY_CREATED,
      data: result,
    });
  },
);

const getAllCategories = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await categoryService.getAllCategories(req.query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: CATEGORY_MESSAGES.CATEGORIES_RETRIEVED,
      data: result,
    });
  },
);

const getCategoryById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId as string;
    const result = await categoryService.getCategoryById(categoryId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY_RETRIEVED,
      data: result,
    });
  },
);

const updateCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId as string;
    const result = await categoryService.updateCategory(
      categoryId,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY_UPDATED,
      data: result,
    });
  },
);

const deleteCategory = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId as string;
    const result = await categoryService.deleteCategory(categoryId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.message,
    });
  },
);

const updateCategoryStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId as string;
    const result = await categoryService.updateCategoryStatus(
      categoryId,
      req.body.isActive,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: CATEGORY_MESSAGES.CATEGORY_STATUS_UPDATED,
      data: result,
    });
  },
);

const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};

export default categoryController;
