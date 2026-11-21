import config from "@/config";
import { logger } from "@/lib/winston";
import AppError from "@/utils/AppError";
import { v2 as cloudinary } from "cloudinary";
import { status } from "http-status";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface ICloudinaryUploadResponse {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

const uploadImage = (
  buffer: Buffer,
  folder = "jus-buy/profiles",
): Promise<ICloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(
              status.INTERNAL_SERVER_ERROR,
              "CLOUDINARY_UPLOAD_ERROR",
              "Failed to upload image to cloud storage.",
            ),
          );
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      },
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

const deleteImage = async (publicId?: string | null): Promise<void> => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info("Deleted asset from Cloudinary successfully", { publicId });
  } catch (error) {
    logger.error("Failed to delete asset from Cloudinary:", {
      publicId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const cloudinaryService = {
  uploadImage,
  deleteImage,
  uploadToCloudinary: uploadImage,
  deleteFromCloudinary: deleteImage,
  cloudinary,
};

export default cloudinaryService;

