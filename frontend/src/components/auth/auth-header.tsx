"use client";

/**
 * @copyright 2026
 * @author Fardin Islam Selim - MERN Stack Developer
 * @license Apache-2.0
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { AuthHeaderProps } from "@/types";

export type { AuthHeaderProps };

export function AuthHeader({
  title,
  subtitle,
  showLogo = true,
  className = "",
}: AuthHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 mb-6 ${className}`}>
      {showLogo && (
        <div className="mb-4">
          <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label="JustBuy Home">
            <Image
              src="/logo.svg"
              alt="JustBuy"
              width={160}
              height={55}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#242426]">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-neutral-500 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
