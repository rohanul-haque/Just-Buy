/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired-party Modules
 */
import { model, models, Schema } from "mongoose";

/**
 * Type
 */
import type { IWishlist } from "@/modules/v1/wishlist/wishlist.interface";

/**
 * Buyer Schema Definition
 */
const wishlistSchema = new Schema<IWishlist>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
      unique: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Wishlist Model Definition
 */
const Wishlist =
  models.Wishlist || model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
