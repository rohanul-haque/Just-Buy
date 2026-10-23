/**
 * @copyright 2026
 * @author MD Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Third-Party Modules
 */
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

/**
 * Application Modules
 */
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE } from "@/utils/constants";

/**
 * Application Models
 */
import User from "@/modules/v1/auth/auth.model";
import Buyer from "@/modules/v1/buyer/buyer.model";

/**
 * Type
 */
import type {
  IAllBuyerProfile,
  IBuyerProfile,
  IGetAllBuyerProfileParams,
  IUpdateBuyerPayload,
} from "@/modules/v1/buyer/buyer.interface";

/**
 * Service for get buyer profile by ID
 * @param userId - Buyer user ID
 * @returns {Promise<IBuyerProfile>}
 */
export const getCurrentBuyerProfile = async ({
  id,
}: {
  id: string;
}): Promise<IBuyerProfile> => {
  // Find buyer profile
  const buyer = await Buyer.findOne({ user: id })
    .populate("user", "fullName email role")
    .lean()
    .exec();

  // Check if buyer profile found
  if (!buyer) {
    logger.warn(API_MESSAGES.BUYER_PROFILE_NOT_FOUND, {});

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.BUYER_PROFILE_NOT_FOUND,
      API_MESSAGES.BUYER_PROFILE_NOT_FOUND,
    );
  }

  return buyer;
};

/**
 * Service for get all buyer profile
 * @param limit - Maximum number of buyer profiles to retrieve
 * @param offset - Number of buyer profiles to skip
 * @returns {Promise<IAllBuyerProfile>}
 */
export const getAllBuyerProfile = async ({
  limit,
  offset,
}: IGetAllBuyerProfileParams): Promise<IAllBuyerProfile> => {
  // Fetch total count and buyer profiles concurrently
  const [total, allBuyers] = await Promise.all([
    Buyer.countDocuments().exec(),
    Buyer.find()
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + allBuyers.length < total;
  const hasPrevPage = offset > 0 && total > 0;

  return {
    allBuyers,
    total,
    limit,
    skip: offset,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Service for update buyer profile
 * @param userId - Buyer user ID
 * @param payload - Buyer profile data
 * @param file - Buyer profile picture
 * @returns {Promise<void>}
 */
export const updateBuyerProfile = async ({
  userId,
  payload,
  file,
}: IUpdateBuyerPayload): Promise<void> => {
  const { fullName, password, gender, phoneNumber } = payload;

  // Validate uploaded avatar
  if (file) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(
        StatusCodes.REQUEST_TOO_LONG,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }
  }

  // Load the existing documents
  const [user, buyer] = await Promise.all([
    User.findById(userId),
    Buyer.findOne({ user: userId }),
  ]);

  if (!user) {
    logger.warn(API_MESSAGES.USER_NOT_FOUND, { userId: String(userId) });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      API_MESSAGES.USER_NOT_FOUND,
    );
  }

  if (!buyer) {
    logger.warn(API_MESSAGES.BUYER_PROFILE_NOT_FOUND, {
      userId: String(userId),
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.BUYER_PROFILE_NOT_FOUND,
      API_MESSAGES.BUYER_PROFILE_NOT_FOUND,
    );
  }

  // Keep the previous avatar until the update succeeds
  const previousAvatarPublicId = buyer.avatar?.publicId;
  let newAvatarPublicId: string | undefined;

  try {
    // Upload the new avatar before modifying the database
    if (file) {
      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API",
      );

      newAvatarPublicId = cloudinaryData.public_id;

      // Assign the new avatar metadata
      buyer.avatar = {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        height: cloudinaryData.height,
        width: cloudinaryData.width,
      };
    }

    // Apply only the fields provided by the client
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (password !== undefined) {
      user.password = password;
    }

    if (gender !== undefined) {
      buyer.gender = gender.trim();
    }

    if (phoneNumber !== undefined) {
      buyer.phoneNumber = phoneNumber.trim();
    }

    // Persist both documents in one database transaction
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await user.save({ session });
        await buyer.save({ session });
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    // Best-effort cleanup if the new avatar was uploaded
    if (newAvatarPublicId) {
      try {
        await deleteFromCloudinary(newAvatarPublicId);
      } catch (cleanupError) {
        logger.error("Failed to clean up the newly uploaded avatar", {
          userId: String(userId),
          publicId: newAvatarPublicId,
          error: cleanupError,
        });
      }
    }

    throw error;
  }

  // Delete the previous avatar only after the database update succeeds
  if (
    file &&
    previousAvatarPublicId &&
    previousAvatarPublicId !== newAvatarPublicId
  ) {
    try {
      await deleteFromCloudinary(previousAvatarPublicId);
    } catch (error) {
      // A cleanup failure must not invalidate a successful profile update
      logger.error("Failed to delete the previous buyer avatar", {
        userId: String(userId),
        publicId: previousAvatarPublicId,
        error,
      });
    }
  }
};

/**
 * Service for delete buyer profile
 * @param userId - Buyer user ID
 * @returns {Promise<void>}
 */
export const deleteBuyerProfile = async (id: string): Promise<void> => {
  const session = await mongoose.startSession();
  let avatarPublicId: string | undefined;

  try {
    await session.withTransaction(async () => {
      // Find the associated user and buyer profile.
      const user = await User.findById(id).session(session).exec();

      if (!user) {
        logger.warn(API_MESSAGES.USER_NOT_FOUND, { id });

        throw new AppError(
          StatusCodes.NOT_FOUND,
          ERROR_CODE.USER_NOT_FOUND,
          API_MESSAGES.USER_NOT_FOUND,
        );
      }

      const buyer = await Buyer.findOne({ user: id }).session(session).exec();

      if (!buyer) {
        logger.warn(API_MESSAGES.BUYER_PROFILE_NOT_FOUND, { id });

        throw new AppError(
          StatusCodes.NOT_FOUND,
          ERROR_CODE.BUYER_PROFILE_NOT_FOUND,
          API_MESSAGES.BUYER_PROFILE_NOT_FOUND,
        );
      }

      // Keep the avatar ID for cleanup after the transaction.
      avatarPublicId = buyer.avatar?.publicId;

      // Delete both documents sequentially within the transaction.
      await User.deleteOne({ _id: id }, { session }).exec();
      await Buyer.deleteOne({ _id: buyer._id }, { session }).exec();
    });
  } finally {
    // Always release the database session.
    await session.endSession();
  }

  // Clean up the avatar only after the database transaction succeeds.
  if (avatarPublicId) {
    try {
      await deleteFromCloudinary(avatarPublicId);
    } catch (error) {
      logger.error("Failed to delete buyer avatar from Cloudinary", {
        id,
        publicId: avatarPublicId,
        error,
      });
    }
  }
};

/**
 * Buyer Service Instance
 */
const buyerService = {
  getCurrentBuyerProfile,
  getAllBuyerProfile,
  updateBuyerProfile,
  deleteBuyerProfile,
};

/**
 * Export default buyerService
 */
export default buyerService;
