/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Models
 */
import User from "@/modules/v1/auth/auth.model";
import Seller from "@/modules/v1/seller/seller.model";

/**
 * Type
 */
import type {
  IAllSellerProfile,
  ISellerId,
  ISellerProfile,
  IUpdateSellerRequest,
  SellerVerificationStatus,
} from "@/modules/v1/seller/seller.interface";

/**
 * Update seller service
 * @param userId - User ID
 * @param payload - Seller payload
 * @param file - Seller avatar
 */
export const updateSellerService = async ({
  userId,
  payload,
  file,
}: IUpdateSellerRequest): Promise<void> => {
  // Destructure the all payload
  const { fullName, password, gender, phoneNumber, shopAddress, storeName } =
    payload;

  // Find user and seller by user ID
  const [user, seller] = await Promise.all([
    User.findById(userId),
    Seller.findOne({ user: userId }),
  ]);

  // Check if user found
  if (!user) {
    // Log the warning message
    logger.warn(API_MESSAGES.USER_NOT_FOUND, { userId });

    // Throw the error
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      API_MESSAGES.USER_NOT_FOUND,
    );
  }

  // Check if seller found
  if (!seller) {
    logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, { userId });

    // Throw the error
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  // if fullName send then update the fullName
  if (fullName) {
    user.fullName = fullName.trim();
  }

  // if password send then update the password
  if (password) {
    user.password = password;
  }

  // if gender send then update the gender
  if (gender) {
    seller.gender = gender;
  }

  // if phoneNumber send then update the phoneNumber
  if (phoneNumber) {
    seller.phoneNumber = phoneNumber;
  }

  // if shopAddress send then update the shopAddress
  if (shopAddress) {
    seller.shopAddress = shopAddress;
  }

  // if storeName send then update the storeName
  if (storeName) {
    seller.storeName = storeName;
  }

  // if file send then update the avatar
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ERROR_CODE.FILE_TOO_LARGE,
        API_MESSAGES.FILE_TOO_LARGE,
      );
    }

    // Delete old avatar from cloudinary
    if (seller.avatar?.publicId) {
      await deleteFromCloudinary(seller.avatar.publicId);
    }

    // Upload to cloudinary
    const cloudinaryData = await uploadToCloudinary(
      file.buffer,
      "Just-Buy-API",
    );

    // Save the cloudinary data
    seller.avatar = {
      publicId: cloudinaryData.public_id,
      url: cloudinaryData.secure_url,
      height: cloudinaryData.height,
      width: cloudinaryData.width,
    };
  }

  // Save the user and doctor
  await Promise.all([user.save(), seller.save()]);
};

/**
 * Get Current Seller Profile service
 * @param userId - User ID
 * @returns Promise<ISellerProfile>
 */
export const getCurrentSellerProfileService = async ({
  userId,
}: ISellerId): Promise<ISellerProfile> => {
  // Find seller by user ID
  const seller = await Seller.findOne({
    user: userId,
  })
    .populate("user", "fullName email role isActive")
    .lean()
    .exec();

  // Check if seller found
  if (!seller) {
    // Log the warning message
    logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, {
      userId,
    });

    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  return seller;
};

/**
 * Delete Seller Profile service
 * @param userId - User ID
 */
export const deleteControllerSellerService = async ({
  userId,
}: ISellerId): Promise<void> => {
  // Find user and seller by user ID
  const [user, seller] = await Promise.all([
    User.findById(userId).lean().exec(),
    Seller.findOne({ user: userId }).lean().exec(),
  ]);

  // Check if user found
  if (!user) {
    // Log the warning message
    logger.warn(API_MESSAGES.USER_NOT_FOUND, { userId });

    // Throw the error
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.USER_NOT_FOUND,
      API_MESSAGES.USER_NOT_FOUND,
    );
  }

  // Check if seller found
  if (!seller) {
    logger.warn(API_MESSAGES.SELLER_PROFILE_NOT_FOUND, { userId });

    // Throw the error
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.SELLER_PROFILE_NOT_FOUND,
      API_MESSAGES.SELLER_PROFILE_NOT_FOUND,
    );
  }

  // Delete user and seller
  await Promise.all([user.deleteOne(), seller.deleteOne()]);
};

/**
 * Get All Seller Profiles service
 * @param limit - Limit
 * @param offset - Offset
 * @param verificationStatus - Verification status
 */
export const getAllSellerProfileService = async ({
  limit,
  offset,
  verificationStatus,
}: {
  limit: number;
  offset: number;
  verificationStatus?: SellerVerificationStatus;
}): Promise<IAllSellerProfile> => {
  // Create filter for seller profiles
  const filter: { verificationStatus?: SellerVerificationStatus } = {};

  // Add verification status to filter if provided
  if (verificationStatus) {
    filter.verificationStatus = verificationStatus;
  }

  // Get all seller profiles with count
  const [totalSellers, allSellers] = await Promise.all([
    Seller.countDocuments(filter).exec(),
    Seller.find(filter)
      .populate("user", "fullName email role isActive")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
  ]);

  return {
    total: totalSellers,
    limit: allSellers.length,
    skip: offset,
    allSellers,
  };
};
