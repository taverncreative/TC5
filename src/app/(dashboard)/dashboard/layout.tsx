import Link from "next/link";
import { requireProfile } from "@/lib/db/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <div className="min-h-screen bg-[var(--tc-gray-50)]">
      <DashboardHeader profile={profile} />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
