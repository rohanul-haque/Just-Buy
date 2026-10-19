/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { model, models, Schema } from "mongoose";

/**
 * Types
 */
import type { IOrder, IOrderItem } from "@/modules/v1/order/order.interface";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/modules/v1/order/order.interface";

/**
 * Buyer Schema Definition
 */
const orderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: [true, "Buyer is required"],
      index: true,
    },

    items: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          seller: {
            type: Schema.Types.ObjectId,
            ref: "Seller",
            required: true,
          },
          name: {
            type: String,
            required: true,
            trim: true,
          },
          images: {
            publicId: {
              type: String,
              default: "",
            },
            url: {
              type: String,
              default: "",
            },
            width: {
              type: Number,
              default: null,
            },
            height: {
              type: Number,
              default: null,
            },
          },
          price: {
            type: Number,
            required: true,
            min: 0,
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
        },
      ],
      required: [true, "Items are required"],
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "An order must contain at least one product",
      },
    },

    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      location: {
        type: String,
        required: [true, "Location is required"],
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      emailAddress: {
        type: String,
        required: [true, "Email address is required"],
        trim: true,
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal must be at least 0"],
    },

    shippingFee: {
      type: Number,
      required: [true, "Shipping fee is required"],
      min: [0, "Shipping fee must be at least 0"],
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },

    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Order Model Definition
 */
const Order = models.Order || model<IOrder>("Order", orderSchema);

export default Order;
