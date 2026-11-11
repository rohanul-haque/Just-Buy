import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/providers/query-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "JustBuy — Modern Multi-Vendor Storefront",
    template: "%s | JustBuy",
  },
  description: "Buy anything you want from anywhere at your fingertips.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans", outfit.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
