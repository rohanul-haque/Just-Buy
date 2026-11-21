import asyncHandler from "@/utils/asyncHandler";
import sendResponse from "@/utils/sendResponse";
import type { Request, Response } from "express";
import { status } from "http-status";
import { ADMIN_MESSAGES } from "@/modules/v1/admin/admin.constant";
import adminService from "@/modules/v1/admin/admin.service";

const getAdminProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getOwnProfile(req.user!.userId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ADMIN_MESSAGES.PROFILE_RETRIEVED,
      data: result,
    });
  },
);

const updateAdminProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.updateOwnProfile(
      req.user!.userId,
      req.body,
      req.file,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: ADMIN_MESSAGES.PROFILE_UPDATED,
      data: result,
    });
  },
);

const adminController = {
  getAdminProfile,
  updateAdminProfile,
};

export default adminController;
