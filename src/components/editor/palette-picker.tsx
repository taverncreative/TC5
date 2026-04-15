"use client";

import { useEditorStore } from "@/lib/editor/store";

export function PalettePicker() {
  const template = useEditorStore((s) => s.template);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const setSelectedPalette = useEditorStore((s) => s.setSelectedPalette);

  if (!template || template.color_palettes.length <= 1) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tc-gray-700)] mb-2">
        Colour Palette
      </label>
      <div className="space-y-2">
        {template.color_palettes.map((palette) => {
          const isSelected = palette.id === selectedPaletteId;
          const colorValues = Object.values(palette.colors);

          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => setSelectedPalette(palette.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-[var(--tc-sage)] bg-[var(--tc-sage-light)]/20"
                  : "border-[var(--tc-gray-200)] hover:border-[var(--tc-gray-300)]"
              }`}
            >
              {/* Colour swatches */}
              <div className="flex gap-1">
                {colorValues.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-[var(--tc-gray-200)]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-sm text-[var(--tc-gray-700)]">
                {palette.name}
              </span>
              {isSelected && (
                <svg
                  className="ml-auto h-4 w-4 text-[var(--tc-sage)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
