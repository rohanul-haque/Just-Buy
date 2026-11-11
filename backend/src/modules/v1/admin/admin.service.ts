import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import { status } from "http-status";
import type { ClientSession, Types } from "mongoose";
import { ADMIN_MESSAGES } from "@/modules/v1/admin/admin.constant";
import type { IAdmin, IUpdateAdminProfileInput } from "@/modules/v1/admin/admin.interface";
import Admin from "@/modules/v1/admin/admin.model";

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

  let newProfileData:
    | {
        type: string;
        url: string;
        publicId: string;
      }
    | undefined;

  const oldPublicId = existingAdmin.profile?.publicId;

  // 1. Upload new image to Cloudinary first if a file is provided
  if (file) {
    const uploadRes = await cloudinaryService.uploadImage(file.buffer);
    newProfileData = {
      type: file.mimetype,
      url: uploadRes.url,
      publicId: uploadRes.publicId,
    };
  }

  // 2. Update Admin profile in database
  try {
    const updatedAdmin = await Admin.findOneAndUpdate(
      { admin: userId },
      {
        $set: {
          ...(payload.phoneNumber !== undefined && {
            phoneNumber: payload.phoneNumber,
          }),
          ...(newProfileData && { profile: newProfileData }),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("admin", "name email role status createdAt")
      .exec();

    if (!updatedAdmin) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        ADMIN_MESSAGES.ADMIN_NOT_FOUND,
      );
    }

    // 3. After successful database update, delete old image from Cloudinary
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
    // 4. If database update fails, delete newly uploaded image to avoid orphaned files
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
