/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Type
 */
import type { Response } from "express";

/**
 * Type for pagination data
 */
interface PaginationSchema {
  skip: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Type for response data
 */
interface ResponseSchema<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationSchema;
}

/**
 * Send Response
 * @param res - Response object
 * @param response - Response data
 */
const sendResponse = <T>(res: Response, response: ResponseSchema<T>): void => {
  const { statusCode, success, message, data, pagination } = response;

  res.status(statusCode).json({
    success,
    ...(message !== undefined && { message }),
    ...(data !== undefined && { data }),
    ...(pagination !== undefined && { pagination }),
  });
};

/**
 * Export default sendResponse
 */
export default sendResponse;
