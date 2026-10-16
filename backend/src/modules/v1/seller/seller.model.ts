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
 * Types
 */
import { Gender } from "@/modules/v1/buyer/buyer.interface";
import {
  SellerVerificationStatus,
  type ISeller,
} from "@/modules/v1/seller/seller.interface";

/**
 * User Schema Definition
 */
const sellerSchema = new Schema<ISeller>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    storeName: {
      type: String,
      trim: true,
      maxlength: [150, "Store name cannot exceed 150 characters"],
      default: "",
    },

    shopAddress: {
      type: String,
      trim: true,
      maxlength: [254, "Shop address cannot exceed 254 characters"],
      default: "",
    },

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [15, "Phone number cannot exceed 15 characters"],
      default: "",
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

    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.MALE,
    },

    verificationStatus: {
      type: String,
      enum: Object.values(SellerVerificationStatus),
      default: SellerVerificationStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Seller Model Definition
 */
const Seller = models.Seller || model<ISeller>("Seller", sellerSchema);

export default Seller;
