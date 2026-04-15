export const SITE_NAME = "Tavern Creative";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BRAND = {
  colors: {
    black: "#1a1a1a",
    white: "#fafafa",
    sage: "#a3b18a",
    blush: "#e8cfc0",
    dustyBlue: "#8eaec2",
    sageLight: "#c8d5b9",
    blushLight: "#f3e4da",
  },
} as const;

export const PRODUCT_CATEGORIES = [
  { slug: "save-the-date", label: "Save the Dates" },
  { slug: "invitation", label: "Invitations" },
  { slug: "on-the-day", label: "On the Day" },
  { slug: "thank-you", label: "Thank You Cards" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["slug"];

export const PAPER_STOCKS = [
  {
    id: "fedrigoni-old-mill-300gsm",
    label: "300gsm Fedrigoni Old Mill Bianco",
    description: "Lightly textured, off white card. FSC certified and responsibly sourced.",
  },
] as const;

// Quantity-based pricing for single card invitations (pence)
export const INVITATION_PRICING: Record<number, number> = {
  0: 500,     // Personalised Sample
  10: 2400,
  20: 2800,
  30: 3300,
  40: 3700,
  50: 4100,
  60: 4500,
  70: 4900,
  80: 5500,
  90: 5900,
  100: 6100,
  110: 6300,
  120: 6600,
  130: 7000,
  140: 7400,
  150: 7800,
};

export const PRINT_QUANTITIES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150] as const;

export function getPriceForQuantity(quantity: number): number {
  return INVITATION_PRICING[quantity] || 0;
}

export const TEMPLATE_DIMENSIONS = {
  A5: { width_mm: 148, height_mm: 210, label: "A5 (148 x 210mm)" },
  A6: { width_mm: 105, height_mm: 148, label: "A6 (105 x 148mm)" },
  DL: { width_mm: 99, height_mm: 210, label: "DL (99 x 210mm)" },
  square: { width_mm: 148, height_mm: 148, label: "Square (148 x 148mm)" },
  "5x7": { width_mm: 127, height_mm: 178, label: '5x7" (127 x 178mm)' },
} as const;

export const SECTION_TYPES = [
  "names",
  "invitation_line",
  "details",
  "schedule",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];
