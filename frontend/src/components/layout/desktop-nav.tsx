"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-base font-normal">
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors text-black hover:text-black py-1 relative",
              isActive
                ? "border-b border-black font-medium"
                : "text-gray-800 hover:text-black",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
