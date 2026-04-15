import { z } from "zod/v4";

export const sectionLayoutSchema = z.object({
  x_mm: z.number().min(0),
  width_mm: z.number().min(1),
  max_height_mm: z.number().min(1),
  gap_after_mm: z.number().min(0).default(5),
  alignment: z.enum(["left", "center", "right"]),
  sort_order: z.number().default(0),
  // Legacy
  y_mm: z.number().optional(),
  vertical_alignment: z.enum(["top", "center", "bottom"]).optional(),
});

export const sectionTypographySchema = z.object({
  font_key: z.string().min(1),
  size_pt: z.number().min(4).max(120),
  weight: z.number().min(100).max(900),
  line_height: z.number().min(0.8).max(3),
  letter_spacing: z.number().min(-0.1).max(1),
  color_key: z.string().min(1),
  transform: z.enum(["none", "uppercase", "lowercase"]),
});

export const sectionContentSchema = z.object({
  default_text: z.string(),
  required: z.boolean().default(true),
  max_length: z.number().min(1).max(1000),
  multiline: z.boolean(),
  max_lines: z.number().min(1).max(20),
  word_wrap: z.boolean().default(true),
  validation: z.string().optional(),
  help_text: z.string().optional(),
  // Legacy
  editable: z.boolean().optional(),
});

export const decorativeElementSchema = z.object({
  type: z.enum(["line", "flourish", "icon"]),
  asset_url: z.string().optional(),
  position: z.enum(["above", "below", "left", "right"]),
  offset_mm: z.number(),
  color_key: z.string(),
});

export const templateSectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1), // Free-text, not restricted to fixed types
  label: z.string().min(1),
  layout: sectionLayoutSchema,
  typography: sectionTypographySchema,
  content: sectionContentSchema,
  decorative_elements: z.array(decorativeElementSchema).optional(),
});

export const colorPaletteSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  colors: z.record(z.string(), z.string()),
});

export const fontOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  fonts: z.record(
    z.string(),
    z.object({
      family: z.string().min(1),
      weight: z.number().min(100).max(900),
    })
  ),
});

export const templateDimensionsSchema = z.object({
  width_mm: z.number().min(50).max(500),
  height_mm: z.number().min(50).max(500),
  bleed_mm: z.number().min(0).max(10),
});

export const templateBackgroundSchema = z.object({
  type: z.enum(["color", "image"]),
  color: z.string().optional(),
  image_url: z.string().optional(),
});

export const templateTextAreaSchema = z.object({
  y_start_mm: z.number().min(0).default(30),
  y_offset_mm: z.number().default(0),
  max_height_mm: z.number().min(10).default(140),
});

export const templateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  category: z.enum(["save-the-date", "invitation", "on-the-day", "thank-you"]),
  dimensions: templateDimensionsSchema,
  sections: z.array(templateSectionSchema).min(1),
  color_palettes: z.array(colorPaletteSchema).min(1).max(4),
  font_options: z.array(fontOptionSchema).min(1).max(3),
  background: templateBackgroundSchema.nullable(),
  text_area: templateTextAreaSchema.optional(),
  thumbnail_url: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export const productSchema = z.object({
  template_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  price_pence: z.number().int().min(100),
  print_options: z.object({
    quantities: z.array(z.number().int().min(1)),
    paper_stocks: z.array(z.string().min(1)),
  }),
  is_digital_only: z.boolean().default(false),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
});

export type TemplateInput = z.infer<typeof templateSchema>;
export type ProductInput = z.infer<typeof productSchema>;
