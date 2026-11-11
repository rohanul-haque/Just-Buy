import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";
import { VENDOR_MESSAGES } from "@/modules/v1/vendor/vendor.constant";
import vendorService from "@/modules/v1/vendor/vendor.service";

const getOwnProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await vendorService.getOwnProfile(req.user!.userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: VENDOR_MESSAGES.PROFILE_RETRIEVED,
      data: result,
    });
  },
);

const updateOwnProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const files = req.files as
      { [fieldname: string]: Express.Multer.File[] } | undefined;

    const result = await vendorService.updateOwnProfile(
      req.user!.userId,
      req.body,
      files,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: VENDOR_MESSAGES.PROFILE_UPDATED,
      data: result,
    });
  },
);

const getAllVendors = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await vendorService.getAllVendors(req.query);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: VENDOR_MESSAGES.ALL_VENDORS_RETRIEVED,
      data: result.data,
      pagination: result.pagination,
    });
  },
);

const getVendorById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.params.vendorId as string;
    const result = await vendorService.getVendorById(vendorId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: VENDOR_MESSAGES.PROFILE_RETRIEVED,
      data: result,
    });
  },
);

const updateVendorStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.params.vendorId as string;
    const result = await vendorService.updateVendorStatus(
      vendorId,
      req.body.status,
      req.user!.userId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: VENDOR_MESSAGES.STATUS_UPDATED,
      data: result,
    });
  },
);

const vendorController = {
  getOwnProfile,
  updateOwnProfile,
  getAllVendors,
  getVendorById,
  updateVendorStatus,
};

export default vendorController;
