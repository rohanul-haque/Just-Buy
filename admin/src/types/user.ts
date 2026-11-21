export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "BUYER" | "VENDOR";
  status: "ACTIVE" | "BLOCKED";
  isEmailVerified?: boolean;
  createdAt?: string;
}

export interface IAdminProfile {
  _id: string;
  admin: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt?: string;
  };
  phoneNumber?: string;
  profile?: {
    type?: string;
    url?: string;
    publicId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IBuyer {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: "ACTIVE" | "BLOCKED";
    createdAt?: string;
  };
  phoneNumber?: string;
  address?: string;
  gender?: string;
  profile?: {
    publicId?: string;
    url?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
