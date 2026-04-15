import Image from "next/image";
import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-white">
      {/* Top editorial band */}
      <section className="relative overflow-hidden border-t border-[var(--tc-gray-200)]">
        <div className="absolute inset-0">
          <Image
            src="/images/brand/footer-mark.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-white/55" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="tc-divider mb-4" />
          <p className="font-heading text-xl md:text-2xl font-medium text-[var(--tc-black)] max-w-2xl mx-auto leading-relaxed">
            Beautifully crafted stationery for the day you&apos;ve been waiting for.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-[var(--tc-black)] hover:gap-3 transition-all duration-300"
          >
            Browse our collection
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <p className="font-heading text-lg font-semibold text-[var(--tc-black)]">
              Tavern Creative
            </p>
            <p className="mt-3 text-sm text-[var(--tc-gray-500)] leading-relaxed max-w-sm">
              Award-winning wedding stationery studio based in Kent. We design
              and print beautiful invitations, save the dates, and on-the-day
              stationery for couples across the UK.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialLink href="https://instagram.com/taverncreative" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="https://pinterest.com/taverncreative" label="Pinterest">
                <PinterestIcon />
              </SocialLink>
            </div>
          </div>

          {/* Stationery */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-[var(--tc-black)] uppercase tracking-[0.14em]">
              Stationery
            </h3>
            <ul className="mt-4 space-y-2.5">
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
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-[var(--tc-black)] uppercase tracking-[0.14em]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  About
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
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-[var(--tc-black)] uppercase tracking-[0.14em]">
              Support
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Gold divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--tc-gray-200)]" />
          <span className="tc-divider" />
          <div className="h-px flex-1 bg-[var(--tc-gray-200)]" />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--tc-gray-400)]">
            &copy; {new Date().getFullYear()} Tavern Creative. All rights reserved.
          </p>
          <p className="text-xs text-[var(--tc-gray-400)]">
            Kent, United Kingdom
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-[var(--tc-gray-200)] flex items-center justify-center text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] hover:border-[var(--tc-black)] transition-colors"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <path d="M11 8c-1.5 0-3 1-3 3 0 1 0.5 2 1.5 2.5L9 19l1.5-4s0.5-1 0.5-2 1-2 2-2c1.5 0 2.5 1 2.5 2.5S14.5 16 13 16c-1 0-1.5-0.5-1.5-0.5" />
    </svg>
  );
}
