"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  return (
    <header className="border-b border-[var(--tc-gray-200)] bg-white">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-heading text-xl font-semibold tracking-tight text-[var(--tc-black)]">
              Tavern Creative
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-sm font-medium text-[var(--tc-gray-600)] hover:text-[var(--tc-black)] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
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
            >
              <span className="sr-only">Menu</span>
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--tc-gray-200)] py-4 space-y-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="block px-2 py-2 text-sm font-medium text-[var(--tc-gray-600)] hover:text-[var(--tc-black)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className="block px-2 py-2 text-sm font-medium text-[var(--tc-gray-600)] hover:text-[var(--tc-black)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {isLoggedIn ? "Dashboard" : "Account"}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
