/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party modules
 */
import multer from "multer";

/**
 * In-memory storage for uploaded files
 */
const storage = multer.memoryStorage();

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];

/**
 * Maximum file size: 5 MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Multer configuration for image uploads
 */
const fileUpload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname),
      );
    }

    callback(null, true);
  },
});

/**
 * Export configured file upload middleware
 */
export default fileUpload;
