import type { TAccountStatus } from "@/modules/v1/user/user.constant";
import type { IUser } from "@/modules/v1/user/user.interface";
import User from "@/modules/v1/user/user.model";

const findUserByEmail = async (
  email: string,
  includePassword = false,
): Promise<IUser | null> => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  if (includePassword) {
    query.select("+password");
  }
  return query.exec();
};

const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id).exec();
};

const updateUserStatus = async (
  id: string,
  status: TAccountStatus,
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(id, { status }, { new: true }).exec();
};

const userService = {
  findUserByEmail,
  findUserById,
  updateUserStatus,
};

export default userService;
