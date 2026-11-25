import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  CircleDollarSign,
  ShoppingBag,
  BadgeDollarSign,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About Us | JusBuy",
  description:
    "Learn more about JusBuy - South Asia's premier online shopping destination.",
};

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const STATS = [
  {
    icon: Store,
    value: "10.5k",
    label: "Sallers active our site",
    highlighted: false,
  },
  {
    icon: CircleDollarSign,
    value: "33k",
    label: "Mopnthly Produdt Sale",
    highlighted: true,
  },
  {
    icon: ShoppingBag,
    value: "45.5k",
    label: "Customer active in our site",
    highlighted: false,
  },
  {
    icon: BadgeDollarSign,
    value: "25k",
    label: "Anual gross sale in our site",
    highlighted: false,
  },
];

const TEAM = [
  {
    name: "Tom Cruise",
    role: "Founder & Chairman",
    image: "/team-1.jpg",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
  },
  {
    name: "Emma Watson",
    role: "Managing Director",
    image: "/team-2.jpg",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
  },
  {
    name: "Will Smith",
    role: "Product Designer",
    image: "/team-3.jpg",
    twitter: "#",
    instagram: "#",
    linkedin: "#",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pb-20 sm:pb-28">
      <Container>
        {/* 1. Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="pt-8 pb-10 sm:pt-10 sm:pb-12 text-sm text-neutral-500 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-black font-medium">About</span>
        </nav>

        {/* 2. Our Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Story Content */}
          <div className="lg:col-span-6 space-y-6 pr-0 lg:pr-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
              Our Story
            </h1>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Launced in 2015, Exclusive is South Asia&apos;s premier online shopping
              maketplace with an active presense in Bangladesh. Supported by wide
              range of tailored marketing, data and service solutions, Exclusive
              has 10,500 sellers and 300 brands and serves 3 millions customers
              across the region.
            </p>

            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
              Exclusive has more than 1 Million products to offer, growing at a
              very fast. Exclusive offers a diverse assorment in categories
              ranging from consumer.
            </p>
          </div>

          {/* Right Image matching attachment */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg aspect-[1.16/1] rounded-sm sm:rounded-md overflow-hidden shadow-xs">
              <Image
                src="/about-story.jpg"
                alt="Our Story - Exclusive JusBuy"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* 3. Stats Grid (4 Cards) */}
        <section className="my-20 sm:my-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "group flex flex-col items-center justify-center p-8 rounded-sm sm:rounded-md border transition-all duration-300 text-center cursor-default",
                    stat.highlighted
                      ? "bg-[#ff6200] border-[#ff6200] text-white shadow-md"
                      : "bg-white border-neutral-300 text-neutral-900 hover:bg-[#ff6200] hover:border-[#ff6200] hover:text-white hover:shadow-md",
                  )}
                >
                  {/* Circular double ring Icon container */}
                  <div
                    className={cn(
                      "size-16 sm:size-20 rounded-full flex items-center justify-center mb-5 transition-colors duration-300",
                      stat.highlighted
                        ? "bg-white/20"
                        : "bg-neutral-200/80 group-hover:bg-white/20",
                    )}
                  >
                    <div
                      className={cn(
                        "size-11 sm:size-14 rounded-full flex items-center justify-center transition-colors duration-300",
                        stat.highlighted
                          ? "bg-white text-[#ff6200]"
                          : "bg-black text-white group-hover:bg-white group-hover:text-[#ff6200]",
                      )}
                    >
                      <Icon className="size-6 sm:size-7" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Stat Value */}
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                    {stat.value}
                  </h3>

                  {/* Stat Label */}
                  <p
                    className={cn(
                      "text-xs sm:text-sm transition-colors duration-300 leading-snug",
                      stat.highlighted
                        ? "text-white/95"
                        : "text-neutral-600 group-hover:text-white/95",
                    )}
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Leadership Team Section (3 Members) */}
        <section className="my-16 sm:my-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {TEAM.map((member, index) => (
              <div key={index} className="flex flex-col">
                {/* Member Photo in light gray box */}
                <div className="relative aspect-[1/1.2] w-full bg-[#F5F5F5] rounded-sm sm:rounded-md overflow-hidden flex items-end justify-center pt-6 px-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-bottom transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>

                {/* Member Info */}
                <div className="mt-5 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                    {member.role}
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center gap-4 pt-2 text-neutral-800">
                    <Link
                      href={member.twitter}
                      className="hover:text-[#ff6200] transition-colors"
                      aria-label={`${member.name} Twitter`}
                    >
                      <TwitterIcon className="size-4" />
                    </Link>
                    <Link
                      href={member.instagram}
                      className="hover:text-[#ff6200] transition-colors"
                      aria-label={`${member.name} Instagram`}
                    >
                      <InstagramIcon className="size-4" />
                    </Link>
                    <Link
                      href={member.linkedin}
                      className="hover:text-[#ff6200] transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <LinkedinIcon className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
