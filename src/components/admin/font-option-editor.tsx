"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FontOption } from "@/lib/types/database";

const AVAILABLE_FONTS = [
  "Nunito", "Figtree", "Playfair Display", "Cormorant Garamond",
  "Josefin Sans", "Libre Baskerville", "Great Vibes", "Alex Brush",
  "Montserrat", "Lora",
];

interface FontOptionEditorProps {
  fontOptions: FontOption[];
  onChange: (options: FontOption[]) => void;
}

export function FontOptionEditor({ fontOptions, onChange }: FontOptionEditorProps) {
  function updateOption(index: number, updates: Partial<FontOption>) {
    const updated = [...fontOptions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function updateFont(optionIndex: number, fontKey: string, field: "family" | "weight", value: string | number) {
    const updated = [...fontOptions];
    updated[optionIndex] = {
      ...updated[optionIndex],
      fonts: {
        ...updated[optionIndex].fonts,
        [fontKey]: {
          ...updated[optionIndex].fonts[fontKey],
          [field]: value,
        },
      },
    };
    onChange(updated);
  }

  function addOption() {
    if (fontOptions.length >= 3) return;
    onChange([
      ...fontOptions,
      {
        id: `font-${Date.now()}`,
        name: "New Font Style",
        fonts: {
          heading: { family: "Playfair Display", weight: 400 },
          body: { family: "Nunito", weight: 300 },
        },
      },
    ]);
  }

  function removeOption(index: number) {
    onChange(fontOptions.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {fontOptions.map((option, i) => (
        <div key={option.id} className="border border-[var(--tc-gray-200)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <Input
              id={`font-${i}-name`}
              value={option.name}
              onChange={(e) => updateOption(i, { name: e.target.value })}
              className="w-48"
              placeholder="Style name"
            />
            {fontOptions.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(option.fonts).map(([key, font]) => (
              <div key={key} className="space-y-2">
                <p className="text-xs font-medium text-[var(--tc-gray-600)] capitalize">{key} Font</p>
                <select
                  value={font.family}
                  onChange={(e) => updateFont(i, key, "family", e.target.value)}
                  className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm"
                >
                  {AVAILABLE_FONTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <Input
                  id={`font-${i}-${key}-weight`}
                  label="Weight"
                  type="number"
                  value={font.weight}
                  onChange={(e) => updateFont(i, key, "weight", Number(e.target.value))}
                  min={100}
                  max={900}
                  step={100}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {fontOptions.length < 3 && (
        <Button variant="outline" size="sm" onClick={addOption}>
          Add Font Style
        </Button>
      )}
    </div>
  );
}
