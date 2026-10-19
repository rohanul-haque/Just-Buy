/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-party module
 */
import { Schema, model, models } from "mongoose";

/**
 * Type
 */
import type { IProduct } from "@/modules/v1/product/product.interface";

/**
 * Product Schema
 */
const productSchema = new Schema<IProduct>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },

    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },

    sizes: {
      type: [
        {
          type: String,
          enum: ["S", "M", "L", "XL", "XXL"],
          trim: true,
        },
      ],
      default: [],
    },

    images: {
      type: [
        {
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
          _id: false,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Product Model Definition
 */
const Product = models.Product || model<IProduct>("Product", productSchema);

export default Product;
