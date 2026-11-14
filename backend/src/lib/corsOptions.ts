import config from "@/config";
import { logger } from "@/lib/winston";
import type { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (
      !origin ||
      config.NODE_ENV === "development" ||
      config.WHITELISTED_ORIGINS.includes(origin) ||
      origin === config.FRONTEND_URL ||
      origin === config.CLIENT_URL
    ) {
      callback(null, true);
    } else {
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
      callback(new Error(`CORS Error: ${origin} is not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
};

export default corsOptions;
