import cloudinaryService from "@/lib/cloudinary";
import { logger } from "@/lib/winston";
import User from "@/modules/v1/user/user.model";
import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import { status } from "http-status";
import mongoose, { type ClientSession, type Types } from "mongoose";
import {
  VENDOR_MESSAGES,
  VendorStatus,
  type TVendorStatus,
} from "@/modules/v1/vendor/vendor.constant";
import type {
  IUpdateVendorProfileInput,
  IVendor,
  IVendorImage,
  IVendorQueryOptions,
} from "@/modules/v1/vendor/vendor.interface";
import Vendor from "@/modules/v1/vendor/vendor.model";

const createVendorProfile = async (
  userId: Types.ObjectId | string,
  session?: ClientSession,
): Promise<IVendor> => {
  const existing = await Vendor.findOne({ vendor: userId }).session(
    session || null,
  );
  if (existing) {
    return existing;
  }

  const [vendor] = await Vendor.create(
    [
      {
        vendor: userId,
      },
    ],
    { ...(session && { session }) },
  );

  return vendor;
};

const getOwnProfile = async (userId: string): Promise<IVendor> => {
  const vendor = await Vendor.findOne({ vendor: userId })
    .populate("vendor", "name email role status createdAt")
    .exec();

  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      VENDOR_MESSAGES.VENDOR_NOT_FOUND,
    );
  }

  return vendor;
};

const updateOwnProfile = async (
  userId: string,
  payload: IUpdateVendorProfileInput,
  files?: {
    profile?: Express.Multer.File[];
    nidFrontImage?: Express.Multer.File[];
    nidBackImage?: Express.Multer.File[];
  },
): Promise<IVendor> => {
  const existingVendor = await Vendor.findOne({ vendor: userId }).exec();
  if (!existingVendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      VENDOR_MESSAGES.VENDOR_NOT_FOUND,
    );
  }

  // Check licenceNumber uniqueness if vendor is updating licenceNumber
  if (
    payload.licenceNumber &&
    payload.licenceNumber !== existingVendor.licenceNumber
  ) {
    const conflict = await Vendor.findOne({
      licenceNumber: payload.licenceNumber,
      vendor: { $ne: userId },
    }).exec();

    if (conflict) {
      throw new AppError(
        status.CONFLICT,
        ERROR_CODE.CONFLICT,
        VENDOR_MESSAGES.LICENCE_ALREADY_EXISTS,
      );
    }
  }

  const oldProfilePublicId = existingVendor.profile?.publicId;
  const oldNidFrontPublicId = existingVendor.nidFrontImage?.publicId;
  const oldNidBackPublicId = existingVendor.nidBackImage?.publicId;

  const newUploadedPublicIds: string[] = [];

  let newProfileData: IVendorImage | undefined;
  let newNidFrontData: IVendorImage | undefined;
  let newNidBackData: IVendorImage | undefined;

  // 1. Upload images outside MongoDB transaction
  if (files?.profile?.[0]) {
    const uploadRes = await cloudinaryService.uploadImage(
      files.profile[0].buffer,
      "jus-buy/vendors/profiles",
    );
    newProfileData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
    newUploadedPublicIds.push(uploadRes.publicId);
  }

  if (files?.nidFrontImage?.[0]) {
    const uploadRes = await cloudinaryService.uploadImage(
      files.nidFrontImage[0].buffer,
      "jus-buy/vendors/nid",
    );
    newNidFrontData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
    newUploadedPublicIds.push(uploadRes.publicId);
  }

  if (files?.nidBackImage?.[0]) {
    const uploadRes = await cloudinaryService.uploadImage(
      files.nidBackImage[0].buffer,
      "jus-buy/vendors/nid",
    );
    newNidBackData = {
      publicId: uploadRes.publicId,
      url: uploadRes.url,
      width: uploadRes.width,
      height: uploadRes.height,
    };
    newUploadedPublicIds.push(uploadRes.publicId);
  }

  // 2. Update Vendor profile in database
  try {
    const updateFields: Record<string, any> = {};

    if (payload.shopName !== undefined) {
      updateFields.shopName = payload.shopName;
    }
    if (payload.location !== undefined) {
      updateFields.location = payload.location;
    }
    if (payload.licenceNumber !== undefined) {
      updateFields.licenceNumber = payload.licenceNumber;
    }
    if (newProfileData) {
      updateFields.profile = newProfileData;
    }
    if (newNidFrontData) {
      updateFields.nidFrontImage = newNidFrontData;
    }
    if (newNidBackData) {
      updateFields.nidBackImage = newNidBackData;
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { vendor: userId },
      { $set: updateFields },
      { new: true, runValidators: true },
    )
      .populate("vendor", "name email role status createdAt")
      .exec();

    if (!updatedVendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        VENDOR_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    // 3. Cleanup old images from Cloudinary after successful DB update
    if (newProfileData && oldProfilePublicId) {
      cloudinaryService.deleteImage(oldProfilePublicId).catch((err) => {
        logger.error("Failed to delete old vendor profile image:", err);
      });
    }

    if (newNidFrontData && oldNidFrontPublicId) {
      cloudinaryService.deleteImage(oldNidFrontPublicId).catch((err) => {
        logger.error("Failed to delete old vendor nidFrontImage:", err);
      });
    }

    if (newNidBackData && oldNidBackPublicId) {
      cloudinaryService.deleteImage(oldNidBackPublicId).catch((err) => {
        logger.error("Failed to delete old vendor nidBackImage:", err);
      });
    }

    return updatedVendor;
  } catch (error) {
    // 4. If database update fails, delete newly uploaded images from Cloudinary
    for (const publicId of newUploadedPublicIds) {
      cloudinaryService.deleteImage(publicId).catch((err) => {
        logger.error(
          "Failed to delete newly uploaded image on database failure:",
          err,
        );
      });
    }

    throw error;
  }
};

const getAllVendors = async (
  options: IVendorQueryOptions,
): Promise<{
  data: IVendor[];
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

  const filter: Record<string, any> = {};

  filter.status = options.status || VendorStatus.APPROVED;

  if (options.search) {
    const searchRegex = new RegExp(options.search, "i");
    const matchedUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).select("_id");

    const matchedUserIds = matchedUsers.map((u) => u._id);

    filter.$or = [
      { vendor: { $in: matchedUserIds } },
      { shopName: searchRegex },
      { location: searchRegex },
      { licenceNumber: searchRegex },
    ];
  }

  const [vendors, total] = await Promise.all([
    Vendor.find(filter)
      .populate("vendor", "name email role status createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec(),
    Vendor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: vendors,
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

const getVendorById = async (vendorId: string): Promise<IVendor> => {
  let vendor: IVendor | null = null;

  if (mongoose.Types.ObjectId.isValid(vendorId)) {
    vendor = await Vendor.findOne({
      $or: [{ _id: vendorId }, { vendor: vendorId }],
    })
      .populate("vendor", "name email role status createdAt")
      .exec();
  }

  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      VENDOR_MESSAGES.VENDOR_NOT_FOUND,
    );
  }

  return vendor;
};

const updateVendorStatus = async (
  vendorId: string,
  newStatus: TVendorStatus,
  adminUserId: string,
): Promise<IVendor> => {
  const vendor = await Vendor.findOne({
    $or: [{ _id: vendorId }, { vendor: vendorId }],
  }).exec();

  if (!vendor) {
    throw new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      VENDOR_MESSAGES.VENDOR_NOT_FOUND,
    );
  }

  // Vendor cannot update their own status (if admin is also the owner of this vendor profile)
  if (vendor.vendor.toString() === adminUserId) {
    throw new AppError(
      status.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      VENDOR_MESSAGES.CANNOT_UPDATE_OWN_STATUS,
    );
  }

  // Do not send an update when the status is unchanged
  if (vendor.status === newStatus) {
    const currentVendor = await Vendor.findById(vendor._id)
      .populate("vendor", "name email role status createdAt")
      .exec();
    return currentVendor!;
  }

  vendor.status = newStatus;
  await vendor.save();

  const updatedVendor = await Vendor.findById(vendor._id)
    .populate("vendor", "name email role status createdAt")
    .exec();

  return updatedVendor!;
};

const vendorService = {
  createVendorProfile,
  getOwnProfile,
  updateOwnProfile,
  getAllVendors,
  getVendorById,
  updateVendorStatus,
};

export default vendorService;

