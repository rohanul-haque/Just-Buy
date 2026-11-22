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
  date: string;
  createdAt: string;
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
