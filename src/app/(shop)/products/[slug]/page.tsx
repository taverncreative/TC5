import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getShopProduct, getShopProducts, formatPrice } from "@/lib/db/queries";
import { ProductCard } from "@/components/shop/product-card";
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
    description: product.description ?? undefined,
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

  // Related — same category, excluding self
  const allInCategory = product.template?.category
    ? await getShopProducts(product.template.category)
    : [];
  const related = allInCategory
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Preview — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-[var(--tc-shadow-lg)] ring-1 ring-[var(--tc-gold)]/30">
            {product.template?.thumbnail_url ? (
              <Image
                src={product.template.thumbnail_url}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-[var(--tc-gray-50)]">
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
        </div>

        {/* Details */}
        <div className="lg:pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--tc-gray-500)]">
            {categoryLabel}
          </p>

          <h1 className="mt-2 font-heading text-3xl md:text-4xl font-semibold text-[var(--tc-black)] leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[var(--tc-black)] font-heading">
              from {formatPrice(product.price_pence)}
            </span>
            <span className="text-sm text-[var(--tc-gray-500)]">
              50 cards · envelopes included
            </span>
          </div>

          {product.description && (
            <p className="mt-6 text-[var(--tc-gray-700)] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Paper stocks as chips */}
          {availablePaperStocks.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-[var(--tc-gray-700)] uppercase tracking-[0.14em]">
                Paper
              </h3>
              <div className="mt-3 space-y-2">
                {availablePaperStocks.map((ps) => (
                  <div
                    key={ps.id}
                    className="rounded-lg border border-[var(--tc-gray-200)] bg-white p-3 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-md bg-[var(--tc-blush-light)] border border-[var(--tc-gray-200)] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--tc-black)]">
                        {ps.label}
                      </p>
                      <p className="text-xs text-[var(--tc-gray-500)] mt-0.5 leading-relaxed">
                        {ps.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions */}
          {product.template && (
            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-500)]">
                  Size
                </p>
                <p className="mt-1 text-sm text-[var(--tc-black)]">
                  {product.template.dimensions.width_mm} × {product.template.dimensions.height_mm}mm
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tc-gray-500)]">
                  Quantities
                </p>
                <p className="mt-1 text-sm text-[var(--tc-black)]">
                  {product.print_options.quantities[0]}–
                  {product.print_options.quantities[product.print_options.quantities.length - 1]}
                </p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-10 space-y-3">
            <Link
              href={`/editor/${product.slug}`}
              className="inline-flex items-center justify-center w-full rounded-md bg-[var(--tc-black)] px-8 py-4 text-sm font-medium text-white shadow-[var(--tc-shadow-sm)] hover:shadow-[var(--tc-shadow-md)] hover:bg-[var(--tc-gray-800)] transition-all duration-300"
            >
              Personalise this design
            </Link>
            <p className="text-xs text-center text-[var(--tc-gray-400)]">
              Free to personalise. Order a{" "}
              <span className="text-[var(--tc-gray-600)] font-medium">
                personalised sample from £5
              </span>{" "}
              before committing to your full print run.
            </p>
          </div>

          {/* Trust row */}
          <div className="mt-10 pt-8 border-t border-[var(--tc-gray-200)] grid grid-cols-3 gap-3">
            <TrustLine icon={<IconShield />} label="Secure checkout" />
            <TrustLine icon={<IconTruck />} label="Dispatch within 1 day" />
            <TrustLine icon={<IconLeafSmall />} label="FSC paper" />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 md:mt-28">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="tc-divider mb-3" />
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-[var(--tc-black)]">
                You might also love
              </h2>
            </div>
            {product.template?.category && (
              <Link
                href={`/category/${product.template.category}`}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[var(--tc-gray-600)] hover:text-[var(--tc-black)] transition-colors"
              >
                See all {categoryLabel.toLowerCase()}
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TrustLine({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="text-[var(--tc-sage)]">{icon}</div>
      <p className="text-[11px] text-[var(--tc-gray-500)] leading-tight">
        {label}
      </p>
    </div>
  );
}

function IconShield() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="13" height="10" rx="1" />
      <path d="M14 10h5l3 3v4h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function IconLeafSmall() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 8-6 14-14 14 0-8 6-14 14-14z" />
      <path d="M6 18c2-3 5-6 9-9" />
    </svg>
  );
}
