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
import type { IAddToCartRequest } from "@/modules/v1/cart/cart.interface";

/**
 * Add Product to Cart
 */
export const addToCartService = async ({
  buyerId,
  productId,
  quantity,
}: IAddToCartRequest) => {
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

  // Return the updated cart
  return Cart.findOne({ buyer: buyerId }).populate(
    "items.product",
    "name price images",
  );
};

/**
 * Get Buyer's Cart
 */
// export const getCartService = async (buyerId: Types.ObjectId) => {
//   const cart = await Cart.findOne({ buyer: buyerId }).populate(
//     "items.product",
//     "name price image",
//   );

//   if (!cart) {
//     return {
//       items: [],
//       subtotal: 0,
//       deliveryFee: 0,
//       discount: 0,
//       total: 0,
//     };
//   }

//   // Calculate subtotal using current product prices
//   const items = cart.items as unknown as Array<{
//     product: {
//       _id: Types.ObjectId;
//       name: string;
//       price: number;
//       image: string;
//     };
//     quantity: number;
//   }>;

//   const subtotal = items.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0,
//   );

//   // Delivery fee and discount should follow business rules
//   const deliveryFee = items.length > 0 ? 100 : 0;
//   const discount = 0;
//   const total = subtotal + deliveryFee - discount;

//   return {
//     _id: cart._id,
//     buyer: cart.buyer,
//     items,
//     subtotal,
//     deliveryFee,
//     discount,
//     total,
//   };
// };

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
