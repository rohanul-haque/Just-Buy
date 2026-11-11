import type { Response } from "express";

interface PaginationSchema {
  skip: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ResponseSchema<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationSchema;
}

const sendResponse = <T>(res: Response, response: ResponseSchema<T>): void => {
  const { statusCode, success, message, data, pagination } = response;

  res.status(statusCode).json({
    success,
    ...(message !== undefined && { message }),
    ...(data !== undefined && { data }),
    ...(pagination !== undefined && { pagination }),
  });
};

export default sendResponse;
