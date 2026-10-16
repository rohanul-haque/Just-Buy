/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import bcrypt from "bcrypt";
import { Schema, model, models } from "mongoose";

/**
 * Type
 */
import { type IUser, UserRole } from "@/modules/v1/auth/auth.intarface";

/**
 * User Schema Definition
 */
const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email can not be more than 254 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password cannot be more than 128 characters"],
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/**
 * Hash the password before persisting the user document.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * User Model Definition
 */
const User = models.User || model<IUser>("User", userSchema);

export default User;
