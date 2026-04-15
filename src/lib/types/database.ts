export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  partner_name_1: string | null;
  partner_name_2: string | null;
  wedding_date: string | null; // ISO date string
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory = "save-the-date" | "invitation" | "on-the-day" | "thank-you";
export type TemplateStatus = "draft" | "active" | "archived";

export interface TemplateDimensions {
  width_mm: number;
  height_mm: number;
  bleed_mm: number;
}

export interface TemplateSection {
  id: string;
  type: string; // free-text, e.g. "names", "venue", "rsvp", "custom"
  label: string;
  layout: {
    x_mm: number;
    width_mm: number;
    max_height_mm: number;
    gap_after_mm: number; // space between this section and next
    alignment: "left" | "center" | "right";
    sort_order: number; // vertical stacking order (lower = higher on page)
    // Legacy field - kept for backward compat during migration
    y_mm?: number;
    vertical_alignment?: "top" | "center" | "bottom";
  };
  typography: {
    font_key: string;
    size_pt: number;
    weight: number;
    line_height: number;
    letter_spacing: number;
    color_key: string;
    transform: "none" | "uppercase" | "lowercase";
  };
  content: {
    default_text: string;
    required: boolean; // customer must fill this in
    max_length: number;
    multiline: boolean;
    max_lines: number;
    word_wrap: boolean; // auto-wrap text at width boundary
    validation?: string;
    help_text?: string;
    // Legacy field
    editable?: boolean;
  };
  decorative_elements?: Array<{
    type: "line" | "flourish" | "icon";
    asset_url?: string;
    position: "above" | "below" | "left" | "right";
    offset_mm: number;
    color_key: string;
  }>;
}

export interface TemplateTextArea {
  y_start_mm: number; // where the text block starts vertically
  y_offset_mm: number; // shift entire text block up/down
  max_height_mm: number; // cap total height of all sections combined
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: Record<string, string>; // key -> hex
}

export interface FontOption {
  id: string;
  name: string;
  fonts: Record<string, { family: string; weight: number }>; // key -> font config
}

export interface TemplateBackground {
  type: "color" | "image";
  color?: string;
  image_url?: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  dimensions: TemplateDimensions;
  sections: TemplateSection[];
  color_palettes: ColorPalette[];
  font_options: FontOption[];
  background: TemplateBackground | null;
  text_area: TemplateTextArea;
  thumbnail_url: string | null;
  status: TemplateStatus;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface PrintOptions {
  quantities: number[];
  paper_stocks: string[];
}

export interface Product {
  id: string;
  template_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_pence: number;
  print_options: PrintOptions;
  is_digital_only: boolean;
  featured: boolean;
  sort_order: number;
  status: ProductStatus;
  created_at: string;
  // Joined
  template?: Template;
}

// Reverse side block (standardised across all single card designs)
export interface ReverseBlock {
  id: string;
  type: "text" | "qr";
  header: string;   // e.g. "WHERE TO STAY", "RSVP"
  body: string;      // paragraph text or sub-label for QR
  qrUrl?: string;    // URL to encode (qr type only)
}

export type CustomizationStatus = "draft" | "proof_generated" | "proof_approved" | "locked";

export interface CustomizationSectionsData {
  [sectionId: string]: { text: string };
}

export interface Customization {
  id: string;
  product_id: string;
  session_token: string;
  customer_id: string | null;
  sections_data: CustomizationSectionsData;
  selected_palette: string;
  selected_fonts: string;
  accent_color: string | null;
  name_layout: "single-line" | "three-line";
  accent_connector: boolean;
  accent_single_line: boolean;
  reverse_enabled: boolean;
  reverse_blocks: ReverseBlock[];
  proof_pdf_url: string | null;
  status: CustomizationStatus;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "pending"
  | "printing"
  | "completed"
  | "cancelled"
  // Legacy values kept for backward compat
  | "payment_complete"
  | "in_production"
  | "shipped"
  | "delivered";

export interface PrintConfig {
  quantity: number;
  paper_stock: string;
}

export interface Order {
  id: string;
  customer_id: string;
  customization_id: string;
  product_id: string;
  status: OrderStatus;
  print_config: PrintConfig;
  final_pdf_url: string | null;
  total_pence: number;
  shipping_address: Record<string, string> | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  order_number: string | null;
  include_reverse: boolean;
  notes: string | null;
  saved_design_id: string | null;
  // Joined
  product?: Product;
  customization?: Customization;
  saved_design?: SavedDesign;
}

export type SavedDesignStatus = "draft" | "approved" | "locked";

export interface SavedDesign {
  id: string;
  customer_id: string;
  product_id: string;
  name: string;
  sections_data: CustomizationSectionsData;
  selected_palette: string;
  selected_fonts: string;
  accent_color: string | null;
  name_layout: "single-line" | "three-line";
  accent_connector: boolean;
  accent_single_line: boolean;
  reverse_enabled: boolean;
  reverse_blocks: ReverseBlock[];
  proof_pdf_url: string | null;
  status: SavedDesignStatus;
  created_at: string;
  updated_at: string;
  // Joined
  product?: Product;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
