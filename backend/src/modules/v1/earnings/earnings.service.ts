import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import Buyer from "@/modules/v1/buyer/buyer.model";
import { OrderStatus, OrderType } from "@/modules/v1/order/order.constant";
import Order from "@/modules/v1/order/order.model";
import User from "@/modules/v1/user/user.model";
import Vendor from "@/modules/v1/vendor/vendor.model";
import {
  ADMIN_COMMISSION_RATE,
  EARNINGS_MESSAGES,
} from "./earnings.constant";
import type {
  IEarningsItemDetail,
  IEarningsQueryOptions,
  IEarningsSummary,
  IEarningsTransaction,
  IEarningsTransactionDetails,
  IPaginatedEarningsResult,
  IPaginatedVendorEarningsResult,
  IVendorEarningsSummary,
  IVendorEarningsTransaction,
  IVendorEarningsTransactionDetails,
} from "./earnings.interface";
import mongoose from "mongoose";
import { status } from "http-status";

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const earningsService = {
  getEarningsSummary: async (): Promise<IEarningsSummary> => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const result = await Order.aggregate([
      {
        $match: {
          status: OrderStatus.DELIVERED,
        },
      },
      {
        $project: {
          deliveryDate: { $ifNull: ["$deliveredAt", "$updatedAt"] },
          orderAdminCommission: {
            $sum: "$productItems.adminCommission",
          },
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$orderAdminCommission" },
          todayIncome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$deliveryDate", startOfToday] },
                    { $lte: ["$deliveryDate", endOfToday] },
                  ],
                },
                "$orderAdminCommission",
                0,
              ],
            },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        todayIncome: 0,
        totalIncome: 0,
      };
    }

    return {
      todayIncome: Number(Number(result[0].todayIncome || 0).toFixed(2)),
      totalIncome: Number(Number(result[0].totalIncome || 0).toFixed(2)),
    };
  },

  getEarningsTransactions: async (
    options: IEarningsQueryOptions,
  ): Promise<IPaginatedEarningsResult> => {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip =
      options.skip !== undefined
        ? Math.max(0, Number(options.skip))
        : (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (options.search && options.search.trim()) {
      const sanitized = options.search.trim();
      const searchRegex = new RegExp(escapeRegex(sanitized), "i");

      const matchedBuyers = await User.find({
        name: searchRegex,
      }).select("_id");
      const matchedBuyerIds = matchedBuyers.map((b) => b._id);

      filter.$or = [
        { transactionNumber: searchRegex },
        { buyer: { $in: matchedBuyerIds } },
        { "shippingAddress.fullName": searchRegex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("buyer", "name email phoneNumber")
        .populate("payment", "stripePaymentIntentId paymentMethod status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments(filter),
    ]);

    const data: IEarningsTransaction[] = orders.map((order) => {
      const items = order.productItems || [];
      const amount = Number(
        items
          .reduce((sum, it) => sum + (Number(it.itemSubtotal) || 0), 0)
          .toFixed(2),
      );

      const isDelivered = order.status === OrderStatus.DELIVERED;

      // Only Delivered orders contribute to recognized Admin earnings
      const commission = isDelivered
        ? Number(
            items
              .reduce((sum, it) => sum + (Number(it.adminCommission) || 0), 0)
              .toFixed(2),
          )
        : 0;

      const date = isDelivered
        ? order.deliveredAt || order.updatedAt
        : order.createdAt;

      const buyerName =
        (order.buyer as any)?.name ||
        order.shippingAddress?.fullName ||
        "Customer";
      const transactionId =
        order.transactionNumber ||
        (order.payment as any)?.stripePaymentIntentId ||
        order._id.toString();

      return {
        _id: order._id.toString(),
        orderId: order._id.toString(),
        transactionId,
        buyerName,
        amount,
        commission,
        date,
        status: order.status,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages,
        hasPrevPage: options.skip !== undefined ? skip > 0 : page > 1,
        hasNextPage: skip + limit < total,
      },
    };
  },

  getEarningsTransactionDetails: async (
    orderId: string,
  ): Promise<IEarningsTransactionDetails> => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.ORDER_NOT_FOUND,
      );
    }

    const order = await Order.findById(orderId)
      .populate("buyer", "name email phoneNumber")
      .populate("payment", "paymentMethod provider status amount paidAt stripePaymentIntentId")
      .populate({
        path: "vendor",
        select: "location vendor",
        populate: { path: "vendor", select: "name" },
      })
      .populate({
        path: "productItems.vendor",
        select: "location vendor",
        populate: { path: "vendor", select: "name" },
      })
      .exec();

    if (!order) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.ORDER_NOT_FOUND,
      );
    }

    const transactionId =
      order.transactionNumber ||
      (order.payment as any)?.stripePaymentIntentId ||
      order._id.toString();

    const items: IEarningsItemDetail[] = (order.productItems || []).map(
      (item) => {
        const itemSubtotal = Number(Number(item.itemSubtotal || 0).toFixed(2));
        const commRate = Number(item.commissionRate) || ADMIN_COMMISSION_RATE;
        const adminComm =
          item.adminCommission !== undefined && item.adminCommission !== null
            ? Number(Number(item.adminCommission).toFixed(2))
            : Number(((itemSubtotal * commRate) / 100).toFixed(2));
        const vendorCommRate = 100 - commRate;
        const vendorEarn =
          item.vendorEarning !== undefined && item.vendorEarning !== null
            ? Number(Number(item.vendorEarning).toFixed(2))
            : Number((itemSubtotal - adminComm).toFixed(2));

        return {
          productId: item.product ? item.product.toString() : "",
          productName: item.name,
          productImage: item.image || "",
          vendorName:
            (item.vendor as any)?.vendor?.name ||
            (order.vendor as any)?.vendor?.name ||
            (item.vendor as any)?.shopName ||
            (order.vendor as any)?.shopName ||
            "Vendor",
          brand: item.brand || "N/A",
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Number(item.quantity) || 1,
          size: item.size,
          subtotal: itemSubtotal,
          commissionRate: commRate,
          adminCommission: adminComm,
          vendorCommissionRate: vendorCommRate,
          vendorEarnings: vendorEarn,
        };
      },
    );

    const totalProductAmount = Number(
      items.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2),
    );
    const totalAdminCommission = Number(
      items.reduce((sum, it) => sum + it.adminCommission, 0).toFixed(2),
    );
    const totalVendorEarnings = Number(
      items.reduce((sum, it) => sum + it.vendorEarnings, 0).toFixed(2),
    );
    const shippingCharge = Number(Number(order.shippingCharge || 0).toFixed(2));
    const discount = 0;
    const finalOrderTotal = Number(Number(order.totalAmount || 0).toFixed(2));

    const buyerName =
      (order.buyer as any)?.name ||
      order.shippingAddress?.fullName ||
      "Customer";
    const buyerEmail = (order.buyer as any)?.email || "N/A";
    const buyerPhone =
      order.shippingAddress?.phoneNumber ||
      (order.buyer as any)?.phoneNumber ||
      "N/A";
    const address = `${order.shippingAddress?.address || ""}, ${
      order.shippingAddress?.city || ""
    } - ${order.shippingAddress?.postalCode || ""}, ${
      order.shippingAddress?.country || "Bangladesh"
    }`;

    const paymentStatus =
      (order.payment as any)?.status ||
      (order.orderType === OrderType.COD ? "PAID" : "PENDING");
    const paymentMethod =
      (order.payment as any)?.paymentMethod || order.orderType || "COD";

    return {
      transaction: {
        orderId: order._id.toString(),
        transactionId,
        orderStatus: order.status,
        paymentStatus,
        paymentMethod,
        orderDate: order.createdAt,
        deliveredDate:
          order.status === OrderStatus.DELIVERED
            ? order.deliveredAt || order.updatedAt
            : null,
      },
      buyer: {
        name: buyerName,
        email: buyerEmail,
        phoneNumber: buyerPhone,
        address,
      },
      items,
      summary: {
        totalProductAmount,
        totalAdminCommission,
        totalVendorEarnings,
        shippingCharge,
        discount,
        finalOrderTotal,
      },
    };
  },

  getVendorEarningsSummary: async (
    vendorUserId: string,
  ): Promise<IVendorEarningsSummary> => {
    const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const result = await Order.aggregate([
      {
        $match: {
          vendor: vendor._id,
          status: OrderStatus.DELIVERED,
        },
      },
      {
        $project: {
          deliveryDate: { $ifNull: ["$deliveredAt", "$updatedAt"] },
          vendorItems: {
            $filter: {
              input: "$productItems",
              as: "item",
              cond: { $eq: ["$$item.vendor", vendor._id] },
            },
          },
        },
      },
      {
        $project: {
          deliveryDate: 1,
          orderVendorEarnings: {
            $sum: "$vendorItems.vendorEarning",
          },
        },
      },
      {
        $group: {
          _id: null,
          allTimeEarnings: { $sum: "$orderVendorEarnings" },
          todayEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$deliveryDate", startOfToday] },
                    { $lte: ["$deliveryDate", endOfToday] },
                  ],
                },
                "$orderVendorEarnings",
                0,
              ],
            },
          },
          monthlyEarnings: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$deliveryDate", startOfMonth] },
                    { $lte: ["$deliveryDate", endOfMonth] },
                  ],
                },
                "$orderVendorEarnings",
                0,
              ],
            },
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        todayEarnings: 0,
        monthlyEarnings: 0,
        allTimeEarnings: 0,
      };
    }

    return {
      todayEarnings: Number(Number(result[0].todayEarnings || 0).toFixed(2)),
      monthlyEarnings: Number(
        Number(result[0].monthlyEarnings || 0).toFixed(2),
      ),
      allTimeEarnings: Number(
        Number(result[0].allTimeEarnings || 0).toFixed(2),
      ),
    };
  },

  getVendorEarningsTransactions: async (
    vendorUserId: string,
    options: IEarningsQueryOptions,
  ): Promise<IPaginatedVendorEarningsResult> => {
    const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip =
      options.skip !== undefined
        ? Math.max(0, Number(options.skip))
        : (page - 1) * limit;

    const filter: Record<string, any> = { vendor: vendor._id };

    if (options.status && options.status !== "ALL") {
      filter.status = options.status;
    }

    if (options.search && options.search.trim()) {
      const sanitized = options.search.trim();
      const searchRegex = new RegExp(escapeRegex(sanitized), "i");

      const matchedBuyers = await User.find({
        name: searchRegex,
      }).select("_id");
      const matchedBuyerIds = matchedBuyers.map((b) => b._id);

      filter.$and = [
        {
          $or: [
            { transactionNumber: searchRegex },
            { buyer: { $in: matchedBuyerIds } },
            { "shippingAddress.fullName": searchRegex },
          ],
        },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("buyer", "name email phoneNumber")
        .populate("payment", "stripePaymentIntentId paymentMethod status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments(filter),
    ]);

    const buyerUserIds = orders
      .map((o) => (o.buyer as any)?._id || o.buyer)
      .filter(Boolean);

    const buyerProfiles = await Buyer.find({ buyer: { $in: buyerUserIds } })
      .select("buyer profile")
      .lean();

    const buyerImageMap = new Map<string, string>();
    buyerProfiles.forEach((bp) => {
      if (bp.profile?.url) {
        buyerImageMap.set(bp.buyer.toString(), bp.profile.url);
      }
    });

    const data: IVendorEarningsTransaction[] = orders.map((order) => {
      const vendorItems = (order.productItems || []).filter(
        (item) =>
          item.vendor?.toString() === vendor._id.toString() ||
          (item.vendor as any)?._id?.toString() === vendor._id.toString(),
      );

      const amount = Number(
        vendorItems
          .reduce((sum, it) => sum + (Number(it.itemSubtotal) || 0), 0)
          .toFixed(2),
      );

      const isDelivered = order.status === OrderStatus.DELIVERED;

      const commission = isDelivered
        ? Number(
            vendorItems
              .reduce((sum, it) => sum + (Number(it.vendorEarning) || 0), 0)
              .toFixed(2),
          )
        : 0;

      const date = isDelivered
        ? order.deliveredAt || order.updatedAt
        : order.createdAt;

      const buyerIdStr =
        (order.buyer as any)?._id?.toString() ||
        order.buyer?.toString() ||
        "";
      const buyerName =
        (order.buyer as any)?.name ||
        order.shippingAddress?.fullName ||
        "Customer";
      const buyerImage = buyerImageMap.get(buyerIdStr) || "";
      const buyerEmail = (order.buyer as any)?.email || "";

      const transactionId =
        order.transactionNumber ||
        (order.payment as any)?.stripePaymentIntentId ||
        order._id.toString();

      return {
        _id: order._id.toString(),
        orderId: order._id.toString(),
        transactionId,
        buyerName,
        buyerImage,
        buyerEmail,
        amount,
        commission,
        vendorEarnings: commission,
        date,
        status: order.status,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages,
        hasPrevPage: options.skip !== undefined ? skip > 0 : page > 1,
        hasNextPage: skip + limit < total,
      },
    };
  },

  getVendorEarningsTransactionDetails: async (
    vendorUserId: string,
    orderId: string,
  ): Promise<IVendorEarningsTransactionDetails> => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.ORDER_NOT_FOUND,
      );
    }

    const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    const order = await Order.findById(orderId)
      .populate("buyer", "name email phoneNumber")
      .populate(
        "payment",
        "paymentMethod provider status amount paidAt stripePaymentIntentId",
      )
      .populate({
        path: "vendor",
        select: "location vendor",
        populate: { path: "vendor", select: "name" },
      })
      .populate({
        path: "productItems.vendor",
        select: "location vendor",
        populate: { path: "vendor", select: "name" },
      })
      .exec();

    if (!order) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        EARNINGS_MESSAGES.ORDER_NOT_FOUND,
      );
    }

    const isOrderVendor =
      (order.vendor as any)?._id?.toString() === vendor._id.toString() ||
      order.vendor?.toString() === vendor._id.toString();

    const vendorItems = (order.productItems || []).filter(
      (item) =>
        item.vendor?.toString() === vendor._id.toString() ||
        (item.vendor as any)?._id?.toString() === vendor._id.toString(),
    );

    if (!isOrderVendor && vendorItems.length === 0) {
      throw new AppError(
        status.FORBIDDEN,
        ERROR_CODE.FORBIDDEN,
        EARNINGS_MESSAGES.FORBIDDEN_ORDER_ACCESS,
      );
    }

    const buyerUser = order.buyer as any;
    const buyerProfile = buyerUser?._id
      ? await Buyer.findOne({ buyer: buyerUser._id }).select("profile").lean()
      : null;

    const buyerImage = buyerProfile?.profile?.url || "";

    const transactionId =
      order.transactionNumber ||
      (order.payment as any)?.stripePaymentIntentId ||
      order._id.toString();

    const items: IEarningsItemDetail[] = vendorItems.map((item) => {
      const itemSubtotal = Number(Number(item.itemSubtotal || 0).toFixed(2));
      const commRate = Number(item.commissionRate) || ADMIN_COMMISSION_RATE;
      const adminComm =
        item.adminCommission !== undefined && item.adminCommission !== null
          ? Number(Number(item.adminCommission).toFixed(2))
          : Number(((itemSubtotal * commRate) / 100).toFixed(2));
      const vendorCommRate = 100 - commRate;
      const vendorEarn =
        item.vendorEarning !== undefined && item.vendorEarning !== null
          ? Number(Number(item.vendorEarning).toFixed(2))
          : Number((itemSubtotal - adminComm).toFixed(2));

      return {
        productId: item.product ? item.product.toString() : "",
        productName: item.name,
        productImage: item.image || "",
        vendorName:
          (item.vendor as any)?.vendor?.name ||
          (order.vendor as any)?.vendor?.name ||
          "Vendor",
        brand: item.brand || "N/A",
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 1,
        size: item.size,
        subtotal: itemSubtotal,
        commissionRate: commRate,
        adminCommission: adminComm,
        vendorCommissionRate: vendorCommRate,
        vendorEarnings: vendorEarn,
      };
    });

    const totalProductAmount = Number(
      items.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2),
    );
    const totalAdminCommission = Number(
      items.reduce((sum, it) => sum + it.adminCommission, 0).toFixed(2),
    );
    const totalVendorEarnings = Number(
      items.reduce((sum, it) => sum + it.vendorEarnings, 0).toFixed(2),
    );

    const buyerName =
      (order.buyer as any)?.name ||
      order.shippingAddress?.fullName ||
      "Customer";
    const buyerEmail = (order.buyer as any)?.email || "N/A";
    const buyerPhone =
      order.shippingAddress?.phoneNumber ||
      (order.buyer as any)?.phoneNumber ||
      "N/A";
    const address = `${order.shippingAddress?.address || ""}, ${
      order.shippingAddress?.city || ""
    } - ${order.shippingAddress?.postalCode || ""}, ${
      order.shippingAddress?.country || "Bangladesh"
    }`;

    const paymentStatus =
      (order.payment as any)?.status ||
      (order.orderType === OrderType.COD ? "PAID" : "PENDING");
    const paymentMethod =
      (order.payment as any)?.paymentMethod || order.orderType || "COD";

    return {
      transaction: {
        orderId: order._id.toString(),
        transactionId,
        orderStatus: order.status,
        paymentStatus,
        paymentMethod,
        orderDate: order.createdAt,
        deliveredDate:
          order.status === OrderStatus.DELIVERED
            ? order.deliveredAt || order.updatedAt
            : null,
      },
      buyer: {
        name: buyerName,
        email: buyerEmail,
        phoneNumber: buyerPhone,
        address,
        profileImage: buyerImage,
      },
      items,
      summary: {
        totalProductAmount,
        totalAdminCommission,
        totalVendorEarnings,
      },
    };
  },
};

export default earningsService;
