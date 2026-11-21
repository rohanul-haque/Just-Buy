import type { Types } from "mongoose";
import type { TAccountStatus, TUserRole } from "@/modules/v1/user/user.constant";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  status: TAccountStatus;
  verification: Types.ObjectId;
  role: TUserRole;
  createdAt?: Date;
  updatedAt?: Date;
}
