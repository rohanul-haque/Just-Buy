/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import config from "@/config";
import { logger } from "@/lib/winston";

/**
 * Type
 */
import type { CorsOptions } from "cors";

/**
 * CORS Configuration
 */
const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELISTED_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);

      callback(new Error(`CORS Error: ${origin} is not allowed by CORS`));
    }
  },
};

/**
 * Export default corsOptions
 */
export default corsOptions;
