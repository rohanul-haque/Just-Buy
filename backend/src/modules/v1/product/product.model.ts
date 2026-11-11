import { ProductSize } from "@/modules/v1/product/product.constant";
import type {
  IProduct,
  IProductImage,
} from "@/modules/v1/product/product.interface";
import { Schema, model } from "mongoose";

const productImageSchema = new Schema<IProductImage>(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sizes: {
      type: [
        {
          type: String,
          enum: Object.values(ProductSize),
        },
      ],
      default: [],
    },
    featureImage: {
      type: productImageSchema,
      required: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ vendor: 1, createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export const Product = model<IProduct>("Product", productSchema);
export default Product;
