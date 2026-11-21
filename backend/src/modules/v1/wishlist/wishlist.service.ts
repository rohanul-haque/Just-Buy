import Product from "@/modules/v1/product/product.model";
import type { IWishlist } from "@/modules/v1/wishlist/wishlist.interface";
import Wishlist from "@/modules/v1/wishlist/wishlist.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { status } from "http-status";

const safeProductPopulation = {
  path: "products",
  match: { isActive: true },
  select:
    "name price featureImage",
};

const addProductToWishlist = async (
  buyerId: string,
  productId: string,
): Promise<IWishlist> => {
  // 1. Verify that the Product exists and is active
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  }).exec();

  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // 2. Find Buyer's existing Wishlist
  const existingWishlist = await Wishlist.findOne({ buyer: buyerId }).exec();

  if (existingWishlist) {
    // 3. Prevent duplicate Product IDs
    const isAlreadyWished = existingWishlist.products.some(
      (p) => p.toString() === productId,
    );

    if (isAlreadyWished) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.PRODUCT_ALREADY_WISHED,
        MESSAGES.PRODUCT_ALREADY_WISHED,
      );
    }
  }

  // 4. Upsert/Update wishlist using $addToSet for concurrency safety
  const updatedWishlist = await Wishlist.findOneAndUpdate(
    { buyer: buyerId },
    { $addToSet: { products: productId } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
    .populate(safeProductPopulation)
    .exec();

  return updatedWishlist;
};

const getWishlist = async (
  buyerId: string,
): Promise<IWishlist | { buyer: string; products: any[] }> => {
  const wishlist = await Wishlist.findOne({ buyer: buyerId })
    .populate(safeProductPopulation)
    .exec();

  if (!wishlist) {
    return {
      buyer: buyerId,
      products: [],
    };
  }

  return wishlist;
};

const removeProductFromWishlist = async (
  buyerId: string,
  productId: string,
): Promise<IWishlist> => {
  const wishlist = await Wishlist.findOne({ buyer: buyerId }).exec();

  if (!wishlist) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.WISHLIST_NOT_FOUND,
      MESSAGES.WISHLIST_NOT_FOUND,
    );
  }

  const isProductInWishlist = wishlist.products.some(
    (p) => p.toString() === productId,
  );

  if (!isProductInWishlist) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.WISHLIST_ITEM_NOT_FOUND,
      MESSAGES.WISHLIST_ITEM_NOT_FOUND,
    );
  }

  const updatedWishlist = await Wishlist.findOneAndUpdate(
    { buyer: buyerId },
    { $pull: { products: productId } },
    { new: true },
  )
    .populate(safeProductPopulation)
    .exec();

  return updatedWishlist!;
};

const wishlistService = {
  addProductToWishlist,
  getWishlist,
  removeProductFromWishlist,
};

export default wishlistService;
