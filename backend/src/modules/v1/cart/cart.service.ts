/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import Cart from "@/modules/v1/cart/cart.model";
import Product from "@/modules/v1/product/product.model";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Types
 */
import { logger } from "@/lib/winston";
import type {
  BuyerId,
  IAddToCartRequest,
  ICartResponse,
} from "@/modules/v1/cart/cart.interface";

/**
 * Add Product to Cart
 */
export const addToCartService = async ({
  buyerId,
  productId,
  quantity,
}: IAddToCartRequest): Promise<void> => {
  // Check if the product exists
  const productExists = await Product.exists({ _id: productId });

  if (!productExists) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Find or create the buyer's cart
  let cart = await Cart.findOne({ buyer: buyerId });

  if (!cart) {
    cart = await Cart.create({
      buyer: buyerId,
      items: [],
    });
  }

  // Check if the product is already in the cart
  const existingItem = cart.items.find(
    (item: any) => item.product.toString() === productId.toString(),
  );

  if (existingItem) {
    // Increase the quantity
    await Cart.updateOne(
      { buyer: buyerId, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
    );
  } else {
    // Add a new product
    await Cart.updateOne(
      { buyer: buyerId },
      { $push: { items: { product: productId, quantity } } },
    );
  }
};

/**
 * Get Buyer's Cart
 * @param {BuyerId} buyerId - Buyer ID
 * @returns {Promise<ICartResponse>}
 */
export const getCartService = async (
  buyerId: BuyerId,
): Promise<ICartResponse> => {
  const cart = await Cart.findOne({ buyer: buyerId })
    .populate("items.product", "name price images")
    .lean<ICartResponse>()
    .exec();

  if (!cart) {
    logger.info("Cart not found", { buyerId });

    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.CART_NOT_FOUND,
      API_MESSAGES.CART_NOT_FOUND,
    );
  }

  return cart;
};

/**
 * Update Cart Item Quantity
 */
// export const updateCartQuantityService = async ({
//   buyerId,
//   productId,
//   quantity,
// }: IUpdateCartQuantityRequest) => {
//   const cart = await Cart.findOneAndUpdate(
//     {
//       buyer: buyerId,
//       "items.product": productId,
//     },
//     {
//       $set: {
//         "items.$.quantity": quantity,
//       },
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   ).populate("items.product", "name price image");

//   if (!cart) {
//     throw new AppError(
//       HTTP_STATUS.NOT_FOUND,
//       ERROR_CODE.PRODUCT_NOT_FOUND,
//       "Product not found in cart",
//     );
//   }

//   return cart;
// };

/**
 * Remove Product from Cart
 */
// export const removeFromCartService = async ({
//   buyerId,
//   productId,
// }: IAddToCartRequest) => {
//   const cart = await Cart.findOneAndUpdate(
//     {
//       buyer: buyerId,
//       "items.product": productId,
//     },
//     {
//       $pull: {
//         items: { product: productId },
//       },
//     },
//     {
//       new: true,
//     },
//   ).populate("items.product", "name price image");

//   if (!cart) {
//     throw new AppError(
//       HTTP_STATUS.NOT_FOUND,
//       ERROR_CODE.PRODUCT_NOT_FOUND,
//       "Product not found in cart",
//     );
//   }

//   return cart;
// };
