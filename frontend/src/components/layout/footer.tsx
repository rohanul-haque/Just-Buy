import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="bg-[#CC4E01] text-white mt-auto">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Brand Col - Mockup Column 1 */}
          <div className="space-y-4 md:col-span-5 lg:col-span-5">
            <Link href="/" className="inline-block brightness-0 invert">
              <Image
                src="/logo.svg"
                alt="JusBuy Logo"
                width={130}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-sm">
              Shop The Latest Trends At Our E-Commerce Store. Enjoy Fast Shipping,
              Secure Payments, And 24/7 Customer Support. Discover Unbeatable
              Deals On Fashion, Electronics, Home Essentials, And More. Shop Now!
            </p>
          </div>

          {/* Information Col - Mockup Column 2 */}
          <div className="space-y-3 md:col-span-3 lg:col-span-3">
            <h4 className="text-base sm:text-lg font-semibold text-white tracking-wide">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/85">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white hover:underline transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white hover:underline transition-colors"
                >
                  Terms &amp; Condition
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support Col - Mockup Column 3 */}
          <div className="space-y-3 md:col-span-4 lg:col-span-4">
            <h4 className="text-base sm:text-lg font-semibold text-white tracking-wide">
              Help &amp; Support
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-white/85">
              <div className="flex items-start gap-2.5">
                <Mail className="size-4 shrink-0 mt-0.5 text-white/90" />
                <div className="flex flex-col">
                  <span>Email : youremail@gmail.com</span>
                  <span>letstalk@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="size-4 shrink-0 mt-0.5 text-white/90" />
                <div className="flex flex-col">
                  <span>Phone : (+1) (888) 750-6886</span>
                  <span>(+1) (888) 786-3986</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
