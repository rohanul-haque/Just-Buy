import { OrderDetail } from "@/features/buyer/components/order-detail";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderId } = await params;
  return <OrderDetail orderId={orderId} />;
}

