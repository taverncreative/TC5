import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopProduct } from "@/lib/db/queries";
import { loadDesign } from "@/app/(editor)/editor/actions";
import { ConfigureForm } from "./configure-form";
import { Button } from "@/components/ui/button";

interface ConfigurePageProps {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ design?: string; sample?: string }>;
}

export const metadata = { title: "Order Prints" };

export default async function ConfigurePage({
  params,
  searchParams,
}: ConfigurePageProps) {
  const { productSlug } = await params;
  const { design: designId } = await searchParams;

  const product = await getShopProduct(productSlug);
  if (!product) notFound();

  // If a design id was supplied, load and verify it's approved for this product
  let design: Awaited<ReturnType<typeof loadDesign>> | null = null;
  if (designId) {
    design = await loadDesign(designId);
  }

  // Block order unless the supplied design is approved AND for this product
  const designOk =
    design !== null &&
    design.ok &&
    design.design.productSlug === productSlug &&
    design.design.status === "approved";

  if (designId && !designOk) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="text-center">
          <span className="tc-divider mb-4" />
          <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
            Not quite ready to order
          </h1>
          <p className="mt-3 text-sm text-[var(--tc-gray-500)] leading-relaxed max-w-md mx-auto">
            {design && design.ok && design.design.status !== "approved"
              ? "Approve your proof in the editor before placing an order."
              : "We couldn't find the design you tried to order. Open it in the editor and approve it first."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/dashboard/designs">
              <Button variant="outline" size="sm">
                Back to My Designs
              </Button>
            </Link>
            {design && design.ok && (
              <Link href={`/editor/${productSlug}?design=${designId}`}>
                <Button size="sm">Open Editor</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no design supplied, allow configuring but we must still require a
  // design at checkout time — warn inline in the form.
  const loadedDesign = designOk && design && design.ok ? design.design : null;
  const thumbnailUrl = product.template?.thumbnail_url ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-2">
        <span className="tc-divider mb-4" />
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[var(--tc-black)]">
          Review &amp; order
        </h1>
        <p className="mt-3 text-sm text-[var(--tc-gray-500)]">
          {product.name}
        </p>
      </div>

      <ConfigureForm
        productSlug={productSlug}
        designId={loadedDesign?.id ?? null}
        productName={loadedDesign?.name || product.name}
        thumbnailUrl={thumbnailUrl}
      />
    </div>
  );
}
