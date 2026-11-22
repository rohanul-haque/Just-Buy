import AppError from "@/utils/AppError";
import ERROR_CODE from "@/utils/ERROR_CODES";
import Buyer from "@/modules/v1/buyer/buyer.model";
import { OrderStatus, OrderType } from "@/modules/v1/order/order.constant";
import Order from "@/modules/v1/order/order.model";
import Product from "@/modules/v1/product/product.model";
import { AccountStatus, UserRole } from "@/modules/v1/user/user.constant";
import User from "@/modules/v1/user/user.model";
import { VendorStatus } from "@/modules/v1/vendor/vendor.constant";
import Vendor from "@/modules/v1/vendor/vendor.model";
import { DASHBOARD_MESSAGES } from "./dashboard.constant";
import type {
  IDashboardSummary,
  IMonthlyEarning,
  IOrderDistribution,
  IPaginatedRecentUsersResult,
  IPaginatedVendorRecentSalesResult,
  IRecentUser,
  IRecentUsersQueryOptions,
  IUserDetails,
  IVendorDashboardOverview,
  IVendorRecentSale,
} from "./dashboard.interface";
import { status } from "http-status";
import mongoose from "mongoose";

export const dashboardService = {
  getSummary: async (): Promise<IDashboardSummary> => {
    const [incomeResult, salesResult, totalUsers, vendorResult] =
      await Promise.all([
        // Total Income from DELIVERED orders only, summing stored admin commissions
        Order.aggregate([
          {
            $match: {
              status: OrderStatus.DELIVERED,
            },
          },
          {
            $project: {
              orderCommission: {
                $sum: "$productItems.adminCommission",
              },
            },
          },
          {
            $group: {
              _id: null,
              totalIncome: { $sum: "$orderCommission" },
            },
          },
        ]),

        // Total Sales by summing Product salesCount across products
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalSales: { $sum: { $ifNull: ["$salesCount", 0] } },
            },
          },
        ]),

        // Total Users: registered Buyer and Vendor accounts from Common User Model
        User.countDocuments({
          role: { $in: [UserRole.BUYER, UserRole.VENDOR] },
        }),

        // Total Vendors: Approved vendors matching active User accounts
        Vendor.aggregate([
          {
            $match: {
              status: VendorStatus.APPROVED,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "vendor",
              foreignField: "_id",
              as: "userDoc",
            },
          },
          {
            $unwind: "$userDoc",
          },
          {
            $match: {
              "userDoc.role": UserRole.VENDOR,
              "userDoc.status": { $ne: AccountStatus.BLOCKED },
            },
          },
          {
            $count: "total",
          },
        ]),
      ]);

    const totalIncome = Number(
      Number(incomeResult[0]?.totalIncome || 0).toFixed(2),
    );
    const totalSales = Number(salesResult[0]?.totalSales || 0);
    const totalVendors = Number(vendorResult[0]?.total || 0);

    return {
      totalIncome,
      totalSales,
      totalUsers,
      totalVendors,
    };
  },

  getMonthlyEarnings: async (): Promise<IMonthlyEarning[]> => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const earningsResult = await Order.aggregate([
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
        $match: {
          deliveryDate: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$deliveryDate" },
          totalIncome: { $sum: "$orderAdminCommission" },
        },
      },
    ]);

    const MONTH_NAMES = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return MONTH_NAMES.map((month, idx) => {
      const monthNumber = idx + 1;
      const match = earningsResult.find((r) => r._id === monthNumber);
      return {
        month,
        monthNumber,
        totalIncome: match
          ? Number(Number(match.totalIncome || 0).toFixed(2))
          : 0,
      };
    });
  },

  getOrderDistribution: async (): Promise<IOrderDistribution[]> => {
    const distributionResult = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalOrders = distributionResult.reduce(
      (sum, r) => sum + (Number(r.count) || 0),
      0,
    );
    const supportedStatuses = Object.values(OrderStatus);

    return supportedStatuses.map((st) => {
      const match = distributionResult.find((r) => r._id === st);
      const count = match ? Number(match.count) || 0 : 0;
      const percentage =
        totalOrders > 0
          ? Number(((count / totalOrders) * 100).toFixed(1))
          : 0;
      return {
        status: st,
        count,
        percentage,
      };
    });
  },

  getRecentUsers: async (
    options: IRecentUsersQueryOptions,
  ): Promise<IPaginatedRecentUsersResult> => {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      role: { $in: [UserRole.BUYER, UserRole.VENDOR] },
    };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("_id name email role status createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      User.countDocuments(filter),
    ]);

    const buyerUserIds = users
      .filter((u) => u.role === UserRole.BUYER)
      .map((u) => u._id);
    const vendorUserIds = users
      .filter((u) => u.role === UserRole.VENDOR)
      .map((u) => u._id);

    const [buyerProfiles, vendorProfiles] = await Promise.all([
      buyerUserIds.length > 0
        ? Buyer.find({ buyer: { $in: buyerUserIds } })
            .select("buyer profile phoneNumber address")
            .lean()
            .exec()
        : [],
      vendorUserIds.length > 0
        ? Vendor.find({ vendor: { $in: vendorUserIds } })
            .select("vendor profile location")
            .lean()
            .exec()
        : [],
    ]);

    const buyerMap = new Map(
      buyerProfiles.map((b) => [b.buyer.toString(), b]),
    );
    const vendorMap = new Map(
      vendorProfiles.map((v) => [v.vendor.toString(), v]),
    );

    const formattedUsers: IRecentUser[] = users.map((u) => {
      const buyerDoc = buyerMap.get(u._id.toString());
      const vendorDoc = vendorMap.get(u._id.toString());
      const avatar = buyerDoc?.profile?.url || vendorDoc?.profile?.url || "";

      return {
        _id: u._id.toString(),
        fullName: u.name,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar,
        status: u.status,
        createdAt: u.createdAt || new Date(),
        phoneNumber: buyerDoc?.phoneNumber,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  getUserDetails: async (userId: string): Promise<IUserDetails> => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError(
        status.BAD_REQUEST,
        ERROR_CODE.BAD_REQUEST,
        "Invalid user ID",
      );
    }

    const user = await User.findById(userId)
      .select("_id name email role status createdAt updatedAt")
      .lean()
      .exec();

    if (!user) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        DASHBOARD_MESSAGES.USER_NOT_FOUND,
      );
    }

    let profileData: Record<string, any> = {};
    if (user.role === UserRole.BUYER) {
      const buyer = await Buyer.findOne({ buyer: user._id })
        .select("phoneNumber gender address profile")
        .lean()
        .exec();
      profileData = {
        phoneNumber: buyer?.phoneNumber || "",
        gender: buyer?.gender || "",
        address: buyer?.address || "",
        avatar: buyer?.profile?.url || "",
      };
    } else if (user.role === UserRole.VENDOR) {
      const vendor = await Vendor.findOne({ vendor: user._id })
        .select("location licenceNumber status profile")
        .lean()
        .exec();
      profileData = {
        location: vendor?.location || "",
        licenceNumber: vendor?.licenceNumber || "",
        vendorStatus: vendor?.status || "",
        avatar: vendor?.profile?.url || "",
      };
    }

    return {
      _id: user._id.toString(),
      name: user.name,
      fullName: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt || new Date(),
      ...profileData,
    };
  },

  getVendorDashboardOverview: async (
    vendorUserId: string,
  ): Promise<IVendorDashboardOverview> => {
    const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        DASHBOARD_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [totalProducts, totalSalesResult, productCounts, salesCounts] =
      await Promise.all([
        // 1. Total Products
        Product.countDocuments({ vendor: vendor._id }),

        // 2. Total Sales: sum of quantity sold across non-cancelled orders
        Order.aggregate([
          {
            $match: {
              vendor: vendor._id,
              status: { $ne: OrderStatus.CANCELLED },
            },
          },
          {
            $unwind: "$productItems",
          },
          {
            $match: {
              "productItems.vendor": vendor._id,
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$productItems.quantity" },
            },
          },
        ]),

        // 3. Monthly Products for Area Chart in current year
        Product.aggregate([
          {
            $match: {
              vendor: vendor._id,
              createdAt: { $gte: startOfYear, $lte: endOfYear },
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 },
            },
          },
        ]),

        // 4. Monthly Product Sales for Bar Chart in current year
        Order.aggregate([
          {
            $match: {
              vendor: vendor._id,
              status: { $ne: OrderStatus.CANCELLED },
              createdAt: { $gte: startOfYear, $lte: endOfYear },
            },
          },
          {
            $unwind: "$productItems",
          },
          {
            $match: {
              "productItems.vendor": vendor._id,
            },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: "$productItems.quantity" },
            },
          },
        ]),
      ]);

    const totalSales = Number(totalSalesResult[0]?.totalSales || 0);

    const MONTH_NAMES = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyProducts = MONTH_NAMES.map((month, idx) => {
      const monthNumber = idx + 1;
      const match = productCounts.find((r) => r._id === monthNumber);
      return {
        month,
        monthNumber,
        count: match ? Number(match.count) || 0 : 0,
      };
    });

    const monthlySales = MONTH_NAMES.map((month, idx) => {
      const monthNumber = idx + 1;
      const match = salesCounts.find((r) => r._id === monthNumber);
      return {
        month,
        monthNumber,
        count: match ? Number(match.count) || 0 : 0,
      };
    });

    return {
      totalProducts,
      totalSales,
      monthlyProducts,
      monthlySales,
    };
  },

  getVendorRecentSales: async (
    vendorUserId: string,
    options: { page?: number; limit?: number },
  ): Promise<IPaginatedVendorRecentSalesResult> => {
    const vendor = await Vendor.findOne({ vendor: vendorUserId }).exec();
    if (!vendor) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODE.NOT_FOUND,
        DASHBOARD_MESSAGES.VENDOR_NOT_FOUND,
      );
    }

    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const [salesAgg, totalAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            vendor: vendor._id,
            status: { $ne: OrderStatus.CANCELLED },
          },
        },
        {
          $unwind: "$productItems",
        },
        {
          $match: {
            "productItems.vendor": vendor._id,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "users",
            localField: "buyer",
            foreignField: "_id",
            as: "buyerDoc",
          },
        },
        {
          $unwind: {
            path: "$buyerDoc",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "payment",
            foreignField: "_id",
            as: "paymentDoc",
          },
        },
        {
          $unwind: {
            path: "$paymentDoc",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "buyers",
            localField: "buyer",
            foreignField: "buyer",
            as: "buyerProfileDoc",
          },
        },
        {
          $unwind: {
            path: "$buyerProfileDoc",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            vendor: vendor._id,
            status: { $ne: OrderStatus.CANCELLED },
          },
        },
        {
          $unwind: "$productItems",
        },
        {
          $match: {
            "productItems.vendor": vendor._id,
          },
        },
        {
          $count: "total",
        },
      ]),
    ]);

    const total = Number(totalAgg[0]?.total || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const sales: IVendorRecentSale[] = salesAgg.map((doc) => {
      const item = doc.productItems;
      const buyerName =
        doc.buyerDoc?.name ||
        doc.shippingAddress?.fullName ||
        "Customer";
      const buyerEmail = doc.buyerDoc?.email || "N/A";
      const buyerImage = doc.buyerProfileDoc?.profile?.url || "";

      const transactionId =
        doc.transactionNumber ||
        doc.paymentDoc?.stripePaymentIntentId ||
        doc._id.toString();

      const paymentStatus =
        doc.paymentDoc?.status ||
        (doc.orderType === OrderType.COD ? "PAID" : "PENDING");
      const paymentMethod =
        doc.paymentDoc?.paymentMethod || doc.orderType || "COD";

      const amount = Number(
        Number(item.itemSubtotal || item.unitPrice * item.quantity || 0).toFixed(
          2,
        ),
      );

      return {
        orderId: doc._id.toString(),
        transactionId,
        orderStatus: doc.status,
        paymentStatus,
        paymentMethod,
        createdAt: doc.createdAt,
        product: {
          productId: item.product?.toString() || "",
          name: item.name,
          image: item.image || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          itemSubtotal: amount,
          brand: item.brand,
          size: item.size,
        },
        customer: {
          _id: doc.buyerDoc?._id?.toString() || doc.buyer?.toString() || "",
          name: buyerName,
          email: buyerEmail,
          profileImage: buyerImage,
        },
        amount,
      };
    });

    return {
      sales,
      pagination: {
        page,
        limit,
        skip,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
};

export default dashboardService;
