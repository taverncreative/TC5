import { requireProfile } from "@/lib/db/auth";
import { AccountForm } from "@/components/dashboard/account-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await requireProfile();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
          Account
        </h1>
        <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
          Manage your details and wedding information
        </p>
      </div>

      <AccountForm profile={profile} />
    </div>
  );
}
