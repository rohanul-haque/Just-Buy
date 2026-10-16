/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { Schema, model, models } from "mongoose";

/**
 * Type
 */
import type { IAdmin } from "@/modules/v1/admin/admin.interface";

/**
 * Admin Schema Definition
 */
const adminSchema = new Schema<IAdmin>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Admin Model Definition
 */
const Admin = models.Admin || model<IAdmin>("Admin", adminSchema);

export default Admin;
