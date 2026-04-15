import { getShopProducts } from "@/lib/db/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export const metadata = {
  title: "All Designs",
  description: "Browse our full collection of personalised wedding stationery.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getShopProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
          All Designs
        </h1>
        <p className="mt-2 text-[var(--tc-gray-500)]">
          Browse our collection and personalise your perfect wedding stationery.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className="px-4 py-2 text-sm font-medium rounded-full bg-[var(--tc-black)] text-white"
        >
          All
        </Link>
        {PRODUCT_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="px-4 py-2 text-sm font-medium rounded-full border border-[var(--tc-gray-300)] text-[var(--tc-gray-600)] hover:bg-[var(--tc-gray-50)] transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
