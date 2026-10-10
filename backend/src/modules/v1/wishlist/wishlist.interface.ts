/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-party Modules
 */
import { Types } from "mongoose";

/**
 * Wishlist Interface Definition
 */
export interface IWishlist {
  buyer: Types.ObjectId;
  products: Types.ObjectId[];
}
