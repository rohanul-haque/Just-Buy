import { Schema, model } from "mongoose";
import type { IAdmin } from "@/modules/v1/admin/admin.interface";

const adminSchema = new Schema<IAdmin>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    profile: {
      type: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Admin = model<IAdmin>("Admin", adminSchema);
export default Admin;

