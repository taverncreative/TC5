"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-[var(--tc-gray-200)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col -my-1">
            <span className="font-heading text-xl font-semibold tracking-tight text-[var(--tc-black)] leading-none">
              Tavern Creative
            </span>
            <span className="hidden md:inline-block text-[10px] tracking-[0.18em] text-[var(--tc-gray-500)] uppercase mt-1">
              Wedding Stationery · Kent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {PRODUCT_CATEGORIES.map((cat) => {
              const href = `/category/${cat.slug}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={`relative text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-[var(--tc-black)]"
                      : "text-[var(--tc-gray-600)] hover:text-[var(--tc-black)]"
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[var(--tc-gold)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="hidden md:inline-flex text-sm font-medium text-[var(--tc-gray-600)] hover:text-[var(--tc-black)] transition-colors"
            >
              {isLoggedIn ? "Dashboard" : "Account"}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden -m-2 p-2 text-[var(--tc-gray-600)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
            mobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="border-t border-[var(--tc-gray-200)] py-3 space-y-1">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="block px-2 py-3 text-sm font-medium text-[var(--tc-gray-700)] hover:text-[var(--tc-black)] hover:bg-[var(--tc-gray-50)] rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="block px-2 py-3 text-sm font-medium text-[var(--tc-gray-700)] hover:text-[var(--tc-black)] hover:bg-[var(--tc-gray-50)] rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {isLoggedIn ? "Dashboard" : "Account"}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
