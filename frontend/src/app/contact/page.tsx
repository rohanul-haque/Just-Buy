import * as React from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { Container } from "@/components/layout/container";

export const metadata = {
  title: "Contact Us | JusBuy",
  description:
    "Get in touch with the JusBuy customer care and support team. Available 24/7.",
};

export default function ContactPage() {
  return (
    <div className="bg-white min-h-[70vh] pb-24 sm:pb-32">
      <Container>
        {/* 1. Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="pt-8 pb-10 sm:pt-10 sm:pb-16 text-sm text-neutral-500 flex items-center gap-2"
        >
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span className="text-neutral-400">/</span>
          <span className="text-black font-medium">Contact</span>
        </nav>

        {/* 2. Contact Information Grid with Vertical Divider matching Mockup */}
        <div className="max-w-4xl mx-auto py-6 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 items-start">
            {/* Left Column: Call To Us */}
            <div className="space-y-4 md:pr-12 lg:pr-16">
              <div className="flex items-center gap-4">
                <div className="size-10 sm:size-11 rounded-full bg-[#ff6200] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="size-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Call To Us
                </h2>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-neutral-800 leading-relaxed pl-14">
                <p>We are available 24/7, 7 days a week.</p>
                <p>
                  Phone:{" "}
                  <a
                    href="tel:+8801611112222"
                    className="hover:text-[#ff6200] transition-colors font-medium"
                  >
                    +8801611112222
                  </a>
                </p>
              </div>
            </div>

            {/* Right Column: Write To US (with middle vertical divider) */}
            <div className="space-y-4 md:pl-12 lg:pl-16 md:border-l md:border-neutral-300">
              <div className="flex items-center gap-4">
                <div className="size-10 sm:size-11 rounded-full bg-[#ff6200] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="size-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Write To US
                </h2>
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-neutral-800 leading-relaxed pl-14">
                <p>Contact this email and we will contact you within 24 hours.</p>
                <p>
                  Emails:{" "}
                  <a
                    href="mailto:customer@exclusive.com"
                    className="hover:text-[#ff6200] transition-colors font-medium"
                  >
                    customer@exclusive.com
                  </a>
                </p>
                <p>
                  Emails:{" "}
                  <a
                    href="mailto:support@exclusive.com"
                    className="hover:text-[#ff6200] transition-colors font-medium"
                  >
                    support@exclusive.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
