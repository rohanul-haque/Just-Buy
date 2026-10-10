/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

import Product from "../product/product.model";
import Wishlist from "./wishlist.model";

/**
 * Application Modules
 */

/**
 * Applicatio  Models
 */

/**
 * Types
 */

export const addWishlistService = async (
  buyerId: string,
  productId: string,
) => {
  // Check whether product exists
  const productExists = await Product.exists({ _id: productId });

  // Add product to buyer's wishlist
  await Wishlist.findOneAndUpdate(
    { buyer: buyerId },
    {
      $addToSet: {
        products: productId,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).populate("products", "name price image");
};
