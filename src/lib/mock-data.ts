import type { Product, Template } from "@/lib/types/database";
import { defaultColorPalettes, defaultFontOptions } from "@/lib/templates/defaults";

// Mock data for development before Supabase is connected
// Will be replaced with real DB queries

const mockTemplates: Template[] = [
  {
    id: "t1",
    name: "Sage Botanical",
    slug: "sage-botanical",
    category: "invitation",
    dimensions: { width_mm: 148, height_mm: 210, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#fafafa" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2",
    name: "Blush Minimal",
    slug: "blush-minimal",
    category: "invitation",
    dimensions: { width_mm: 148, height_mm: 210, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#fdf8f5" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3",
    name: "Classic Script",
    slug: "classic-script",
    category: "save-the-date",
    dimensions: { width_mm: 148, height_mm: 105, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#f5f8fa" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t4",
    name: "Botanical Garden",
    slug: "botanical-garden",
    category: "on-the-day",
    dimensions: { width_mm: 99, height_mm: 210, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#fafafa" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t5",
    name: "Simple Thanks",
    slug: "simple-thanks",
    category: "thank-you",
    dimensions: { width_mm: 105, height_mm: 148, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#fafafa" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t6",
    name: "Dusty Blue Elegance",
    slug: "dusty-blue-elegance",
    category: "invitation",
    dimensions: { width_mm: 127, height_mm: 178, bleed_mm: 3 },
    sections: [],
    color_palettes: defaultColorPalettes,
    font_options: defaultFontOptions,
    background: { type: "color", color: "#f5f8fa" },
    thumbnail_url: null,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = [
  {
    id: "p1",
    template_id: "t1",
    name: "Sage Botanical Invitation Suite",
    slug: "sage-botanical-invitation",
    description: "Elegant botanical-inspired invitation with sage green accents and delicate foliage details. Perfect for garden and outdoor weddings.",
    price_pence: 19500,
    print_options: { quantities: [25, 50, 75, 100], paper_stocks: ["cotton-350gsm", "silk-400gsm"] },
    is_digital_only: false,
    featured: true,
    sort_order: 1,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[0],
  },
  {
    id: "p2",
    template_id: "t2",
    name: "Blush Minimal Invitation",
    slug: "blush-minimal-invitation",
    description: "Clean, modern design with soft blush tones. A beautiful choice for contemporary weddings with a touch of warmth.",
    price_pence: 17500,
    print_options: { quantities: [25, 50, 75, 100], paper_stocks: ["cotton-350gsm", "textured-300gsm"] },
    is_digital_only: false,
    featured: true,
    sort_order: 2,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[1],
  },
  {
    id: "p3",
    template_id: "t3",
    name: "Classic Script Save the Date",
    slug: "classic-script-save-the-date",
    description: "Timeless calligraphy-style save the date with a refined dusty blue palette.",
    price_pence: 12500,
    print_options: { quantities: [25, 50, 75, 100], paper_stocks: ["cotton-350gsm"] },
    is_digital_only: false,
    featured: true,
    sort_order: 3,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[2],
  },
  {
    id: "p4",
    template_id: "t4",
    name: "Botanical Garden Order of the Day",
    slug: "botanical-garden-order-of-day",
    description: "A beautifully structured timeline card for your wedding day, with botanical illustrations.",
    price_pence: 9500,
    print_options: { quantities: [25, 50, 75, 100, 150], paper_stocks: ["silk-400gsm"] },
    is_digital_only: false,
    featured: false,
    sort_order: 4,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[3],
  },
  {
    id: "p5",
    template_id: "t5",
    name: "Simple Thanks Card",
    slug: "simple-thanks-card",
    description: "An understated thank you card that lets your gratitude shine through clean, elegant design.",
    price_pence: 8500,
    print_options: { quantities: [25, 50, 75, 100], paper_stocks: ["cotton-350gsm", "recycled-350gsm"] },
    is_digital_only: false,
    featured: false,
    sort_order: 5,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[4],
  },
  {
    id: "p6",
    template_id: "t6",
    name: "Dusty Blue Elegance Invitation",
    slug: "dusty-blue-elegance-invitation",
    description: "Sophisticated invitation design featuring a soft dusty blue colour palette with elegant serif typography.",
    price_pence: 21000,
    print_options: { quantities: [25, 50, 75, 100], paper_stocks: ["cotton-350gsm", "silk-400gsm", "textured-300gsm"] },
    is_digital_only: false,
    featured: true,
    sort_order: 6,
    status: "active",
    created_at: new Date().toISOString(),
    template: mockTemplates[5],
  },
];

export function getProducts(category?: string): Product[] {
  if (category) {
    return mockProducts.filter((p) => p.template?.category === category);
  }
  return mockProducts;
}

export function getProduct(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return mockProducts.filter((p) => p.featured);
}

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
