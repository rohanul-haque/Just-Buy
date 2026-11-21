import type { ICategory } from "@/modules/v1/category/category.interface";
import { Schema, model } from "mongoose";

const categoryImageSchema = new Schema(
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
  },
  { _id: false },
);

const categorySchema = new Schema<ICategory>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    image: {
      type: categoryImageSchema,
      default: () => ({
        publicId: "",
        url: "",
        width: null,
        height: null,
      }),
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Case-insensitive unique index on category name
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

export const Category = model<ICategory>("Category", categorySchema);

export default Category;

