/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Models
 */
import Cart from "@/modules/v1/cart/cart.model";
import Order from "@/modules/v1/order/order.model";
import Product from "@/modules/v1/product/product.model";

/**
 * Types
 */
import type {
  CreateOrderInput,
  IOrderItem,
} from "@/modules/v1/order/order.interface";
import type { IAvatar } from "@/modules/v1/seller/seller.interface";

/**
 * Service for create new order
 * @param buyerId - Buyer ID
 * @param payload - Order payload
 * @returns Promise<void>
 */
export const createOrderService = async (
  buyerId: Types.ObjectId,
  payload: CreateOrderInput,
): Promise<void> => {
  const cart = await Cart.findOne({ buyer: buyerId });

  if (!cart || cart.items.length === 0) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      API_MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }

  const items: IOrderItem[] = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product) {
      throw new AppError(
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODE.CART_ITEM_NOT_FOUND,
        API_MESSAGES.CART_ITEM_NOT_FOUND,
      );
    }

    if (!product.seller) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
        API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
      );
    }

    items.push({
      product: product._id,
      seller: product.seller,
      name: product.name,
      images: product.images.map((image: IAvatar) => ({
        publicId: image.publicId,
        url: image.url,
        width: image.width ?? null,
        height: image.height ?? null,
      })),
      price: product.price,
      quantity: cartItem.quantity,
    });
  }

  // Calculate the order amount
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shippingFee = subtotal > 0 ? 100 : 0;

  const total = subtotal + shippingFee;

  // Save the order
  const order = await Order.create({
    buyer: buyerId,
    items,
    shippingAddress: payload.shippingAddress,
    subtotal,
    shippingFee,
    total,
    paymentMethod: payload.paymentMethod,
  });

  // Clear the cart after creating the order
  await Cart.deleteOne({ _id: cart._id, buyer: buyerId });
};
