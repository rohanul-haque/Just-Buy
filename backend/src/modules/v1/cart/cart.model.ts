import { ProductSize } from "@/modules/v1/product/product.constant";
import type { ICart, ICartItem } from "@/modules/v1/cart/cart.interface";
import { Schema, model } from "mongoose";

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer",
      },
    },
    size: {
      type: String,
      enum: Object.values(ProductSize),
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new Schema<ICart>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    productItems: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Cart = model<ICart>("Cart", cartSchema);
export default Cart;

