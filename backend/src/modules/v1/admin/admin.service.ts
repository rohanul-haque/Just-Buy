import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import { ADMIN_MESSAGES } from "@/modules/v1/admin/admin.constant";
import type {
  IAdmin,
  IUpdateAdminProfileInput,
} from "@/modules/v1/admin/admin.interface";
import Admin from "@/modules/v1/admin/admin.model";
import User from "@/modules/v1/user/user.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import MESSAGES from "@/utils/MESSAGE";
import { hashPassword } from "@/utils/password";
import { status } from "http-status";
import type { ClientSession, Types } from "mongoose";

const createAdminProfile = async (
  userId: Types.ObjectId | string,
  session?: ClientSession,
): Promise<IAdmin> => {
  const existing = await Admin.findOne({ admin: userId }).session(
    session || null,
  );
  if (existing) {
    return existing;
  }

  const [admin] = await Admin.create(
    [
      {
        admin: userId,
      },
    ],
    { ...(session && { session }) },
  );

  return admin;
};

const getOwnProfile = async (userId: string): Promise<IAdmin> => {
  const admin = await Admin.findOne({ admin: userId })
    .populate("admin", "name email role status createdAt")
    .exec();

  if (!admin) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      ADMIN_MESSAGES.ADMIN_NOT_FOUND,
    );
  }

  return admin;
};

const updateOwnProfile = async (
  userId: string,
  payload: IUpdateAdminProfileInput,
  file?: Express.Multer.File,
): Promise<IAdmin> => {
  const existingAdmin = await Admin.findOne({ admin: userId }).exec();
  if (!existingAdmin) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      ADMIN_MESSAGES.ADMIN_NOT_FOUND,
    );
  }

  // 1. If email is provided, verify uniqueness against other users
  if (payload.email) {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const existingUserWithEmail = await User.findOne({
      email: trimmedEmail,
      _id: { $ne: userId },
    }).exec();

    if (existingUserWithEmail) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.AUTH_EMAIL_EXISTS,
        MESSAGES.EMAIL_ALREADY_EXISTS,
      );
    }
  }

  // 2. Upload new image to Cloudinary first if a file is provided
  let newProfileData:
    | {
        type: string;
        url: string;
        publicId: string;
      }
    | undefined;

  const oldPublicId = existingAdmin.profile?.publicId;

  if (file) {
    const uploadRes = await cloudinaryService.uploadImage(file.buffer);
    newProfileData = {
      type: file.mimetype,
      url: uploadRes.url,
      publicId: uploadRes.publicId,
    };
  }

  // 3. Prepare partial update fields for User document
  const userUpdateFields: Record<string, any> = {};
  if (payload.name !== undefined && payload.name.trim().length > 0) {
    userUpdateFields.name = payload.name.trim();
  }
  if (payload.email !== undefined && payload.email.trim().length > 0) {
    userUpdateFields.email = payload.email.trim().toLowerCase();
  }
  if (payload.password !== undefined && payload.password.trim().length > 0) {
    userUpdateFields.password = await hashPassword(payload.password.trim());
  }

  // 4. Prepare partial update fields for Admin document
  const adminUpdateFields: Record<string, any> = {};
  if (
    payload.phoneNumber !== undefined &&
    payload.phoneNumber.trim().length > 0
  ) {
    adminUpdateFields.phoneNumber = payload.phoneNumber.trim();
  }
  if (newProfileData) {
    adminUpdateFields.profile = newProfileData;
  }

  try {
    // Apply User updates if any
    if (Object.keys(userUpdateFields).length > 0) {
      await User.findByIdAndUpdate(
        userId,
        { $set: userUpdateFields },
        { new: true, runValidators: true },
      ).exec();
    }

    // Apply Admin updates if any
    if (Object.keys(adminUpdateFields).length > 0) {
      await Admin.findOneAndUpdate(
        { admin: userId },
        { $set: adminUpdateFields },
        { new: true, runValidators: true },
      ).exec();
    }

    // Fetch refreshed populated profile
    const updatedAdmin = await Admin.findOne({ admin: userId })
      .populate("admin", "name email role status createdAt")
      .exec();

    if (!updatedAdmin) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        ADMIN_MESSAGES.ADMIN_NOT_FOUND,
      );
    }

    // After successful database update, delete old image from Cloudinary
    if (file && oldPublicId) {
      cloudinaryService.deleteImage(oldPublicId).catch((err) => {
        logger.error(
          "Failed to cleanup old admin profile image from Cloudinary:",
          err,
        );
      });
    }

    return updatedAdmin;
  } catch (error) {
    // If database update fails, delete newly uploaded image to avoid orphaned files
    if (newProfileData?.publicId) {
      cloudinaryService.deleteImage(newProfileData.publicId).catch((err) => {
        logger.error(
          "Failed to cleanup newly uploaded admin image on database failure:",
          err,
        );
      });
    }

    throw error;
  }
};

const adminService = {
  createAdminProfile,
  getOwnProfile,
  updateOwnProfile,
};

export default adminService;
