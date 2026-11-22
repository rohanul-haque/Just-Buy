export type UserRole = "ADMIN" | "BUYER" | "VENDOR";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface IUser {
  id?: string;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
}
