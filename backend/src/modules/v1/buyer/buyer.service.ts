import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import emailService from "@/modules/v1/auth/email/email.service";
import { revokeRefreshToken } from "@/modules/v1/auth/redis/redis.service";
import {
  AccountStatus,
  UserRole,
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
  let buyer = await Buyer.findOne({ buyer: userId })
    .populate("buyer", "name email role status createdAt")
    .exec();

  if (!buyer) {
    const user = await User.findById(userId).exec();
    if (user && user.role === UserRole.BUYER) {
      buyer = await Buyer.findOneAndUpdate(
        { buyer: userId },
        {
          $setOnInsert: {
            buyer: userId,
            phoneNumber: "",
            address: "",
            profile: {
              publicId: "",
              url: "",
              width: null,
              height: null,
            },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
        .populate("buyer", "name email role status createdAt")
        .exec();
    }
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

const updateOwnProfile = async (
  userId: string,
  payload: IUpdateBuyerProfileInput,
  file?: Express.Multer.File,
): Promise<IBuyer> => {
  let existingBuyer = await Buyer.findOne({ buyer: userId }).exec();
  if (!existingBuyer) {
    const user = await User.findById(userId).exec();
    if (user && user.role === UserRole.BUYER) {
      existingBuyer = await Buyer.create({
        buyer: userId,
        phoneNumber: "",
        address: "",
        profile: {
          publicId: "",
          url: "",
          width: null,
          height: null,
        },
      });
    } else {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        BUYER_MESSAGES.BUYER_NOT_FOUND,
      );
    }
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

  // 1.5. Update User's name if provided
  if (payload.name) {
    await User.findByIdAndUpdate(userId, { name: payload.name.trim() }).exec();
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

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  // Soft-delete / deactivate User to preserve order, payment, and review history
  await User.findByIdAndUpdate(userId, { status: AccountStatus.BLOCKED });

  // Revoke active sessions in Redis
  await revokeRefreshToken(userId);

  return { message: BUYER_MESSAGES.PROFILE_DELETED };
};

const getAllBuyers = async (
  options: IBuyerQueryOptions,
): Promise<{
  data: IBuyer[];
  pagination: {
    page: number;
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

  // Build match criteria to securely enforce Buyer role and optional status/gender filters
  const matchCriteria: Record<string, any> = {
    "buyer.role": UserRole.BUYER,
  };

  if (options.status) {
    matchCriteria["buyer.status"] = options.status;
  }

  if (options.gender) {
    matchCriteria.gender = options.gender;
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "buyer",
      },
    },
    { $unwind: "$buyer" },
    { $match: matchCriteria },
  ];

  if (options.search && options.search.trim()) {
    const searchRegex = new RegExp(escapeRegex(options.search.trim()), "i");
    pipeline.push({
      $match: {
        $or: [
          { "buyer.name": searchRegex },
          { "buyer.email": searchRegex },
          { phoneNumber: searchRegex },
          { address: searchRegex },
        ],
      },
    });
  }

  pipeline.push({
    $project: {
      "buyer.password": 0,
    },
  });

  const [aggregateResult] = await Buyer.aggregate([
    ...pipeline,
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const buyers = aggregateResult?.data || [];
  const total = aggregateResult?.totalCount?.[0]?.count || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: buyers,
    pagination: {
      page,
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

  const buyerUser = (updatedBuyer as any)?.buyer as
    | { name?: string; email?: string }
    | undefined;
  if (buyerUser?.email) {
    emailService
      .sendAccountStatusEmail({
        to: buyerUser.email,
        name: buyerUser.name || "Customer",
        role: "BUYER",
        status: newStatus,
      })
      .catch(() => {});
  }

  return updatedBuyer!;
};

const deleteBuyer = async (buyerId: string): Promise<IBuyer> => {
  return await updateBuyerStatus(buyerId, AccountStatus.BLOCKED);
};

const getBuyerStatistics = async () => {
  const [totalBuyers, active, blocked] = await Promise.all([
    User.countDocuments({ role: UserRole.BUYER }),
    User.countDocuments({ role: UserRole.BUYER, status: AccountStatus.ACTIVE }),
    User.countDocuments({ role: UserRole.BUYER, status: AccountStatus.BLOCKED }),
  ]);

  return {
    totalBuyers,
    active,
    blocked,
  };
};

const buyerService = {
  getOwnProfile,
  updateOwnProfile,
  deleteOwnAccount,
  getAllBuyers,
  getBuyerById,
  updateBuyerStatus,
  deleteBuyer,
  getBuyerStatistics,
};

export default buyerService;
