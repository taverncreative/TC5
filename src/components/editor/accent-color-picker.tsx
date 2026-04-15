"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/lib/editor/store";

/** Compute relative luminance from a hex colour (sRGB) */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Max luminance for a colour to print well on white card */
const MAX_LUMINANCE = 0.4;

interface ColorGroup {
  label: string;
  colors: { name: string; hex: string }[];
}

const CURATED_GROUPS: ColorGroup[] = [
  {
    label: "Pinks",
    colors: [
      { name: "Dusty Rose", hex: "#C08081" },
      { name: "Rosewood", hex: "#9E4244" },
      { name: "Mauve", hex: "#A26769" },
      { name: "Deep Blush", hex: "#B76E79" },
      { name: "Berry Pink", hex: "#8E3B46" },
    ],
  },
  {
    label: "Greens",
    colors: [
      { name: "Sage", hex: "#7A8F74" },
      { name: "Eucalyptus", hex: "#5F7D6E" },
      { name: "Olive", hex: "#6B7D3A" },
      { name: "Forest Green", hex: "#1F5A44" },
      { name: "Moss Green", hex: "#6C7A3E" },
    ],
  },
  {
    label: "Blues",
    colors: [
      { name: "Navy", hex: "#1A2A44" },
      { name: "Steel Blue", hex: "#3A5F7D" },
      { name: "Slate Blue", hex: "#4A5D73" },
      { name: "Dusty Blue", hex: "#5C7A99" },
      { name: "Midnight Blue", hex: "#191970" },
    ],
  },
  {
    label: "Reds & Warm Tones",
    colors: [
      { name: "Burgundy", hex: "#6D1F2F" },
      { name: "Wine", hex: "#722F37" },
      { name: "Terracotta", hex: "#C65D3B" },
      { name: "Rust", hex: "#A3472A" },
      { name: "Burnt Orange", hex: "#CC5500" },
    ],
  },
  {
    label: "Neutrals & Metallics",
    colors: [
      { name: "Taupe", hex: "#8B7D7B" },
      { name: "Warm Grey", hex: "#6E6A6B" },
      { name: "Cocoa Brown", hex: "#6F4E37" },
      { name: "Antique Gold", hex: "#B8962E" },
      { name: "Bronze", hex: "#8C6239" },
    ],
  },
];

function Swatch({
  hex,
  name,
  isSelected,
  onClick,
}: {
  hex: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className={`w-7 h-7 rounded-full border-2 transition-all ${
        isSelected
          ? "border-[var(--tc-sage)] ring-2 ring-[var(--tc-sage)] ring-offset-1"
          : "border-[var(--tc-gray-200)] hover:border-[var(--tc-gray-400)]"
      }`}
      style={{ backgroundColor: hex }}
    />
  );
}

export function AccentColorPicker() {
  const template = useEditorStore((s) => s.template);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const accentColor = useEditorStore((s) => s.accentColor);
  const setAccentColor = useEditorStore((s) => s.setAccentColor);

  // "From The Design" — dark-enough colours from the selected palette
  const designColors = useMemo(() => {
    if (!template) return [];
    const palette = template.color_palettes.find((p) => p.id === selectedPaletteId) || template.color_palettes[0];
    if (!palette) return [];

    const seen = new Set<string>();
    const result: { name: string; hex: string }[] = [];

    for (const [key, hex] of Object.entries(palette.colors)) {
      const normalised = hex.toLowerCase();
      if (seen.has(normalised)) continue;
      seen.add(normalised);
      if (relativeLuminance(hex) <= MAX_LUMINANCE) {
        result.push({ name: key.charAt(0).toUpperCase() + key.slice(1), hex });
      }
      if (result.length >= 5) break;
    }
    return result;
  }, [template, selectedPaletteId]);

  if (!template) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--tc-gray-700)] mb-3">
        Accent Colour
      </label>

      {/* From The Design */}
      {designColors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-[var(--tc-gray-500)] mb-1.5">From The Design</p>
          <div className="flex gap-2 flex-wrap">
            {designColors.map((c) => (
              <Swatch
                key={c.hex}
                hex={c.hex}
                name={c.name}
                isSelected={accentColor.toLowerCase() === c.hex.toLowerCase()}
                onClick={() => setAccentColor(c.hex)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Curated groups */}
      {CURATED_GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="text-xs text-[var(--tc-gray-500)] mb-1.5">{group.label}</p>
          <div className="flex gap-2 flex-wrap">
            {group.colors.map((c) => (
              <Swatch
                key={c.hex}
                hex={c.hex}
                name={c.name}
                isSelected={accentColor.toLowerCase() === c.hex.toLowerCase()}
                onClick={() => setAccentColor(c.hex)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
