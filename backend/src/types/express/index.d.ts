/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Type
 */
import type { Types } from "mongoose";

/**
 * Global Interface Extension
 */
declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}

export {};
