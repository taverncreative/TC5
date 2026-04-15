import type { Template } from "@/lib/types/database";
import { getDefaultSections } from "@/lib/templates/defaults";
import { defaultColorPalettes, defaultFontOptions } from "@/lib/templates/defaults";
import { getProduct } from "@/lib/mock-data";
import * as db from "@/lib/db/products";

/**
 * Returns a full template with sections for the editor.
 * Tries Supabase first, falls back to mock data.
 */
export async function getEditorTemplate(productSlug: string): Promise<Template | null> {
  // Try Supabase first
  try {
    const product = await db.getProduct(productSlug);
    if (product?.template) {
      const template = product.template;
      // Ensure sections are populated
      if (!template.sections || template.sections.length === 0) {
        template.sections = getDefaultSections(template.category);
      }
      if (!template.color_palettes || template.color_palettes.length === 0) {
        template.color_palettes = defaultColorPalettes;
      }
      if (!template.font_options || template.font_options.length === 0) {
        template.font_options = defaultFontOptions;
      }
      return template;
    }
  } catch {
    // Fall through to mock
  }

  // Fallback to mock data
  const mockProduct = getProduct(productSlug);
  if (!mockProduct || !mockProduct.template) return null;

  const template = mockProduct.template;
  if (template.sections.length === 0) {
    template.sections = getDefaultSections(template.category);
  }
  if (template.color_palettes.length === 0) {
    template.color_palettes = defaultColorPalettes;
  }
  if (template.font_options.length === 0) {
    template.font_options = defaultFontOptions;
  }
  return template;
}
