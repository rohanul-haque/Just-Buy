import { Schema, model } from "mongoose";
import { Gender } from "@/modules/v1/buyer/buyer.constant";
import type { IBuyer } from "@/modules/v1/buyer/buyer.interface";

const buyerSchema = new Schema<IBuyer>(
  {
    buyer: {
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
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    profile: {
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

export const Buyer = model<IBuyer>("Buyer", buyerSchema);
export default Buyer;

