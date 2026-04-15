"use client";

import { useEditorStore } from "@/lib/editor/store";

export function FontPicker() {
  const template = useEditorStore((s) => s.template);
  const selectedFontId = useEditorStore((s) => s.selectedFontId);
  const setSelectedFont = useEditorStore((s) => s.setSelectedFont);

  if (!template || template.font_options.length <= 1) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tc-gray-700)] mb-2">
        Font Style
      </label>
      <div className="space-y-2">
        {template.font_options.map((fontOption) => {
          const isSelected = fontOption.id === selectedFontId;
          const headingFont = fontOption.fonts["heading"];
          const bodyFont = fontOption.fonts["body"];

          return (
            <button
              key={fontOption.id}
              type="button"
              onClick={() => setSelectedFont(fontOption.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                isSelected
                  ? "border-[var(--tc-sage)] bg-[var(--tc-sage-light)]/20"
                  : "border-[var(--tc-gray-200)] hover:border-[var(--tc-gray-300)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-base"
                    style={{
                      fontFamily: `"${headingFont?.family || "Figtree"}", serif`,
                      fontWeight: headingFont?.weight || 400,
                    }}
                  >
                    {fontOption.name}
                  </p>
                  <p
                    className="text-xs text-[var(--tc-gray-500)] mt-0.5"
                    style={{
                      fontFamily: `"${bodyFont?.family || "Nunito"}", sans-serif`,
                      fontWeight: bodyFont?.weight || 300,
                    }}
                  >
                    {headingFont?.family} + {bodyFont?.family}
                  </p>
                </div>
                {isSelected && (
                  <svg
                    className="h-4 w-4 text-[var(--tc-sage)]"
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
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
