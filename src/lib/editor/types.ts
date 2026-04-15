import type { Template, TemplateSection, ColorPalette, FontOption, ReverseBlock } from "@/lib/types/database";

export interface EditorState {
  template: Template | null;
  productSlug: string;

  // Customer customization
  sectionTexts: Record<string, string>; // section id -> text
  selectedPaletteId: string;
  selectedFontId: string;

  // Names layout & accent colour
  nameLayout: "single-line" | "three-line";
  setNameLayout: (value: "single-line" | "three-line") => void;
  accentConnector: boolean; // three-line: accent on & line
  setAccentConnector: (value: boolean) => void;
  accentSingleLine: boolean; // single-line: accent on full names line
  setAccentSingleLine: (value: boolean) => void;
  accentColor: string; // hex colour for the accent (e.g. "&" in names)
  setAccentColor: (color: string) => void;

  // Reverse side
  currentSide: "front" | "back";
  setCurrentSide: (side: "front" | "back") => void;
  reverseEnabled: boolean;
  setReverseEnabled: (enabled: boolean) => void;
  reverseBlocks: ReverseBlock[];
  setReverseBlocks: (blocks: ReverseBlock[]) => void;
  addReverseBlock: (type: "text" | "qr") => void;
  removeReverseBlock: (id: string) => void;
  updateReverseBlock: (id: string, updates: Partial<ReverseBlock>) => void;

  // UI state
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  activeSection: string | null;

  // Persistence
  savedDesignId: string | null;
  designName: string;
  savedDesignStatus: "draft" | "approved" | "locked";
  /** When false, autosave is disabled and UI shows "Sign up to save" */
  isAuthenticated: boolean;

  // Actions
  setTemplate: (template: Template) => void;
  setProductSlug: (slug: string) => void;
  setSectionText: (sectionId: string, text: string) => void;
  setSelectedPalette: (paletteId: string) => void;
  setSelectedFont: (fontId: string) => void;
  setActiveSection: (sectionId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (time: string) => void;
  setSavedDesignId: (id: string | null) => void;
  setDesignName: (name: string) => void;
  setSavedDesignStatus: (status: "draft" | "approved" | "locked") => void;
  setIsAuthenticated: (value: boolean) => void;
  initializeFromTemplate: (template: Template) => void;
  loadSavedDesign: (payload: LoadSavedDesignPayload) => void;
}

export interface LoadSavedDesignPayload {
  id: string;
  name: string;
  status: "draft" | "approved" | "locked";
  sectionTexts: Record<string, string>;
  selectedPaletteId: string;
  selectedFontId: string;
  accentColor: string;
  nameLayout: "single-line" | "three-line";
  accentConnector: boolean;
  accentSingleLine: boolean;
  reverseEnabled: boolean;
  reverseBlocks: ReverseBlock[];
}

// Layout engine types
export interface LayoutInput {
  template: Template;
  sectionTexts: Record<string, string>;
  selectedPaletteId: string;
  selectedFontId: string;
  targetDPI: number; // 72 for screen, 300 for print
  accentConnector?: boolean; // three-line: accent on & line
  accentSingleLine?: boolean; // single-line: accent on full names line
  nameLayout?: "single-line" | "three-line";
  accentColor?: string; // hex colour override for accent
}

export interface LayoutOutput {
  canvas: {
    width_px: number;
    height_px: number;
  };
  bleed: {
    top_px: number;
    right_px: number;
    bottom_px: number;
    left_px: number;
  };
  background: {
    type: "color" | "image";
    color?: string;
    image_url?: string;
  };
  sections: LayoutSectionOutput[];
}

export interface LayoutSectionOutput {
  id: string;
  type: string;
  bounds: {
    x_px: number;
    y_px: number;
    width_px: number;
    height_px: number;
  };
  text: {
    content: string;
    fontFamily: string;
    fontSize_px: number;
    fontWeight: number;
    lineHeight_px: number;
    letterSpacing_px: number;
    color: string;
    textTransform: "none" | "uppercase" | "lowercase";
    alignment: "left" | "center" | "right";
  };
  overflow: boolean;
  // Per-line colour overrides (e.g. accent colour on the & line in names)
  lineColorOverrides?: Record<number, string>;
  // Inline accent: colour a specific character within the text (e.g. "&" in single-line names)
  inlineAccent?: { match: string; color: string };
  // Stroke width in points (e.g. 0.3 for names)
  strokePt?: number;
}
