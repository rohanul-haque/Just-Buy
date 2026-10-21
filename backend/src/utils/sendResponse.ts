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
 * Type for response data
 */
interface ResponseSchema<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  skip?: number;
  limit?: number;
  total?: number;
}

/**
 * Send Response
 * @param res - Response object
 * @param response - Response data
 */
const sendResponse = <T>(res: Response, response: ResponseSchema<T>): void => {
  const { statusCode, success, message, data, limit, total, skip } = response;

  res.status(statusCode).json({
    success,
    ...(message && { message }),
    ...(skip !== undefined && { skip }),
    ...(limit !== undefined && { limit }),
    ...(total !== undefined && { total }),
    ...(data !== undefined && { data }),
  });
};

/**
 * Export default sendResponse
 */
export default sendResponse;
