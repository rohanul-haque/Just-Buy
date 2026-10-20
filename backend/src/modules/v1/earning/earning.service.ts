/**
 * Third-Party Modules
 */
import { Types } from "mongoose";

/**
 * Application Modules
 */
import { UserRole } from "@/modules/v1/auth/auth.intarface";
import User from "@/modules/v1/auth/auth.model";
import { OrderStatus } from "@/modules/v1/order/order.interface";
import Order from "@/modules/v1/order/order.model";
import AppError from "@/utils/appError";
import { API_MESSAGES, ERROR_CODE, HTTP_STATUS } from "@/utils/constants";

/**
 * Type
 */
import type { IEarningResponse } from "@/modules/v1/earning/earning.interface";

/**
 * Constants
 */
const ADMIN_COMMISSION_RATE = 0.2;
const VENDOR_EARNING_RATE = 0.8;

/**
 * Get Earnings
 * @param {Types.ObjectId} userId - User ID
 * @returns {Promise<IEarningResponse>}
 */
export const getEarningsService = async (
  userId: Types.ObjectId,
): Promise<IEarningResponse> => {
  const user = await User.findById(userId).select("role").lean().exec();

  if (!user) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      API_MESSAGES.NOT_FOUND,
    );
  }

  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SELLER) {
    throw new AppError(
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODE.FORBIDDEN,
      "You are not allowed to view earnings",
    );
  }

  let sellerId = user._id;

  const orders = await Order.find({
    orderStatus: OrderStatus.DELIVERED,
    ...(sellerId && { "items.seller": sellerId }),
  })
    .select("items")
    .lean()
    .exec();

  let totalEarnings = 0;

  for (const order of orders) {
    const items = order.items.filter((item: any) => {
      if (user.role === UserRole.ADMIN) {
        return true;
      }

      return item.seller.toString() === sellerId?.toString();
    });

    const sales = items.reduce(
      (total: any, item: any) => total + item.price * item.quantity,
      0,
    );

    const earningRate =
      user.role === UserRole.ADMIN
        ? ADMIN_COMMISSION_RATE
        : VENDOR_EARNING_RATE;

    totalEarnings += sales * earningRate;
  }

  return {
    role: user.role,
    totalEarnings: Number(totalEarnings.toFixed(2)),
  };
};
