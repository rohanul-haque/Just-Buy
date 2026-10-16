import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | JustBuy",
  description: "Secure authentication for JustBuy marketplace",
};

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-full w-full">{children}</div>;
}
