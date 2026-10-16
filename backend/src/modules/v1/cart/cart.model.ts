/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party Modules
 */
import { model, models, Schema } from "mongoose";

/**
 * Type
 */
import type { ICart } from "@/modules/v1/cart/cart.interface";

/**
 * Cart Schema Definition
 */
const cartSchema = new Schema<ICart>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
      unique: true,
    },

    items: [
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
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Cart Model Definition
 */
const Cart = models.Cart || model<ICart>("Cart", cartSchema);

export default Cart;
