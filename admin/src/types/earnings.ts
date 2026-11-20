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
  date: string;
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
    orderDate: string;
    deliveredDate?: string | null;
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

export interface IEarningsPagination {
  page?: number;
  limit: number;
  skip?: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface EarningsLoaderData {
  summary: IEarningsSummary;
  transactions: IEarningsTransaction[];
  pagination: IEarningsPagination | null;
  search: string;
  page: number;
}
