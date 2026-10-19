/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-Party Modules
 */
import multer from "multer";

/**
 * In-Memory Storage for Multer
 * Stores file data in server memory instead of temporary files
 */
const storage = multer.memoryStorage();

/**
 * Multer configuration for file uploads
 * @param limits - Optional file size limits
 */
const fileUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default fileUpload;
