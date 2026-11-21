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
  createdAt: string;
  shopName?: string;
  phoneNumber?: string;
}

export interface IRecentUsersResponse {
  users: IRecentUser[];
  pagination: {
    page: number;
    limit: number;
    skip?: number;
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
  createdAt: string;
  avatar?: string;
  phoneNumber?: string;
  gender?: string;
  address?: string;
  shopName?: string;
  location?: string;
  licenceNumber?: string;
  vendorStatus?: string;
}

export interface DashboardLoaderData {
  summary: IDashboardSummary;
  monthlyEarnings: IMonthlyEarning[];
  orderDistribution: IOrderDistribution[];
  recentUsers: IRecentUsersResponse;
  page: number;
}
