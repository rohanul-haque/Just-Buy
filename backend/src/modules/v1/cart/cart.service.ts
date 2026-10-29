/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { StatusCodes } from "http-status-codes";

/**
 * Application Modules
 */
import Cart from "@/modules/v1/cart/cart.model";
import Product from "@/modules/v1/product/product.model";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";

/**
 * Types
 */
import { logger } from "@/lib/winston";
import type {
  BuyerId,
  IAddToCartPayload,
  ICartResponse,
  IRemoveFromCartRequest,
  IUpdateCartQuantityPayload,
} from "@/modules/v1/cart/cart.interface";

/**
 * Add Product to Cart
 */
export const addToCart = async ({
  buyerId,
  id,
  quantity,
}: IAddToCartPayload): Promise<void> => {
  // Check whether the product exists
  const productExists = await Product.exists({
    _id: id,
  });

  if (!productExists) {
    logger.warn(API_MESSAGES.PRODUCT_NOT_FOUND, {
      productId: id,
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Find the buyer's cart
  let cart = await Cart.findOne({
    buyer: buyerId,
  });

  // Create a cart if it does not exist
  if (!cart) {
    cart = await Cart.create({
      buyer: buyerId,
      items: [],
    });
  }

  // Check whether the product already exists in the cart
  const existingItem = cart.items.find(
    (item: any) => item.product.toString() === id.toString(),
  );

  if (existingItem) {
    // Increase the existing item's quantity
    await Cart.updateOne(
      {
        buyer: buyerId,
        "items.product": id,
      },
      {
        $inc: {
          "items.$.quantity": quantity,
        },
      },
    );

    return;
  }

  // Add a new product to the cart
  await Cart.updateOne(
    {
      buyer: buyerId,
    },
    {
      $push: {
        items: {
          product: id,
          quantity,
        },
      },
    },
  );
};

/**
 * Get Buyer's Cart
 * @param {BuyerId} buyerId - Buyer ID
 * @returns {Promise<ICartResponse>}
 */
export const getAllCart = async (buyerId: BuyerId): Promise<ICartResponse> => {
  const cart = await Cart.findOne({ buyer: buyerId })
    .populate("items.product", "name price images")
    .lean()
    .exec();

  if (!cart) {
    return {
      buyer: buyerId,
      items: [],
    };
  }

  return cart;
};

/**
 * Update Cart Item Quantity
 */
export const updateCartQuantity = async ({
  buyerId,
  id,
  quantity,
}: IUpdateCartQuantityPayload): Promise<void> => {
  // Find the product and check available stock.
  const product = await Product.findById(id)
    .select("stockQuantity")
    .lean()
    .exec();

  if (!product) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      API_MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // Prevent cart quantity from exceeding available stock.
  if (quantity > product.stockQuantity) {
    throw new AppError(
      StatusCodes.CONFLICT,
      ERROR_CODE.INSUFFICIENT_STOCK,
      API_MESSAGES.INSUFFICIENT_STOCK,
    );
  }

  // Update the quantity only if the product belongs to this buyer's cart.
  const updatedCart = await Cart.findOneAndUpdate(
    {
      buyer: buyerId,
      "items.product": id,
    },
    {
      $set: {
        "items.$.quantity": quantity,
      },
    },
    {
      runValidators: true,
    },
  )
    .select("_id")
    .lean()
    .exec();

  if (!updatedCart) {
    logger.warn(API_MESSAGES.CART_ITEM_NOT_FOUND, {
      buyerId,
      id,
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      API_MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }
};

/**
 * Remove Product from Cart
 */
const removeFromCart = async ({
  buyerId,
  productId,
}: IRemoveFromCartRequest) => {
  const cart = await Cart.findOneAndUpdate(
    {
      buyer: buyerId,
      "items.product": productId,
    },
    {
      $pull: {
        items: { product: productId },
      },
    },
    {
      new: true,
    },
  );

  if (!cart) {
    logger.warn(API_MESSAGES.CART_ITEM_NOT_FOUND, { buyerId, productId });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      API_MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }
};

const cartService = { addToCart, getAllCart, updateCartQuantity };

export default cartService;
