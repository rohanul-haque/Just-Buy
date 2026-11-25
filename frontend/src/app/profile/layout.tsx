import { Container } from "@/components/layout/container";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";
import { BuyerSidebar } from "@/features/buyer/components/buyer-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and edit your personal information.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuyerAuthGuard>
      <div className="bg-white min-h-[calc(100vh-4rem)] py-10 sm:py-16">
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-12 lg:gap-20">
            {/* Left Buyer Sidebar matching Figma */}
            <BuyerSidebar />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-3xl">
              {children}
            </main>
          </div>
        </Container>
      </div>
    </BuyerAuthGuard>
  );
}
