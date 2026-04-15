import { create } from "zustand";
import type { Template, ReverseBlock } from "@/lib/types/database";
import type { EditorState } from "./types";
import { formatWeddingDate } from "./date-format";

export const useEditorStore = create<EditorState>((set) => ({
  template: null,
  productSlug: "",

  sectionTexts: {},
  selectedPaletteId: "",
  selectedFontId: "",

  nameLayout: "three-line",
  setNameLayout: (value) => set({ nameLayout: value }),
  accentConnector: true,
  setAccentConnector: (value) => set({ accentConnector: value }),
  accentSingleLine: false,
  setAccentSingleLine: (value) => set({ accentSingleLine: value }),
  accentColor: "",
  setAccentColor: (color) => set({ accentColor: color }),

  currentSide: "front",
  setCurrentSide: (side) => set({ currentSide: side }),
  reverseEnabled: false,
  setReverseEnabled: (enabled) => set({ reverseEnabled: enabled }),
  reverseBlocks: [],
  setReverseBlocks: (blocks) => set({ reverseBlocks: blocks }),
  addReverseBlock: (type) =>
    set((state) => {
      if (state.reverseBlocks.length >= 4) return state;
      const block: ReverseBlock = {
        id: `block-${Date.now()}`,
        type,
        header: type === "qr" ? "RSVP" : "",
        body: "",
        ...(type === "qr" ? { qrUrl: "" } : {}),
      };
      return { reverseBlocks: [...state.reverseBlocks, block] };
    }),
  removeReverseBlock: (id) =>
    set((state) => ({
      reverseBlocks: state.reverseBlocks.filter((b) => b.id !== id),
    })),
  updateReverseBlock: (id, updates) =>
    set((state) => ({
      reverseBlocks: state.reverseBlocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  isLoading: true,
  isSaving: false,
  lastSavedAt: null,
  activeSection: null,

  savedDesignId: null,
  designName: "",
  savedDesignStatus: "draft",
  isAuthenticated: false,

  setTemplate: (template) => set({ template }),
  setProductSlug: (slug) => set({ productSlug: slug }),

  setSectionText: (sectionId, text) =>
    set((state) => ({
      sectionTexts: { ...state.sectionTexts, [sectionId]: text },
    })),

  setSelectedPalette: (paletteId) => set({ selectedPaletteId: paletteId }),
  setSelectedFont: (fontId) => set({ selectedFontId: fontId }),
  setActiveSection: (sectionId) => set({ activeSection: sectionId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setLastSavedAt: (time) => set({ lastSavedAt: time }),
  setSavedDesignId: (id) => set({ savedDesignId: id }),
  setDesignName: (name) => set({ designName: name }),
  setSavedDesignStatus: (status) => set({ savedDesignStatus: status }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  loadSavedDesign: (payload) =>
    set({
      savedDesignId: payload.id,
      designName: payload.name,
      savedDesignStatus: payload.status,
      sectionTexts: payload.sectionTexts,
      selectedPaletteId: payload.selectedPaletteId,
      selectedFontId: payload.selectedFontId,
      accentColor: payload.accentColor,
      nameLayout: payload.nameLayout,
      accentConnector: payload.accentConnector,
      accentSingleLine: payload.accentSingleLine,
      reverseEnabled: payload.reverseEnabled,
      reverseBlocks: payload.reverseBlocks,
      currentSide: "front",
      activeSection: null,
      isLoading: false,
      lastSavedAt: new Date().toISOString(),
    }),

  initializeFromTemplate: (template: Template) => {
    // Derive name layout from the names section config
    const namesSection = template.sections.find((s) => s.type === "names");
    const nameLayout: "single-line" | "three-line" =
      namesSection && !namesSection.content.multiline ? "single-line" : "three-line";

    const sectionTexts: Record<string, string> = {};
    template.sections.forEach((section) => {
      let text = section.content.default_text;
      // In single-line mode, merge any newlines in names default text
      if (section.type === "names" && nameLayout === "single-line" && text.includes("\n")) {
        text = text.split("\n").filter(Boolean).join(" ");
      }
      // Default event_date to today's date
      if (section.type === "event_date") {
        const today = new Date();
        const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        text = formatWeddingDate(iso);
      }
      sectionTexts[section.id] = text;
    });

    // Initialize accent colour from first palette
    const firstPalette = template.color_palettes[0];
    const accentColor = firstPalette?.colors["accent"] || firstPalette?.colors["primary"] || "#1a1a1a";

    set({
      template,
      sectionTexts,
      selectedPaletteId: firstPalette?.id || "",
      selectedFontId: template.font_options[0]?.id || "",
      nameLayout,
      accentConnector: nameLayout === "three-line",
      accentSingleLine: false,
      accentColor,
      // Reset reverse side state
      currentSide: "front",
      reverseEnabled: false,
      reverseBlocks: [],
      // Reset UI state
      activeSection: null,
      isLoading: false,
      // Reset persistence — new design, not yet saved
      savedDesignId: null,
      designName: `My ${template.name}`,
      savedDesignStatus: "draft",
      isSaving: false,
      lastSavedAt: null,
    });
  },
}));
