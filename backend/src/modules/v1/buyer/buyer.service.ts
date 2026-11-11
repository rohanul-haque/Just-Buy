import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import { revokeRefreshToken } from "@/modules/v1/auth/redis/redis.service";
import {
  AccountStatus,
  type TAccountStatus,
} from "@/modules/v1/user/user.constant";
import User from "@/modules/v1/user/user.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import { status } from "http-status";
import mongoose from "mongoose";
import { BUYER_MESSAGES } from "@/modules/v1/buyer/buyer.constant";
import type {
  IBuyer,
  IBuyerQueryOptions,
  IUpdateBuyerProfileInput,
} from "@/modules/v1/buyer/buyer.interface";
import Buyer from "@/modules/v1/buyer/buyer.model";

const getOwnProfile = async (userId: string): Promise<IBuyer> => {
  console.log("userId",userId);
  const buyer = await Buyer.findOne({ buyer: userId })
  .populate("buyer", "name email role status createdAt")
  .exec();
  console.log("buyer",buyer);
  if (!buyer) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      BUYER_MESSAGES.BUYER_NOT_FOUND,
    );
  }

  return buyer;
};

const updateOwnProfile = async (
  userId: string,
  payload: IUpdateBuyerProfileInput,
  file?: Express.Multer.File,
): Promise<IBuyer> => {
  const existingBuyer = await Buyer.findOne({ buyer: userId }).exec();
  if (!existingBuyer) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      BUYER_MESSAGES.BUYER_NOT_FOUND,
    );
  }

  let newProfileData:
    | {
        publicId: string;
        url: string;
        width: number;
        height: number;
      }
    | undefined;

  const oldPublicId = existingBuyer.profile?.publicId;

  // 1. Upload new image to Cloudinary first if a file is provided
  if (file) {
    const uploadRes = await cloudinaryService.uploadImage(file.buffer);
    newProfileData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
  }

  // 2. Update Buyer profile in database
  try {
    const updatedBuyer = await Buyer.findOneAndUpdate(
      { buyer: userId },
      {
        $set: {
          ...(payload.phoneNumber !== undefined && {
            phoneNumber: payload.phoneNumber,
          }),
          ...(payload.gender !== undefined && { gender: payload.gender }),
          ...(payload.address !== undefined && { address: payload.address }),
          ...(newProfileData && { profile: newProfileData }),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("buyer", "name email role status createdAt")
      .exec();

    if (!updatedBuyer) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        BUYER_MESSAGES.BUYER_NOT_FOUND,
      );
    }

    // 3. After successful database update, delete old image from Cloudinary
    if (file && oldPublicId) {
      cloudinaryService.deleteImage(oldPublicId).catch((err) => {
        logger.error(
          "Failed to cleanup old profile image from Cloudinary:",
          err,
        );
      });
    }

    return updatedBuyer;
  } catch (error) {
    // 4. If database update fails, delete newly uploaded image to avoid orphaned files
    if (newProfileData?.publicId) {
      cloudinaryService.deleteImage(newProfileData.publicId).catch((err) => {
        logger.error(
          "Failed to cleanup newly uploaded image on database failure:",
          err,
        );
      });
    }

    throw error;
  }
};

const deleteOwnAccount = async (
  userId: string,
): Promise<{ message: string }> => {
  const buyer = await Buyer.findOne({ buyer: userId }).exec();
  if (!buyer) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      BUYER_MESSAGES.BUYER_NOT_FOUND,
    );
  }

  const oldPublicId = buyer.profile?.publicId;

  // 1. Run database operations in transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft-delete / deactivate User to preserve order and payment history
    await User.findByIdAndUpdate(
      userId,
      { status: AccountStatus.BLOCKED },
      { session },
    );

    // Delete or clear the Buyer profile document
    await Buyer.deleteOne({ buyer: userId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // 2. Revoke active sessions in Redis
  await revokeRefreshToken(userId);

  // 3. Delete Cloudinary profile image only after successful DB commit
  if (oldPublicId) {
    cloudinaryService.deleteImage(oldPublicId).catch((err) => {
      logger.error(
        "Failed to delete Cloudinary image on account deletion:",
        err,
      );
    });
  }

  return { message: BUYER_MESSAGES.PROFILE_DELETED };
};

const getAllBuyers = async (
  options: IBuyerQueryOptions,
): Promise<{
  data: IBuyer[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip =
    options.skip !== undefined
      ? Math.max(0, Number(options.skip))
      : (page - 1) * limit;

  const filter: Record<string, any> = {};

  if (options.gender) {
    filter.gender = options.gender;
  }

  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    // Search in user name/email or phone number/address
    const matchedUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select("_id");

    const matchedUserIds = matchedUsers.map((u) => u._id);

    filter.$or = [
      { buyer: { $in: matchedUserIds } },
      { phoneNumber: searchRegex },
      { address: searchRegex },
    ];
  }

  const [buyers, total] = await Promise.all([
    Buyer.find(filter)
      .populate("buyer", "name email role status createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    Buyer.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: buyers,
    pagination: {
      skip,
      limit,
      total,
      totalPages,
      hasNextPage: skip + limit < total,
      hasPrevPage: options.skip !== undefined ? skip > 0 : page > 1,
    },
  };
};

const getBuyerById = async (buyerId: string): Promise<IBuyer> => {
  let buyer: IBuyer | null = null;

  if (mongoose.Types.ObjectId.isValid(buyerId)) {
    buyer = await Buyer.findOne({
      $or: [{ _id: buyerId }, { buyer: buyerId }],
    })
      .populate("buyer", "name email role status createdAt")
      .exec();
  }

  if (!buyer) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      BUYER_MESSAGES.BUYER_NOT_FOUND,
    );
  }

  return buyer;
};

const updateBuyerStatus = async (
  buyerId: string,
  newStatus: TAccountStatus,
): Promise<IBuyer> => {
  const buyer = await Buyer.findOne({
    $or: [{ _id: buyerId }, { buyer: buyerId }],
  }).exec();

  if (!buyer) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      BUYER_MESSAGES.BUYER_NOT_FOUND,
    );
  }

  await User.findByIdAndUpdate(buyer.buyer, { status: newStatus });

  // If blocked, immediately revoke active sessions
  if (newStatus === AccountStatus.BLOCKED) {
    await revokeRefreshToken(buyer.buyer.toString());
  }

  const updatedBuyer = await Buyer.findById(buyer._id)
    .populate("buyer", "name email role status createdAt")
    .exec();

  return updatedBuyer!;
};

const buyerService = {
  getOwnProfile,
  updateOwnProfile,
  deleteOwnAccount,
  getAllBuyers,
  getBuyerById,
  updateBuyerStatus,
};

export default buyerService;
