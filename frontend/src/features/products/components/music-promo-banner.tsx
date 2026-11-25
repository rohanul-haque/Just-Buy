"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

export function MusicPromoBanner() {
  return (
    <section className="py-6 sm:py-10">
      <div className="relative w-full aspect-[1024/437] overflow-hidden rounded-2xl sm:rounded-3xl shadow-xs group bg-[#FF6201]">
        <Link
          href="/products"
          className="block w-full h-full relative cursor-pointer"
          aria-label="Enhance Your Music Experience"
        >
          <Image
            src="/music-experience-banner.jpg"
            alt="Enhance Your Music Experience"
            fill
            priority
            sizes="100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      </div>
    </section>
  );
}

export default MusicPromoBanner;
