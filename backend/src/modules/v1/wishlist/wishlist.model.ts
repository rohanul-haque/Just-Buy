import type { IWishlist } from "@/modules/v1/wishlist/wishlist.interface";
import { Schema, model } from "mongoose";

const wishlistSchema = new Schema<IWishlist>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Wishlist = model<IWishlist>("Wishlist", wishlistSchema);
export default Wishlist;

