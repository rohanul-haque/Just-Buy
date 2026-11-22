export interface IDashboardSummary {
  totalIncome: number;
  totalSales: number;
  totalUsers: number;
  totalVendors: number;
}

export interface IMonthlyEarning {
  month: string;
  monthNumber: number;
  totalIncome: number;
}

export interface IOrderDistribution {
  status: string;
  count: number;
  percentage?: number;
}

export interface IRecentUser {
  _id: string;
  fullName: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  createdAt: Date | string;
  shopName?: string;
  phoneNumber?: string;
}

export interface IRecentUsersQueryOptions {
  page?: number;
  limit?: number;
}

export interface IPaginatedRecentUsersResult {
  users: IRecentUser[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IUserDetails {
  _id: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date | string;
  avatar?: string;
  phoneNumber?: string;
  gender?: string;
  address?: string;
  shopName?: string;
  location?: string;
  licenceNumber?: string;
  vendorStatus?: string;
}

export interface IMonthlyCount {
  month: string;
  monthNumber: number;
  count: number;
}

export interface IVendorDashboardOverview {
  totalProducts: number;
  totalEarnings: number;
  monthlyProductSales: IMonthlyCount[];
  monthlyEarnings: IMonthlyCount[];
}

export interface IVendorRecentSale {
  orderId: string;
  transactionId: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  date: Date | string;
  createdAt: Date | string;
  product: {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    unitPrice: number;
    itemSubtotal: number;
    brand?: string;
    size?: string;
  };
  customer: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  amount: number;
}

export interface IPaginatedVendorRecentSalesResult {
  sales: IVendorRecentSale[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
