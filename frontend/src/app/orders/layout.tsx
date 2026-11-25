import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { BuyerSidebar } from "@/features/buyer/components/buyer-sidebar";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";

export const metadata: Metadata = {
  title: "Order History",
  description: "Track and view your recent JustBuy orders and purchases.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuyerAuthGuard>
      <div className="bg-white min-h-[calc(100vh-4rem)] py-10 sm:py-16">
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-12 lg:gap-20">
            {/* Left Buyer Sidebar */}
            <BuyerSidebar />

            {/* Main Content Area */}
            <main className="flex-1 w-full">
              {children}
            </main>
          </div>
        </Container>
      </div>
    </BuyerAuthGuard>
  );
}
