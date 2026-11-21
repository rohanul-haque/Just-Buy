import { Schema, model } from "mongoose";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import type { IVendor } from "@/modules/v1/vendor/vendor.interface";

const imageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false },
);

const vendorProfileSchema = new Schema<IVendor>(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    location: {
      type: String,
      trim: true,
    },
    licenceNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    profile: {
      type: imageSchema,
      default: undefined,
    },
    nidFrontImage: {
      type: imageSchema,
      default: undefined,
    },
    nidBackImage: {
      type: imageSchema,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(VendorStatus),
      default: VendorStatus.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Vendor = model<IVendor>("Vendor", vendorProfileSchema);
export const VendorProfile = Vendor;
export default Vendor;
