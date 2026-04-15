"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/editor/store";
import { renderPrintCanvas, renderBackPrintCanvas } from "@/lib/editor/render-print";
import { Button } from "@/components/ui/button";
import {
  approveDesignFromEditor,
  unlockDesignFromEditor,
} from "@/app/(editor)/editor/actions";

export function EditorHeader() {
  const template = useEditorStore((s) => s.template);
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const productSlug = useEditorStore((s) => s.productSlug);
  const sectionTexts = useEditorStore((s) => s.sectionTexts);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const selectedFontId = useEditorStore((s) => s.selectedFontId);
  const accentColor = useEditorStore((s) => s.accentColor);
  const nameLayout = useEditorStore((s) => s.nameLayout);
  const accentConnector = useEditorStore((s) => s.accentConnector);
  const accentSingleLine = useEditorStore((s) => s.accentSingleLine);
  const currentSide = useEditorStore((s) => s.currentSide);
  const setCurrentSide = useEditorStore((s) => s.setCurrentSide);
  const reverseEnabled = useEditorStore((s) => s.reverseEnabled);
  const reverseBlocks = useEditorStore((s) => s.reverseBlocks);
  const savedDesignId = useEditorStore((s) => s.savedDesignId);
  const savedDesignStatus = useEditorStore((s) => s.savedDesignStatus);
  const setSavedDesignStatus = useEditorStore((s) => s.setSavedDesignStatus);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handlePreviewPdf() {
    if (!template) return;
    setGeneratingPdf(true);
    try {
      // Render design at 300 DPI on client canvas (uses correct browser fonts)
      const rasterBlob = await renderPrintCanvas({
        template,
        productSlug,
        sectionTexts,
        selectedPaletteId,
        selectedFontId,
        accentColor,
        nameLayout,
        accentConnector,
        accentSingleLine,
      });

      // Render back side if enabled
      let backBlob: Blob | null = null;
      if (reverseEnabled && reverseBlocks.length > 0) {
        backBlob = await renderBackPrintCanvas(
          template.dimensions.width_mm,
          template.dimensions.height_mm,
          reverseBlocks,
          accentColor
        );
      }

      // Send rasterized PNG(s) to server to wrap in PDF with bleed + crop marks
      const formData = new FormData();
      formData.append("raster", rasterBlob, "design.png");
      if (backBlob) formData.append("rasterBack", backBlob, "back.png");
      formData.append("productSlug", productSlug);
      formData.append("widthMm", String(template.dimensions.width_mm));
      formData.append("heightMm", String(template.dimensions.height_mm));
      formData.append("bleedMm", String(template.dimensions.bleed_mm || 3));

      const response = await fetch("/api/pdf/proof", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("PDF preview error:", error);
      alert("Failed to generate PDF preview. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  }

  function handleApprove() {
    if (!savedDesignId) {
      setStatusError("Make at least one change so we can save your design first");
      return;
    }
    setStatusError(null);
    startTransition(async () => {
      const result = await approveDesignFromEditor(savedDesignId);
      if (result.ok) {
        setSavedDesignStatus("approved");
        router.refresh();
      } else {
        setStatusError(result.error || "Failed to approve");
      }
    });
  }

  function handleUnlock() {
    if (!savedDesignId) return;
    setStatusError(null);
    startTransition(async () => {
      const result = await unlockDesignFromEditor(savedDesignId);
      if (result.ok) {
        setSavedDesignStatus("draft");
        router.refresh();
      } else {
        setStatusError(result.error || "Failed to unlock");
      }
    });
  }

  const isApproved = savedDesignStatus === "approved";
  const isLocked = savedDesignStatus === "locked";
  const orderHref = savedDesignId
    ? `/order/${productSlug}/configure?design=${savedDesignId}`
    : `/order/${productSlug}/configure`;

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-[var(--tc-gray-200)] bg-white flex-shrink-0">
      <div className="flex items-center gap-4">
        <Link
          href={`/products/${productSlug}`}
          className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors"
        >
          &larr; Back
        </Link>
        <div className="h-4 w-px bg-[var(--tc-gray-200)]" />
        <span className="text-sm font-medium text-[var(--tc-black)]">
          {template?.name}
        </span>
        {reverseEnabled && (
          <>
            <div className="h-4 w-px bg-[var(--tc-gray-200)]" />
            <div className="flex rounded-md border border-[var(--tc-gray-300)] overflow-hidden">
              <button
                type="button"
                onClick={() => setCurrentSide("front")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  currentSide === "front"
                    ? "bg-[var(--tc-sage)] text-white"
                    : "bg-white text-[var(--tc-gray-500)] hover:bg-[var(--tc-gray-100)]"
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setCurrentSide("back")}
                className={`px-3 py-1 text-xs font-medium transition-colors border-l border-[var(--tc-gray-300)] ${
                  currentSide === "back"
                    ? "bg-[var(--tc-sage)] text-white"
                    : "bg-white text-[var(--tc-gray-500)] hover:bg-[var(--tc-gray-100)]"
                }`}
              >
                Back
              </button>
            </div>
          </>
        )}
        {isSaving && (
          <span className="text-xs text-[var(--tc-gray-400)]">Saving...</span>
        )}
        {!isSaving && lastSavedAt && !isApproved && !isLocked && (
          <span className="text-xs text-[var(--tc-gray-400)]">Saved</span>
        )}
        {isApproved && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--tc-sage)] bg-[var(--tc-sage-light)]/40 px-2 py-0.5 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            Approved
          </span>
        )}
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--tc-gray-500)] bg-[var(--tc-gray-100)] px-2 py-0.5 rounded-full">
            Locked — sent to print
          </span>
        )}
        {statusError && (
          <span className="text-xs text-red-600">{statusError}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviewPdf}
          loading={generatingPdf}
        >
          Preview PDF
        </Button>

        {!isApproved && !isLocked && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleApprove}
            loading={isPending}
            disabled={!savedDesignId}
          >
            Approve Design
          </Button>
        )}

        {isApproved && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlock}
              loading={isPending}
            >
              Unlock to Edit
            </Button>
            <Link href={orderHref}>
              <Button size="sm">Order Prints</Button>
            </Link>
          </>
        )}

        {isLocked && (
          <Link href="/dashboard/orders">
            <Button size="sm" variant="outline">
              View Order
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
