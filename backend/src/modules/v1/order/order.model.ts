import { OrderStatus, OrderType } from "@/modules/v1/order/order.constant";
import type {
  IOrder,
  IOrderItem,
  IShippingAddress,
} from "@/modules/v1/order/order.interface";
import { ProductSize } from "@/modules/v1/product/product.constant";
import { Schema, model } from "mongoose";

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Bangladesh",
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
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
    size: {
      type: String,
      enum: Object.values(ProductSize),
    },
    itemSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
    },
    adminCommission: {
      type: Number,
      required: true,
      min: 0,
    },
    vendorEarning: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const orderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    orderType: {
      type: String,
      enum: Object.values(OrderType),
      default: OrderType.COD,
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    productItems: {
      type: [orderItemSchema],
      required: true,
      alias: "items",
      validate: {
        validator: (items: IOrderItem[]) =>
          Array.isArray(items) && items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
export default Order;
