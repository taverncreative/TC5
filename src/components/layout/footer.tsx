import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--tc-gray-200)] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-heading text-lg font-semibold text-[var(--tc-black)]">
              Tavern Creative
            </p>
            <p className="mt-2 text-sm text-[var(--tc-gray-500)] leading-relaxed">
              Award-winning wedding stationery studio based in Kent.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Stationery
            </h3>
            <ul className="mt-3 space-y-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Company
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Support
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/login" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--tc-gray-200)] pt-6">
          <p className="text-sm text-[var(--tc-gray-400)]">
            &copy; {new Date().getFullYear()} Tavern Creative. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
