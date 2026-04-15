"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/editor/store";
import { upsertDesign } from "@/app/(editor)/editor/actions";

const DEBOUNCE_MS = 1500;

/**
 * Watches editor state and persists changes to Supabase after a debounce.
 *
 * Behaviour:
 * - Skips saves when nothing has actually changed (content-hash guard).
 * - Debounces at 1.5s after the last change.
 * - Creates a saved_design row on the first real edit, then updates thereafter.
 * - Updates the URL with ?design=<id> after first save so a refresh reopens it.
 */
export function useAutosave() {
  const template = useEditorStore((s) => s.template);
  const productSlug = useEditorStore((s) => s.productSlug);
  const isLoading = useEditorStore((s) => s.isLoading);
  const savedDesignId = useEditorStore((s) => s.savedDesignId);
  const savedDesignStatus = useEditorStore((s) => s.savedDesignStatus);
  const designName = useEditorStore((s) => s.designName);
  const sectionTexts = useEditorStore((s) => s.sectionTexts);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const selectedFontId = useEditorStore((s) => s.selectedFontId);
  const accentColor = useEditorStore((s) => s.accentColor);
  const nameLayout = useEditorStore((s) => s.nameLayout);
  const accentConnector = useEditorStore((s) => s.accentConnector);
  const accentSingleLine = useEditorStore((s) => s.accentSingleLine);
  const reverseEnabled = useEditorStore((s) => s.reverseEnabled);
  const reverseBlocks = useEditorStore((s) => s.reverseBlocks);

  const setSaving = useEditorStore((s) => s.setSaving);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);
  const setSavedDesignId = useEditorStore((s) => s.setSavedDesignId);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHashRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!template || !productSlug) return;
    // Don't save approved/locked designs — they're read-only
    if (savedDesignStatus !== "draft") return;

    // Compute a stable hash of the content (excluding save-bookkeeping fields)
    const snapshot = {
      productSlug,
      name: designName,
      sectionTexts,
      selectedPaletteId,
      selectedFontId,
      accentColor,
      nameLayout,
      accentConnector,
      accentSingleLine,
      reverseEnabled,
      reverseBlocks,
    };
    const hash = JSON.stringify(snapshot);

    // If this is the first time we've seen this content, seed the baseline
    // (don't auto-save a freshly opened editor or freshly loaded design)
    if (lastSavedHashRef.current === null) {
      lastSavedHashRef.current = hash;
      return;
    }

    // Nothing actually changed — skip
    if (lastSavedHashRef.current === hash) return;

    // Schedule a debounced save
    if (timerRef.current) clearTimeout(timerRef.current);

    const pendingHash = hash;
    timerRef.current = setTimeout(async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setSaving(true);

      const result = await upsertDesign({
        id: savedDesignId,
        productSlug,
        name: designName,
        sectionTexts,
        selectedPaletteId,
        selectedFontId,
        accentColor,
        nameLayout,
        accentConnector,
        accentSingleLine,
        reverseEnabled,
        reverseBlocks,
      });

      setSaving(false);
      inFlightRef.current = false;

      if (result.ok && result.id) {
        lastSavedHashRef.current = pendingHash;
        if (!savedDesignId) {
          setSavedDesignId(result.id);
          // Reflect the new id in the URL (no reload)
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("design", result.id);
            window.history.replaceState(null, "", url.toString());
          }
        }
        if (result.savedAt) setLastSavedAt(result.savedAt);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    isLoading,
    template,
    productSlug,
    savedDesignId,
    savedDesignStatus,
    designName,
    sectionTexts,
    selectedPaletteId,
    selectedFontId,
    accentColor,
    nameLayout,
    accentConnector,
    accentSingleLine,
    reverseEnabled,
    reverseBlocks,
    setSaving,
    setLastSavedAt,
    setSavedDesignId,
  ]);

  // Reset baseline whenever the editor switches to a different template / design
  useEffect(() => {
    lastSavedHashRef.current = null;
  }, [template?.id, savedDesignId]);
}
