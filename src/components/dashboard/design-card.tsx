"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  renameDesign,
  duplicateDesign,
  deleteDesign,
  unlockDesign,
} from "@/app/(dashboard)/dashboard/designs/actions";

export interface DesignCardData {
  id: string;
  name: string;
  status: "draft" | "approved" | "locked";
  updated_at: string;
  product?: {
    name: string;
    slug: string;
    template?: { thumbnail_url: string | null } | null;
  } | null;
}

interface DesignCardProps {
  design: DesignCardData;
}

export function DesignCard({ design }: DesignCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(design.name);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const canEdit = design.status === "draft";
  const canDelete = design.status === "draft";
  const badgeVariant =
    design.status === "locked"
      ? ("blush" as const)
      : design.status === "approved"
        ? ("sage" as const)
        : ("default" as const);

  const statusLabel =
    design.status === "locked"
      ? "Sent to Print"
      : design.status === "approved"
        ? "Approved"
        : "Draft";

  const editorHref = design.product?.slug
    ? `/editor/${design.product.slug}?design=${design.id}`
    : null;

  function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (trimmed === design.name) {
      setIsRenaming(false);
      return;
    }
    startTransition(async () => {
      const result = await renameDesign(design.id, trimmed);
      if (result.ok) {
        setIsRenaming(false);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  function handleDuplicate() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await duplicateDesign(design.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleUnlock() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await unlockDesign(design.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (!window.confirm(`Delete "${design.name}"? This cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteDesign(design.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <DesignThumb
          thumbnailUrl={design.product?.template?.thumbnail_url || null}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {isRenaming ? (
                <form onSubmit={handleRenameSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    autoFocus
                    maxLength={80}
                    className="flex-1 text-sm font-medium text-[var(--tc-black)] border-b border-[var(--tc-sage)] bg-transparent focus:outline-none"
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setNameDraft(design.name);
                        setIsRenaming(false);
                      }
                    }}
                  />
                </form>
              ) : (
                <p className="text-sm font-medium text-[var(--tc-black)] truncate">
                  {design.name}
                </p>
              )}
              <p className="text-xs text-[var(--tc-gray-400)] mt-0.5 truncate">
                {design.product?.name || "Design"}
              </p>
            </div>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>

          <p className="text-xs text-[var(--tc-gray-400)] mt-2">
            Updated {relativeTime(design.updated_at)}
          </p>

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {canEdit && editorHref && (
              <Link
                href={editorHref}
                className="text-xs font-medium text-[var(--tc-sage)] hover:underline"
              >
                Continue Editing
              </Link>
            )}
            {design.status === "approved" && (
              <>
                {design.product?.slug && (
                  <Link
                    href={`/order/${design.product.slug}/configure?design=${design.id}`}
                    className="text-xs font-semibold text-[var(--tc-black)] bg-[var(--tc-sage-light)]/60 hover:bg-[var(--tc-sage-light)] px-2 py-1 rounded"
                  >
                    Order Prints &rarr;
                  </Link>
                )}
                {editorHref && (
                  <Link
                    href={editorHref}
                    className="text-xs font-medium text-[var(--tc-gray-500)] hover:text-[var(--tc-black)] hover:underline"
                  >
                    View Proof
                  </Link>
                )}
              </>
            )}
            {design.status === "locked" && (
              <span className="text-xs text-[var(--tc-gray-400)]">
                Locked — sent to print
              </span>
            )}

            <div className="ml-auto relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={isPending}
                className="p-1.5 -m-1.5 rounded text-[var(--tc-gray-400)] hover:text-[var(--tc-black)] hover:bg-[var(--tc-gray-50)] disabled:opacity-50"
                aria-label="Design actions"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="5" cy="12" r="1.25" fill="currentColor" />
                  <circle cx="12" cy="12" r="1.25" fill="currentColor" />
                  <circle cx="19" cy="12" r="1.25" fill="currentColor" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-md border border-[var(--tc-gray-200)] bg-white shadow-sm z-10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRenaming(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--tc-gray-700)] hover:bg-[var(--tc-gray-50)]"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--tc-gray-700)] hover:bg-[var(--tc-gray-50)]"
                  >
                    Duplicate
                  </button>
                  {design.status === "approved" && (
                    <button
                      type="button"
                      onClick={handleUnlock}
                      className="w-full text-left px-3 py-2 text-xs text-[var(--tc-gray-700)] hover:bg-[var(--tc-gray-50)]"
                    >
                      Unlock to Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-[var(--tc-gray-100)]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DesignThumb({ thumbnailUrl }: { thumbnailUrl: string | null }) {
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl}
        alt=""
        className="w-16 h-20 rounded-md object-cover bg-[var(--tc-gray-100)] flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-16 h-20 rounded-md bg-[var(--tc-gray-100)] flex items-center justify-center flex-shrink-0">
      <svg
        className="w-6 h-6 text-[var(--tc-gray-400)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
