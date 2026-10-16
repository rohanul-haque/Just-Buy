"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { AuthLayoutProps } from "@/types";

export type { AuthLayoutProps };

export function AuthLayout({
  children,
  illustration,
  showLogo = true,
  className,
  variant = "split",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F9FB] bg-[radial-gradient(ellipse_75%_75%_at_20%_20%,rgba(255,175,115,0.22)_0%,rgba(255,248,242,0.65)_45%,#F8F9FB_100%)] p-4 sm:p-6 lg:p-10 relative overflow-x-hidden">
      {/* Subtle Ambient Decorative Glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#FF5A0A]/6 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#FFA915]/6 blur-3xl"
        aria-hidden="true"
      />

      {variant === "card" ? (
        /* Single Centered Card Layout (e.g. Register page matching screenshot) */
        <div
          className={cn(
            "w-full max-w-[480px] bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-9 relative my-auto animate-in fade-in duration-300",
            className,
          )}
        >
          {children}
        </div>
      ) : (
        /* Open Two-Column Layout (Matching Login screenshot) */
        <div
          className={cn(
            "w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-8 lg:gap-14 py-4 sm:py-8",
            className,
          )}
        >
          {/* Left Column: Illustration */}
          {illustration && (
            <div className="hidden md:flex md:col-span-6 lg:col-span-7 items-center justify-center relative select-none">
              {illustration}
            </div>
          )}

          {/* Right Column: Authentication Form */}
          <div
            className={cn(
              "w-full max-w-[420px] mx-auto",
              illustration ? "col-span-1 md:col-span-6 lg:col-span-5" : "col-span-1 md:col-span-8 md:col-start-3",
            )}
          >
            {/* Mobile-Only Header with Logo */}
            {showLogo && (
              <div className="md:hidden mb-6 flex justify-center">
                <Link href="/" aria-label="JustBuy Home">
                  <Image
                    src="/logo.svg"
                    alt="JustBuy"
                    width={150}
                    height={50}
                    priority
                    className="h-9 w-auto object-contain"
                  />
                </Link>
              </div>
            )}

            {children}
          </div>
        </div>
      )}
    </div>
  );
}
