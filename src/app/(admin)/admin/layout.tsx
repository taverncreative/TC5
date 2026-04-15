import Link from "next/link";
import "../../(editor)/editor/fonts.css";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-[var(--tc-gray-200)] bg-white">
        <div className="p-5 border-b border-[var(--tc-gray-200)]">
          <Link href="/admin" className="font-heading text-lg font-semibold text-[var(--tc-black)]">
            TC Admin
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm font-medium text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-50)] hover:text-[var(--tc-black)] rounded-md transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 border-t border-[var(--tc-gray-200)]">
          <Link
            href="/"
            className="block px-3 py-2 text-sm text-[var(--tc-gray-400)] hover:text-[var(--tc-black)]"
          >
            View Site &rarr;
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[var(--tc-gray-50)]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
