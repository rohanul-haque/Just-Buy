/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
/**
 * Third-Party Modules
 */
import { v2 as cloudinary } from "cloudinary";

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";
/**
 * Type
 */
import type { DeleteApiResponse, UploadApiResponse } from "cloudinary";

/**
 * Configure Cloudinary with environment variables
 */
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a Buffer to Cloudinary.
 * @param buffer - Image buffer from Multer memoryStorage
 * @param folder - Cloudinary folder path
 * @param publicId - Optional existing public_id to overwrite
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  publicId?: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: publicId,
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload failed", { error });
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary returned no result"));
          return;
        }
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * @param publicId - Cloudinary public_id (includes folder prefix)
 */
export const deleteFromCloudinary = async (
  publicId: string,
): Promise<DeleteApiResponse> => {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }

  logger.info("Blog banner deleted", { publicId, result: result.result });
  return result;
};
