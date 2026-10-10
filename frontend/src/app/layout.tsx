import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});



export const metadata: Metadata = {
  title: "Jus Buy",
  description: "Buy anything you want from anywhere at your fingertips",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", outfit.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
