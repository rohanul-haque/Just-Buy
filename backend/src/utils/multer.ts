import config from "@/config";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import type { Request } from "express";
import { status } from "http-status";
import multer, { type FileFilterCallback } from "multer";

export interface IMulterOptions {
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const MAX_IMAGE_SIZE = config.IMAGE_MAX_SIZE || 5242880; // 5 MB

const storage = multer.memoryStorage();

export const defaultFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        `Unsupported file type: ${file.mimetype}. Allowed types are image/jpeg, image/jpg, image/png, and image/webp.`,
      ),
    );
  }
};

export const createMulterUpload = (options?: IMulterOptions) => {
  const limits = {
    fileSize: options?.maxSize || MAX_IMAGE_SIZE,
  };

  const fileFilter = options?.allowedMimeTypes
    ? (
        _req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback,
      ): void => {
        if (options.allowedMimeTypes!.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new AppError(
              status.BAD_REQUEST,
              ERROR_CODE.VALIDATION_ERROR,
              `Unsupported file type: ${file.mimetype}.`,
            ),
          );
        }
      }
    : defaultFileFilter;

  return multer({
    storage,
    limits,
    fileFilter,
  });
};

export const upload = createMulterUpload();

const multerUtils = {
  upload,
  createMulterUpload,
  storage,
  defaultFileFilter,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
};

export default multerUtils;

