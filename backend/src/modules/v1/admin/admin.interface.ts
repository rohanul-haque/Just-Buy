/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Types
 */
import type { IAvatar } from "@/modules/v1/seller/seller.interface";
import type { Types } from "mongoose";

/**
 * Admin Profile
 */
export interface IAdmin {
  user: Types.ObjectId;
  avatar: IAvatar;
  phoneNumber: string;
}
