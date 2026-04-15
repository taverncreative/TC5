import Link from "next/link";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface CategoryPillsProps {
  /** Slug of the currently active category, or 'all' for the All Designs page */
  active: "all" | (typeof PRODUCT_CATEGORIES)[number]["slug"];
}

export function CategoryPills({ active }: CategoryPillsProps) {
  const pills: Array<{ label: string; href: string; slug: string }> = [
    { label: "All", href: "/products", slug: "all" },
    ...PRODUCT_CATEGORIES.map((cat) => ({
      label: cat.label,
      href: `/category/${cat.slug}`,
      slug: cat.slug,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => {
        const isActive = pill.slug === active;
        return (
          <Link
            key={pill.slug}
            href={pill.href}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
              isActive
                ? "bg-[var(--tc-black)] text-white"
                : "border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)] hover:border-[var(--tc-black)] hover:text-[var(--tc-black)]"
            }`}
          >
            {pill.label}
            {isActive && (
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-1.5 h-[2px] w-8 -translate-x-1/2 bg-[var(--tc-gold)]"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
