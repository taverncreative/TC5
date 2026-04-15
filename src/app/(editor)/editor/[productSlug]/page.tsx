import { notFound } from "next/navigation";
import { getEditorTemplate } from "@/lib/mock-data-editor";
import { getShopProduct } from "@/lib/db/queries";
import { EditorShell } from "@/components/editor/editor-shell";
import { loadDesign } from "@/app/(editor)/editor/actions";
import type { LoadSavedDesignPayload } from "@/lib/editor/types";

interface EditorPageProps {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<{ design?: string }>;
}

export async function generateMetadata({ params }: EditorPageProps) {
  const { productSlug } = await params;
  const product = await getShopProduct(productSlug);
  if (!product) return {};
  return {
    title: `Personalise ${product.name}`,
  };
}

export default async function EditorPage({ params, searchParams }: EditorPageProps) {
  const { productSlug } = await params;
  const { design: designId } = await searchParams;

  const template = await getEditorTemplate(productSlug);
  if (!template) notFound();

  let savedDesign: LoadSavedDesignPayload | null = null;
  if (designId) {
    const result = await loadDesign(designId);
    if (result.ok && result.design.productSlug === productSlug) {
      savedDesign = {
        id: result.design.id,
        name: result.design.name,
        status: result.design.status,
        sectionTexts: result.design.sectionTexts,
        selectedPaletteId: result.design.selectedPaletteId,
        selectedFontId: result.design.selectedFontId,
        accentColor: result.design.accentColor,
        nameLayout: result.design.nameLayout,
        accentConnector: result.design.accentConnector,
        accentSingleLine: result.design.accentSingleLine,
        reverseEnabled: result.design.reverseEnabled,
        reverseBlocks: result.design.reverseBlocks,
      };
    }
  }

  return (
    <EditorShell
      key={`${productSlug}-${designId ?? "new"}`}
      template={template}
      productSlug={productSlug}
      savedDesign={savedDesign}
    />
  );
}
