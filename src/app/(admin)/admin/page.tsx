import { Card } from "@/components/ui/card";

export const metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
        Manage your templates, products, and orders.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-[var(--tc-gray-500)]">Total Products</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--tc-black)]">6</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--tc-gray-500)]">Active Orders</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--tc-black)]">0</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--tc-gray-500)]">Templates</p>
          <p className="mt-1 text-3xl font-semibold text-[var(--tc-black)]">6</p>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <h2 className="font-heading text-lg font-semibold text-[var(--tc-black)]">
            Getting Started
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--tc-gray-600)]">
            <li className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[var(--tc-sage-light)] flex items-center justify-center text-xs">1</span>
              Connect Supabase and run the schema SQL
            </li>
            <li className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[var(--tc-sage-light)] flex items-center justify-center text-xs">2</span>
              Create your first template with sections
            </li>
            <li className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[var(--tc-sage-light)] flex items-center justify-center text-xs">3</span>
              Create a product linked to the template
            </li>
            <li className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-[var(--tc-sage-light)] flex items-center justify-center text-xs">4</span>
              Connect Stripe for payments
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
