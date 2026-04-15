import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopProduct } from "@/lib/db/queries";
import { loadDesign } from "@/app/(editor)/editor/actions";
import { ConfigureForm } from "./configure-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConfigurePageProps {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ design?: string }>;
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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
          Design not ready to order
        </h1>
        <p className="mt-2 text-sm text-[var(--tc-gray-500)]">
          {design && design.ok && design.design.status !== "approved"
            ? "Approve your proof in the editor before placing an order."
            : "We couldn't find the design you tried to order. Open it in the editor and approve it first."}
        </p>
        <div className="mt-6 flex gap-3">
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
    );
  }

  // If no design supplied, allow configuring but we must still require a
  // design at checkout time — warn inline in the form.
  const loadedDesign = designOk && design && design.ok ? design.design : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
        Order Prints
      </h1>
      <p className="mt-1 text-sm text-[var(--tc-gray-500)]">{product.name}</p>

      {loadedDesign && (
        <Card className="mt-6 bg-[var(--tc-sage-light)]/20 border-[var(--tc-sage-light)]">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-[var(--tc-sage)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--tc-black)] truncate">
                {loadedDesign.name}
              </p>
              <p className="text-xs text-[var(--tc-gray-500)]">
                Proof approved — ready to print
              </p>
            </div>
          </div>
        </Card>
      )}

      <ConfigureForm
        productSlug={productSlug}
        designId={loadedDesign?.id ?? null}
      />
    </div>
  );
}
