"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/lib/editor/store";
import { Button } from "@/components/ui/button";
import {
  approveDesignFromEditor,
  unlockDesignFromEditor,
  upsertDesign,
} from "@/app/(editor)/editor/actions";
import type { DesignSnapshot } from "@/app/(editor)/editor/actions";

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
  const setSavedDesignId = useEditorStore((s) => s.setSavedDesignId);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);
  const isAuthenticated = useEditorStore((s) => s.isAuthenticated);
  const designName = useEditorStore((s) => s.designName);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function currentSnapshot(): DesignSnapshot {
    return {
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
    };
  }

  function persistAnonymousSnapshotAndSignUp(redirectTo?: string) {
    if (typeof window === "undefined") return;
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
    window.sessionStorage.setItem(
      `tc:pending-design:${productSlug}`,
      JSON.stringify(snapshot)
    );
    const back = redirectTo || `/editor/${productSlug}`;
    router.push(`/register?redirect=${encodeURIComponent(back)}`);
  }

  /**
   * Ensure the design is saved + approved in the DB.
   * Returns the approved design's id, or null on failure.
   * Does NOT touch local state — callers decide whether to update the UI
   * (Save Design updates it; Order Prints leaves it alone because we're
   * navigating away).
   */
  async function ensureSavedAndApproved(): Promise<string | null> {
    let id = savedDesignId;
    if (!id) {
      const saveResult = await upsertDesign(currentSnapshot());
      if (!saveResult.ok || !saveResult.id) {
        setStatusError(saveResult.error || "Failed to save design");
        return null;
      }
      id = saveResult.id;
    }
    const result = await approveDesignFromEditor(id);
    if (!result.ok) {
      setStatusError(result.error || "Failed to save design");
      return null;
    }
    return id;
  }

  async function handleSaveDesign() {
    if (!isAuthenticated) {
      persistAnonymousSnapshotAndSignUp();
      return;
    }
    setStatusError(null);
    setSaveLoading(true);
    try {
      const id = await ensureSavedAndApproved();
      if (id) {
        // Stay in editor — update local state so the UI shows approved/locked
        if (!savedDesignId) {
          setSavedDesignId(id);
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("design", id);
            window.history.replaceState(null, "", url.toString());
          }
        }
        setLastSavedAt(new Date().toISOString());
        setSavedDesignStatus("approved");
        router.refresh();
      }
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleOrderPrints() {
    if (!isAuthenticated) {
      persistAnonymousSnapshotAndSignUp(
        `/order/${productSlug}/configure`
      );
      return;
    }
    setStatusError(null);
    setOrderLoading(true);
    try {
      const id = await ensureSavedAndApproved();
      if (!id) {
        setOrderLoading(false);
        return;
      }
      // Don't touch local state — we're navigating to the configure page.
      // Updating savedDesignStatus would swap this button to its Link variant
      // mid-click and disrupt the push.
      router.push(`/order/${productSlug}/configure?design=${id}`);
      // Leave orderLoading true until the component unmounts on navigation
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Failed to order");
      setOrderLoading(false);
    }
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
        {isAuthenticated && (
          <>
            <div className="h-4 w-px bg-[var(--tc-gray-200)]" />
            <Link
              href="/dashboard"
              className="text-sm text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] transition-colors"
            >
              Dashboard
            </Link>
          </>
        )}
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
        {!isAuthenticated && !isApproved && !isLocked && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--tc-gray-500)] bg-[var(--tc-blush-light)]/50 px-2 py-0.5 rounded-full">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            Not saved
          </span>
        )}
        {isAuthenticated && isSaving && (
          <span className="text-xs text-[var(--tc-gray-400)]">Saving...</span>
        )}
        {isAuthenticated && !isSaving && lastSavedAt && !isApproved && !isLocked && (
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
            Saved
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
        {!isApproved && !isLocked && !isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => persistAnonymousSnapshotAndSignUp()}
          >
            Sign Up to Save
          </Button>
        )}

        {!isApproved && !isLocked && isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDesign}
            loading={saveLoading}
            disabled={saveLoading || orderLoading}
          >
            Save Design
          </Button>
        )}

        {!isApproved && !isLocked && (
          <Button
            size="sm"
            onClick={handleOrderPrints}
            loading={orderLoading}
            disabled={saveLoading || orderLoading}
          >
            Order Prints
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
