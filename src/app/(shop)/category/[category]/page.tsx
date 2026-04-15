import { notFound } from "next/navigation";
import { getShopProducts } from "@/lib/db/queries";
import { ProductGrid } from "@/components/shop/product-grid";
import { CategoryPills } from "@/components/shop/category-pills";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_TAGLINES: Record<string, string> = {
  "save-the-date":
    "Let your guests know the day is coming — set the tone eight to twelve months out.",
  invitation:
    "The moment it becomes real. Invitations sent three to six months before the wedding.",
  "on-the-day":
    "Menus, place cards, table plans, orders of service — the finishing touches.",
  "thank-you":
    "Say thank you in style. Traditionally sent within three months of the wedding.",
};

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
  const tagline = CATEGORY_TAGLINES[category];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="tc-divider mb-4" />
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[var(--tc-black)]">
          {cat.label}
        </h1>
        {tagline && (
          <p className="mt-3 text-sm md:text-base text-[var(--tc-gray-500)] leading-relaxed">
            {tagline}
          </p>
        )}
      </div>

      <div className="mb-10 flex justify-center">
        <CategoryPills active={cat.slug} />
      </div>

      <ProductGrid products={products} withFeatureBand />
    </div>
  );
}
