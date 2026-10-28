/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import Product from "@/modules/v1/product/product.model";
import Wishlist from "@/modules/v1/wishlist/wishlist.model";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";

/**
 * Type
 */
import type {
  BuyerId,
  GetAllWishlistParams,
  IAddWishlistPayload,
  IRemoveWishlistPayload,
  IWishlistResponse,
} from "@/modules/v1/wishlist/wishlist.interface";

/**
 * Service for adding a product to the wishlist
 * @param {BuyerId} buyerId - Buyer ID
 * @param {ProductId} productId - Product ID
 * @returns {Promise<void>}
 */
export const addWishlist = async ({
  buyerId,
  id,
}: IAddWishlistPayload): Promise<void> => {
  const productExists = await Product.exists({
    _id: id,
  });

  if (!productExists) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  const alreadyAdded = await Wishlist.exists({
    buyer: buyerId,
    products: id,
  });

  if (alreadyAdded) {
    throw new AppError(
      StatusCodes.CONFLICT,
      ERROR_CODE.PRODUCT_ALREADY_WISHED,
      API_MESSAGES.PRODUCT_ALREADY_WISHED,
    );
  }

  await Wishlist.findOneAndUpdate(
    { buyer: buyerId },
    {
      $addToSet: { products: id },
    },
    {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  ).exec();
};

/**
 * Service for getting all wishlist items
 * @param {BuyerId} buyerId - Buyer ID
 * @returns {Promise<IWishlistResponse>}
 */
export const getAllWishlists = async ({
  buyerId,
  limit,
  offset,
}: GetAllWishlistParams): Promise<IWishlistResponse> => {
  const wishlist = await Wishlist.findOne({ buyer: buyerId })
    .select("products")
    .lean()
    .exec();

  if (!wishlist || wishlist.products.length === 0) {
    return {
      products: [],
      total: 0,
      limit,
      offset,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const filter = {
    _id: { $in: wishlist.products },
  };

  const [total, products] = await Promise.all([
    Product.countDocuments(filter).exec(),

    Product.find(filter)
      .select("name images price createdAt")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + products.length < total;
  const hasPrevPage = offset > 0 && offset < total;

  return {
    products,
    total,
    limit,
    offset,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Service for removing a product from the wishlist
 * @param {BuyerId} buyerId - Buyer ID
 * @param {ProductId} productId - Product ID
 * @returns {Promise<void>}
 */
export const removeWishlist = async ({
  buyerId,
  id,
}: IRemoveWishlistPayload): Promise<void> => {
  const wishlist = await Wishlist.findOneAndUpdate(
    {
      buyer: buyerId,
      products: id,
    },
    {
      $pull: {
        products: id,
      },
    },
    {
      runValidators: true,
    },
  )
    .select("_id")
    .lean()
    .exec();

  if (!wishlist) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.WISHLIST_NOT_FOUND,
      API_MESSAGES.WISHLIST_ITEM_NOT_FOUND,
    );
  }
};

const wishlistService = { addWishlist, getAllWishlists, removeWishlist };

export default wishlistService;
