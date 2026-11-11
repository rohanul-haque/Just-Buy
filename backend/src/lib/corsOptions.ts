import config from "@/config";
import { logger } from "@/lib/winston";
import type { CorsOptions } from "cors";

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

export default corsOptions;
