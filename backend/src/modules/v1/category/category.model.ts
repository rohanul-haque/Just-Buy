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
import type { ICategory } from "@/modules/v1/category/category.interface";

/**
 * Category Model definition
 */
const categorySchema = new Schema<ICategory>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    image: {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Category =
  models.Category || model<ICategory>("Category", categorySchema);

export default Category;
