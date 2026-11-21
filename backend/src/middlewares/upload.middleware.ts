import { upload } from "@/utils/multer";
import type { NextFunction, Request, Response } from "express";

export const uploadSingle = (fieldName: string) => {
  const multerSingle = upload.single(fieldName);
  return (req: Request, res: Response, next: NextFunction): void => {
    multerSingle(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
      next();
    });
  };
};

export const uploadProfile = uploadSingle("profile");

export const uploadVendorImages = upload.fields([
  { name: "profile", maxCount: 1 },
  { name: "nidFrontImage", maxCount: 1 },
  { name: "nidBackImage", maxCount: 1 },
]);

export const uploadProductImages = upload.fields([
  { name: "featureImage", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

export { upload };
export default upload;
