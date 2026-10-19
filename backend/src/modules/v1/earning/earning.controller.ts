/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import asyncHandler from "@/utils/asyncHandler";
import { HTTP_STATUS } from "@/utils/constants";
import sendResponse from "@/utils/sendResponse";

/**
 * Application Servcies
 */
import { getEarningsService } from "@/modules/v1/earning/earning.service";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Controller for getting earnings
 */
export const getEarningsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getEarningsService(req.userId!);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      data: result,
    });
  },
);
