/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Thired Party Modules
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
 * Models
 */
import User from "@/modules/v1/auth/auth.model";
import Seller from "@/modules/v1/seller/seller.model";

/**
 * Type
 */
import type {
  GetAllSellerProfilesParams,
  IAllSellerProfile,
  IChangeSellerStatusPaylod,
  ISellerProfile,
  IUpdateSellerRequest,
} from "@/modules/v1/seller/seller.interface";

/**
 * Service for getting current seller profile
 * @param id - User ID
 * @returns {Promise<ISellerProfile>}
 */
export const getCurrentSellerProfile = async (
  id: string,
): Promise<ISellerProfile> => {
  // Find the seller profile associated with the authenticated user.
  const seller = await Seller.findOne({ user: id })
    .populate("user", "fullName email role")
    .lean()
    .exec();

  // Throw an error if the seller profile does not exist.
  if (!seller) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  // Return seller profile
  return seller;
};

/**
 * Service for getting all seller profiles
 * @param limit - Limit
 * @param offset - Offset
 * @param verificationStatus - Verification status
 */
export const getAllSellerProfileService = async ({
  limit,
  offset,
  verificationStatus,
}: GetAllSellerProfilesParams): Promise<IAllSellerProfile> => {
  // Filter seller profiles by verification status.
  const filter = { verificationStatus };

  // Fetch the total count and current page concurrently.
  const [total, allSellers] = await Promise.all([
    Seller.countDocuments(filter).exec(),
    Seller.find(filter)
      .populate("user", "fullName email role isActive")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  // Calculate pagination metadata.
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + allSellers.length < total;
  const hasPrevPage = offset > 0 && total > 0;

  // Return all seller profiles
  return {
    allSellers,
    total,
    limit,
    skip: offset,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Service for updating seller profile
 * @param userId - User ID
 * @param payload - Seller payload
 * @param file - Seller avatar
 */
export const updateSeller = async ({
  userId,
  payload,
  file,
}: IUpdateSellerRequest): Promise<void> => {
  const { fullName, password, gender, phoneNumber, shopAddress, storeName } =
    payload;

  // Validate uploaded avatar.
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

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        ERROR_CODE.INVALID_FILE_TYPE,
        "Only JPG, PNG, and WebP images are allowed",
      );
    }
  }

  // Load the existing user and seller profile.
  const [user, seller] = await Promise.all([
    User.findById(userId),
    Seller.findOne({ user: userId }),
  ]);

  // Ensure the user exists.
  if (!user) {
    logger.warn(API_MESSAGES.USER_NOT_FOUND, {
      userId: String(userId),
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      API_MESSAGES.USER_NOT_FOUND,
    );
  }

  // Ensure the seller profile exists.
  if (!seller) {
    logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, {
      userId: String(userId),
    });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  // Keep the previous avatar until the update succeeds.
  const previousAvatarPublicId = seller.avatar?.publicId;
  let newAvatarPublicId: string | undefined;

  try {
    // Upload the new avatar before modifying the database.
    if (file) {
      const cloudinaryData = await uploadToCloudinary(
        file.buffer,
        "Just-Buy-API",
      );

      newAvatarPublicId = cloudinaryData.public_id;

      // Assign the new avatar metadata.
      seller.avatar = {
        publicId: cloudinaryData.public_id,
        url: cloudinaryData.secure_url,
        height: cloudinaryData.height,
        width: cloudinaryData.width,
      };
    }

    // Update only the fields provided by the client.
    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (password !== undefined) {
      user.password = password;
    }

    if (gender !== undefined) {
      seller.gender = gender;
    }

    if (phoneNumber !== undefined) {
      seller.phoneNumber = phoneNumber.trim();
    }

    if (shopAddress !== undefined) {
      seller.shopAddress = shopAddress.trim();
    }

    if (storeName !== undefined) {
      seller.storeName = storeName.trim();
    }

    // Persist both documents in one database transaction.
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await user.save({ session });
        await seller.save({ session });
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    // Clean up the new avatar if the database update fails.
    if (newAvatarPublicId) {
      try {
        await deleteFromCloudinary(newAvatarPublicId);
      } catch (cleanupError) {
        logger.error("Failed to clean up the newly uploaded seller avatar", {
          userId: String(userId),
          publicId: newAvatarPublicId,
          error: cleanupError,
        });
      }
    }

    throw error;
  }

  // Delete the previous avatar only after the database update succeeds.
  if (
    file &&
    previousAvatarPublicId &&
    previousAvatarPublicId !== newAvatarPublicId
  ) {
    try {
      await deleteFromCloudinary(previousAvatarPublicId);
    } catch (error) {
      logger.error("Failed to delete the previous seller avatar", {
        userId: String(userId),
        publicId: previousAvatarPublicId,
        error,
      });
    }
  }
};

/**
 * Service for deleting seller profile
 * @param userId - User ID
 */
export const deleteSeller = async (id: string): Promise<void> => {
  // Start database transaction
  const session = await mongoose.startSession();
  let avatarPublicId: string | undefined;

  try {
    await session.withTransaction(async () => {
      // Find the associated user.
      const user = await User.findById(id).session(session).exec();

      // Check if user exists
      if (!user) {
        logger.warn(API_MESSAGES.USER_NOT_FOUND, { id });

        throw new AppError(
          StatusCodes.NOT_FOUND,
          ERROR_CODE.USER_NOT_FOUND,
          API_MESSAGES.USER_NOT_FOUND,
        );
      }

      // Find the associated seller profile.
      const seller = await Seller.findOne({ user: id }).session(session).exec();

      if (!seller) {
        logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, { id });

        throw new AppError(
          StatusCodes.NOT_FOUND,
          ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
          API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
        );
      }

      // Keep the avatar ID for cleanup after the transaction.
      avatarPublicId = seller.avatar?.publicId;

      // Delete both documents sequentially within the transaction.
      await User.deleteOne({ _id: id }, { session }).exec();

      await Seller.deleteOne({ _id: seller._id }, { session }).exec();
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
      logger.error("Failed to delete seller avatar from Cloudinary", {
        id,
        publicId: avatarPublicId,
        error,
      });
    }
  }
};

/**
 * Service for changing seller status
 * @param id - User ID
 * @param status - Seller verification status
 */
export const changeSellerStatus = async ({
  id,
  status,
}: IChangeSellerStatusPaylod): Promise<void> => {
  // Find the associated seller profile.
  const seller = await Seller.findById(id).exec();

  // Check if seller profile exists
  if (!seller) {
    logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, { id });

    throw new AppError(
      StatusCodes.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  // Update seller verification status
  seller.verificationStatus = status;

  // Save seller profile
  await seller.save();
};

/**
 * Seller service instance
 */
const sellerService = {
  getCurrentSellerProfile,
  getAllSellerProfileService,
  updateSeller,
  deleteSeller,
  changeSellerStatus,
};

/**
 * Export default sellerService
 */
export default sellerService;
