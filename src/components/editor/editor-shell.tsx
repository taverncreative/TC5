"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/editor/store";
import { useAutosave } from "@/lib/editor/use-autosave";
import { EditPanel } from "./edit-panel";
import { CanvasPreview } from "./canvas-preview";
import { EditorHeader } from "./editor-header";
import type { Template, ReverseBlock } from "@/lib/types/database";
import type { LoadSavedDesignPayload } from "@/lib/editor/types";
import { PageLoading } from "@/components/ui/loading";

interface AnonymousSnapshot {
  productSlug: string;
  name: string;
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

interface EditorShellProps {
  template: Template;
  productSlug: string;
  savedDesign?: LoadSavedDesignPayload | null;
  isAuthenticated: boolean;
}

export function EditorShell({
  template,
  productSlug,
  savedDesign,
  isAuthenticated,
}: EditorShellProps) {
  const isLoading = useEditorStore((s) => s.isLoading);
  const initializeFromTemplate = useEditorStore(
    (s) => s.initializeFromTemplate
  );
  const loadSavedDesign = useEditorStore((s) => s.loadSavedDesign);
  const setProductSlug = useEditorStore((s) => s.setProductSlug);
  const setIsAuthenticated = useEditorStore((s) => s.setIsAuthenticated);

  const setLoading = useEditorStore((s) => s.setLoading);

  useEffect(() => {
    // Reset to loading state immediately when product changes
    setLoading(true);
    setIsAuthenticated(isAuthenticated);
    setProductSlug(productSlug);
    if (savedDesign) {
      // Re-hydrate from the saved row, but still seed template-derived state first
      initializeFromTemplate(template);
      loadSavedDesign(savedDesign);
    } else {
      initializeFromTemplate(template);
      // After seeding from template, check sessionStorage for anonymous
      // work-in-progress from before sign-up and restore it (one-shot)
      if (isAuthenticated && typeof window !== "undefined") {
        const pendingKey = `tc:pending-design:${productSlug}`;
        const pending = window.sessionStorage.getItem(pendingKey);
        if (pending) {
          try {
            const parsed = JSON.parse(pending) as AnonymousSnapshot;
            if (parsed.productSlug === productSlug) {
              loadSavedDesign({
                id: "",
                name: parsed.name || `My ${template.name}`,
                status: "draft",
                sectionTexts: parsed.sectionTexts || {},
                selectedPaletteId: parsed.selectedPaletteId || "",
                selectedFontId: parsed.selectedFontId || "",
                accentColor: parsed.accentColor || "",
                nameLayout: parsed.nameLayout || "three-line",
                accentConnector: parsed.accentConnector ?? true,
                accentSingleLine: parsed.accentSingleLine ?? false,
                reverseEnabled: parsed.reverseEnabled ?? false,
                reverseBlocks: parsed.reverseBlocks || [],
              });
              // But we don't have a savedDesignId — reset that so first autosave
              // creates a fresh row owned by this new user.
              useEditorStore.setState({ savedDesignId: null });
            }
          } catch {
            // ignore bad JSON
          }
          window.sessionStorage.removeItem(pendingKey);
        }
      }
    }
  }, [
    template,
    productSlug,
    savedDesign,
    isAuthenticated,
    initializeFromTemplate,
    loadSavedDesign,
    setProductSlug,
    setIsAuthenticated,
    setLoading,
  ]);

  // Autosave hook — no-op until template is loaded
  useAutosave();

  const savedDesignStatus = useEditorStore((s) => s.savedDesignStatus);
  const isReadOnly = savedDesignStatus !== "draft";

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Content Editing */}
        <div className="w-[380px] flex-shrink-0 relative">
          <EditPanel />
          {isReadOnly && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-start justify-center pointer-events-auto">
              <div className="mt-16 max-w-[320px] rounded-lg border border-[var(--tc-gray-200)] bg-white shadow-sm p-4 text-center">
                <p className="text-sm font-medium text-[var(--tc-black)]">
                  {savedDesignStatus === "locked"
                    ? "This design has been sent to print"
                    : "Design approved"}
                </p>
                <p className="text-xs text-[var(--tc-gray-500)] mt-1">
                  {savedDesignStatus === "locked"
                    ? "Your design is locked and cannot be edited"
                    : "Unlock it above to make changes"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Canvas Preview */}
        <div className="flex-1">
          <CanvasPreview />
        </div>
      </div>
    </div>
  );
}
