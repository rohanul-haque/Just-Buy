export interface IEarningsSummary {
  todayIncome: number;
  totalIncome: number;
}

export interface IEarningsTransaction {
  _id: string;
  orderId: string;
  transactionId: string;
  buyerName: string;
  amount: number;
  commission: number;
  date: Date | string;
  status: string;
}

export interface IEarningsItemDetail {
  productId: string;
  productName: string;
  productImage: string;
  vendorName: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  subtotal: number;
  commissionRate: number;
  adminCommission: number;
  vendorCommissionRate: number;
  vendorEarnings: number;
}

export interface IEarningsTransactionDetails {
  transaction: {
    orderId: string;
    transactionId: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    orderDate: Date | string;
    deliveredDate?: Date | string | null;
  };
  buyer: {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
  };
  items: IEarningsItemDetail[];
  summary: {
    totalProductAmount: number;
    totalAdminCommission: number;
    totalVendorEarnings: number;
    shippingCharge: number;
    discount: number;
    finalOrderTotal: number;
  };
}

export interface IEarningsQueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  search?: string;
  status?: string;
}

export interface IPaginatedEarningsResult {
  data: IEarningsTransaction[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}

export interface IVendorEarningsSummary {
  todayEarnings: number;
  monthlyEarnings: number;
  allTimeEarnings: number;
}

export interface IVendorEarningsTransaction {
  _id: string;
  orderId: string;
  transactionId: string;
  buyerName: string;
  buyerImage?: string;
  buyerEmail?: string;
  amount: number;
  commission: number;
  vendorEarnings: number;
  date: Date | string;
  status: string;
}

export interface IVendorEarningsTransactionDetails {
  transaction: {
    orderId: string;
    transactionId: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    orderDate: Date | string;
    deliveredDate?: Date | string | null;
  };
  buyer: {
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    profileImage?: string;
  };
  items: IEarningsItemDetail[];
  summary: {
    totalProductAmount: number;
    totalAdminCommission: number;
    totalVendorEarnings: number;
  };
}

export interface IPaginatedVendorEarningsResult {
  data: IVendorEarningsTransaction[];
  pagination: {
    page: number;
    limit: number;
    skip: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
