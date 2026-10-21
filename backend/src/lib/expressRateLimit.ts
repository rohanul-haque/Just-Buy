/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { rateLimit } from "express-rate-limit";

/**
 * Configure rate limiter
 */
const limiter = rateLimit({
  windowMs: 60000, // 1 minute
  limit: 60, // 60 requests per minute
  standardHeaders: "draft-8", // Use the latest version of the RateLimit headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "You have made too many requests. Please try again later.",
  },
});

/**
 * Export default limiter
 */
export default limiter;
