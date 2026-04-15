"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/lib/editor/store";
import { useAutosave } from "@/lib/editor/use-autosave";
import { EditPanel } from "./edit-panel";
import { CanvasPreview } from "./canvas-preview";
import { EditorHeader } from "./editor-header";
import type { Template } from "@/lib/types/database";
import type { LoadSavedDesignPayload } from "@/lib/editor/types";
import { PageLoading } from "@/components/ui/loading";

interface EditorShellProps {
  template: Template;
  productSlug: string;
  savedDesign?: LoadSavedDesignPayload | null;
}

export function EditorShell({
  template,
  productSlug,
  savedDesign,
}: EditorShellProps) {
  const isLoading = useEditorStore((s) => s.isLoading);
  const initializeFromTemplate = useEditorStore(
    (s) => s.initializeFromTemplate
  );
  const loadSavedDesign = useEditorStore((s) => s.loadSavedDesign);
  const setProductSlug = useEditorStore((s) => s.setProductSlug);

  const setLoading = useEditorStore((s) => s.setLoading);

  useEffect(() => {
    // Reset to loading state immediately when product changes
    // This prevents the old design from flashing before the new one loads
    setLoading(true);
    setProductSlug(productSlug);
    if (savedDesign) {
      // Re-hydrate from the saved row, but still seed template-derived state first
      initializeFromTemplate(template);
      loadSavedDesign(savedDesign);
    } else {
      initializeFromTemplate(template);
    }
  }, [
    template,
    productSlug,
    savedDesign,
    initializeFromTemplate,
    loadSavedDesign,
    setProductSlug,
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
