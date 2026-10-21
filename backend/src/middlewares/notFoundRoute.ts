/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-Party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Module
 */
import { ERROR_CODE } from "@/utils/constants";

/**
 * Type
 */
import type { Request, Response } from "express";

/**
 * Not Found Error Handler Middleware
 * @param req - The request object
 * @param res - The response object
 */
const notFoundRoute = (req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    code: ERROR_CODE.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
};

/**
 * Export default notFoundRoute
 */
export default notFoundRoute;
