"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

interface DashboardHeaderProps {
  profile: Profile;
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = profile.partner_name_1 && profile.partner_name_2
    ? `${profile.partner_name_1} & ${profile.partner_name_2}`
    : profile.full_name || profile.email;

  return (
    <header className="h-16 border-b border-[var(--tc-gray-200)] bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-heading text-lg font-semibold text-[var(--tc-black)]">
          Tavern Creative
        </Link>
        <div className="h-5 w-px bg-[var(--tc-gray-200)] hidden sm:block" />
        <span className="text-sm text-[var(--tc-gray-500)] hidden sm:block">
          {displayName}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors"
        >
          Browse Designs
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm text-[var(--tc-gray-400)] hover:text-[var(--tc-black)] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
