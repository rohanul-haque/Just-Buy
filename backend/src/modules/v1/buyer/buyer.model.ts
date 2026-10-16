/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Module
 */
import { Schema, model, models } from "mongoose";

/**
 * Type
 */
import { Gender, type IBuyer } from "@/modules/v1/buyer/buyer.interface";

/**
 * Buyer Schema Definition
 */
const buyerSchema = new Schema<IBuyer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    avatar: {
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

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [15, "Phone number cannot exceed 15 characters"],
      default: "",
    },

    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.MALE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Buyer Model Definition
 */
const Buyer = models.Buyer || model<IBuyer>("Buyer", buyerSchema);

export default Buyer;
