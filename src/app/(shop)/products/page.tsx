import { getShopProducts } from "@/lib/db/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import { CategoryPills } from "@/components/shop/category-pills";

export const metadata = {
  title: "All Designs",
  description: "Browse our full collection of personalised wedding stationery.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getShopProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="tc-divider mb-4" />
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[var(--tc-black)]">
          Our Collection
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--tc-gray-500)] leading-relaxed">
          Beautifully crafted templates for every piece of your wedding
          stationery — personalise any design in minutes.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <CategoryPills active="all" />
      </div>

      <ProductGrid products={products} withFeatureBand />
    </div>
  );
}
