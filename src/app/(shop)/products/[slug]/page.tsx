import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getShopProduct, formatPrice } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { PAPER_STOCKS } from "@/lib/constants";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) notFound();

  const categoryLabel =
    product.template?.category === "save-the-date"
      ? "Save the Date"
      : product.template?.category === "on-the-day"
        ? "On the Day"
        : product.template?.category === "thank-you"
          ? "Thank You"
          : "Invitation";

  const availablePaperStocks = PAPER_STOCKS.filter((ps) =>
    product.print_options.paper_stocks.includes(ps.id)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Preview */}
        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--tc-gray-200)] bg-[var(--tc-gray-50)]">
          {product.template?.thumbnail_url ? (
            <Image
              src={product.template.thumbnail_url}
              alt={product.name}
              width={800}
              height={1067}
              className="w-full h-full object-cover"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-8">
                <p className="font-heading text-2xl font-medium text-[var(--tc-gray-400)]">
                  {product.name}
                </p>
                <p className="mt-3 text-sm text-[var(--tc-gray-300)]">
                  Full preview available in the editor
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <Badge variant="sage">{categoryLabel}</Badge>

          <h1 className="mt-3 font-heading text-3xl font-semibold text-[var(--tc-black)]">
            {product.name}
          </h1>

          <p className="mt-2 text-2xl font-semibold text-[var(--tc-black)]">
            from {formatPrice(product.price_pence)}
          </p>

          <p className="mt-4 text-[var(--tc-gray-600)] leading-relaxed">
            {product.description}
          </p>

          {/* Paper stocks */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Available Paper Stocks
            </h3>
            <ul className="mt-3 space-y-2">
              {availablePaperStocks.map((ps) => (
                <li key={ps.id} className="text-sm text-[var(--tc-gray-600)]">
                  <span className="font-medium">{ps.label}</span>
                  {" — "}
                  {ps.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantities */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--tc-black)]">
              Quantities
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.print_options.quantities.map((qty) => (
                <span
                  key={qty}
                  className="px-3 py-1 rounded-full text-sm border border-[var(--tc-gray-200)] text-[var(--tc-gray-600)]"
                >
                  {qty}
                </span>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          {product.template && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--tc-black)]">
                Dimensions
              </h3>
              <p className="mt-1 text-sm text-[var(--tc-gray-600)]">
                {product.template.dimensions.width_mm} x{" "}
                {product.template.dimensions.height_mm}mm
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8">
            <Link
              href={`/editor/${product.slug}`}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-[var(--tc-black)] px-8 py-3.5 text-sm font-medium text-white hover:bg-[var(--tc-gray-800)] transition-colors"
            >
              Personalise This Design
            </Link>
            <p className="mt-3 text-xs text-[var(--tc-gray-400)]">
              Free to personalise. Pay only when you order prints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
