import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { BuyerSidebar } from "@/features/buyer/components/buyer-sidebar";
import { BuyerAuthGuard } from "@/features/buyer/components/buyer-auth-guard";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and edit your personal information and account settings.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BuyerAuthGuard>
      <div className="bg-background min-h-[calc(100vh-4rem)] py-8 sm:py-12">
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12">
            {/* Left Buyer Sidebar matching Figma */}
            <BuyerSidebar />

            {/* Main Content Area */}
            <main className="flex-1 w-full bg-card/50 rounded-2xl p-4 sm:p-8 border border-border/60 shadow-2xs">
              {children}
            </main>
          </div>
        </Container>
      </div>
    </BuyerAuthGuard>
  );
}

