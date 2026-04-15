"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ColorPalette } from "@/lib/types/database";

interface PaletteEditorProps {
  palettes: ColorPalette[];
  onChange: (palettes: ColorPalette[]) => void;
}

export function PaletteEditor({ palettes, onChange }: PaletteEditorProps) {
  function updatePalette(index: number, updates: Partial<ColorPalette>) {
    const updated = [...palettes];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  function updateColor(paletteIndex: number, colorKey: string, value: string) {
    const updated = [...palettes];
    updated[paletteIndex] = {
      ...updated[paletteIndex],
      colors: { ...updated[paletteIndex].colors, [colorKey]: value },
    };
    onChange(updated);
  }

  function addPalette() {
    if (palettes.length >= 4) return;
    onChange([
      ...palettes,
      {
        id: `palette-${Date.now()}`,
        name: "New Palette",
        colors: { primary: "#1a1a1a", secondary: "#6b7280", accent: "#a3b18a", background: "#fafafa" },
      },
    ]);
  }

  function removePalette(index: number) {
    onChange(palettes.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {palettes.map((palette, i) => (
        <div key={palette.id} className="border border-[var(--tc-gray-200)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <Input
              id={`palette-${i}-name`}
              value={palette.name}
              onChange={(e) => updatePalette(i, { name: e.target.value })}
              className="w-48"
              placeholder="Palette name"
            />
            {palettes.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removePalette(i)}>
                Remove
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {Object.entries(palette.colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(i, key, e.target.value)}
                  className="h-8 w-8 rounded border border-[var(--tc-gray-300)] cursor-pointer"
                />
                <div>
                  <p className="text-xs font-medium text-[var(--tc-gray-600)]">{key}</p>
                  <p className="text-xs text-[var(--tc-gray-400)]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {palettes.length < 4 && (
        <Button variant="outline" size="sm" onClick={addPalette}>
          Add Palette
        </Button>
      )}
    </div>
  );
}
