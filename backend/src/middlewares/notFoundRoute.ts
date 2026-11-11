import ERROR_CODE from "@/utils/ERROR_CODES";
import type { Request, Response } from "express";
import { status } from "http-status";

const notFoundRoute = (req: Request, res: Response): void => {
  res.status(status.NOT_FOUND).json({
    success: false,
    code: ERROR_CODE.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
};

export default notFoundRoute;
