import { Schema, model } from "mongoose";
import type { IVerification } from "@/modules/v1/verification/verification.interface";

const verificationSchema = new Schema<IVerification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Verification = model<IVerification>(
  "Verification",
  verificationSchema,
);

export default Verification;
