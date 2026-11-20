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
    deliveredDate: Date | string;
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
