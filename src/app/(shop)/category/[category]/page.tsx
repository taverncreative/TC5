import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopProducts } from "@/lib/db/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return {};
  return {
    title: cat.label,
    description: `Browse our ${cat.label.toLowerCase()} collection.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const products = await getShopProducts(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
          {cat.label}
        </h1>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className="px-4 py-2 text-sm font-medium rounded-full border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-50)] transition-colors"
        >
          All
        </Link>
        {PRODUCT_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              c.slug === category
                ? "bg-[var(--tc-black)] text-white"
                : "border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-50)]"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
