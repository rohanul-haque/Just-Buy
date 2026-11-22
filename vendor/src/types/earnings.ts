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

export interface IVendorEarningsTransactionDetails {
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
    profileImage?: string;
  };
  items: IEarningsItemDetail[];
  summary: {
    totalProductAmount: number;
    totalAdminCommission: number;
    totalVendorEarnings: number;
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
