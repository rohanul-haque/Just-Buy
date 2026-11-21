import type { IAddToCartInput, ICart } from "@/modules/v1/cart/cart.interface";
import Cart from "@/modules/v1/cart/cart.model";
import Product from "@/modules/v1/product/product.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { status } from "http-status";

const safeCartProductPopulation = {
  path: "productItems.product",
  select: "name price featureImage quantity",
};

const addToCart = async (
  buyerId: string,
  payload: IAddToCartInput,
): Promise<ICart> => {
  // 1. Verify that the Product exists and is active
  const product = await Product.findOne({
    _id: payload.productId,
    isActive: true,
  }).exec();

  if (!product) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  // 2. Validate size if product has size options
  if (product.sizes && product.sizes.length > 0) {
    if (!payload.size) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        "Please select a size for this product",
      );
    }
    if (!product.sizes.includes(payload.size)) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
        "Selected size is not available for this product",
      );
    }
  }

  // 3. Check requested quantity against available stock
  if (payload.quantity > product.stock) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.CART_ITEM_OUT_OF_STOCK,
      "Requested quantity exceeds available stock",
    );
  }

  // 4. Find or create Cart for Buyer
  let cart = await Cart.findOne({ buyer: buyerId }).exec();

  if (!cart) {
    cart = await Cart.create({
      buyer: buyerId,
      productItems: [
        {
          product: product._id,
          quantity: payload.quantity,
          size: payload.size,
        },
      ],
    });
    return (await cart.populate(safeCartProductPopulation)) as ICart;
  }

  // 5. Check if same product and size already exists
  const existingItem = cart.productItems.find((item) => {
    const isSameProduct = item.product.toString() === payload.productId;
    const isSameSize =
      !item.size && !payload.size ? true : item.size === payload.size;
    return isSameProduct && isSameSize;
  });

  if (existingItem) {
    const combinedQuantity = existingItem.quantity + payload.quantity;
    if (combinedQuantity > product.stock) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.CART_ITEM_OUT_OF_STOCK,
        "Requested quantity exceeds available stock",
      );
    }
    existingItem.quantity = combinedQuantity;
  } else {
    cart.productItems.push({
      product: product._id,
      quantity: payload.quantity,
      size: payload.size,
    } as any);
  }

  await cart.save();
  return (await cart.populate(safeCartProductPopulation)) as ICart;
};

const getCart = async (
  buyerId: string,
): Promise<ICart | { buyer: string; productItems: any[] }> => {
  const cart = await Cart.findOne({ buyer: buyerId })
    .populate(safeCartProductPopulation)
    .exec();

  if (!cart) {
    return {
      buyer: buyerId,
      productItems: [],
    };
  }

  return cart;
};

const updateCartItemQuantity = async (
  buyerId: string,
  itemId: string,
  quantity: number,
): Promise<ICart> => {
  const cart = await Cart.findOne({ buyer: buyerId }).exec();

  if (!cart) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CART_NOT_FOUND,
      MESSAGES.CART_NOT_FOUND,
    );
  }

  const item = cart.productItems.find((item) => item._id.toString() === itemId);

  if (!item) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }

  const product = await Product.findById(item.product).exec();
  if (!product || !product.isActive) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.PRODUCT_NOT_FOUND,
      MESSAGES.PRODUCT_NOT_FOUND,
    );
  }

  if (quantity > product.stock) {
    throw new AppError(
      status.BAD_REQUEST,
      ERROR_CODE.CART_ITEM_OUT_OF_STOCK,
      "Requested quantity exceeds available stock",
    );
  }

  item.quantity = quantity;
  await cart.save();

  return (await cart.populate(safeCartProductPopulation)) as ICart;
};

const removeCartItem = async (
  buyerId: string,
  itemId: string,
): Promise<ICart> => {
  const cart = await Cart.findOne({ buyer: buyerId }).exec();

  if (!cart) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CART_NOT_FOUND,
      MESSAGES.CART_NOT_FOUND,
    );
  }

  const itemIndex = cart.productItems.findIndex(
    (item) => item._id.toString() === itemId,
  );

  if (itemIndex === -1) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.CART_ITEM_NOT_FOUND,
      MESSAGES.CART_ITEM_NOT_FOUND,
    );
  }

  cart.productItems.splice(itemIndex, 1);
  await cart.save();

  return (await cart.populate(safeCartProductPopulation)) as ICart;
};

const cartService = {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
};

export default cartService;
