import type { Template, TemplateSection, ColorPalette, FontOption } from "@/lib/types/database";
import type { LayoutInput, LayoutOutput, LayoutSectionOutput } from "./types";

/**
 * THE LAYOUT ENGINE - Single source of truth.
 *
 * Both the canvas preview and PDF generator consume this output.
 * All positioning is computed here. Renderers never compute positions.
 *
 * V2: Dynamic flow layout - sections stack vertically, pushing each other down.
 * Word wrapping supported via measureText callback.
 */

const MM_PER_INCH = 25.4;

function mmToPx(mm: number, dpi: number): number {
  return (mm / MM_PER_INCH) * dpi;
}

function ptToPx(pt: number, dpi: number): number {
  return (pt / 72) * dpi;
}

function resolvePalette(palettes: ColorPalette[], selectedId: string): ColorPalette | undefined {
  return palettes.find((p) => p.id === selectedId) || palettes[0];
}

function resolveFontOption(fontOptions: FontOption[], selectedId: string): FontOption | undefined {
  return fontOptions.find((f) => f.id === selectedId) || fontOptions[0];
}

function resolveColor(palette: ColorPalette | undefined, colorKey: string): string {
  if (!palette) return "#1a1a1a";
  return palette.colors[colorKey] || palette.colors["primary"] || "#1a1a1a";
}

function resolveFontFamily(fontOption: FontOption | undefined, fontKey: string): { family: string; weight: number } {
  if (!fontOption) return { family: "Montserrat", weight: 400 };
  const font = fontOption.fonts[fontKey];
  if (!font) {
    const firstKey = Object.keys(fontOption.fonts)[0];
    return fontOption.fonts[firstKey] || { family: "Montserrat", weight: 400 };
  }
  return font;
}

function applyTextTransform(text: string, transform: "none" | "uppercase" | "lowercase"): string {
  switch (transform) {
    case "uppercase": return text.toUpperCase();
    case "lowercase": return text.toLowerCase();
    default: return text;
  }
}

/**
 * Word wrapping: splits text into lines that fit within widthPx.
 * Uses a measureText callback so it works in both canvas and PDF contexts.
 */
function wrapText(
  text: string,
  widthPx: number,
  measureTextWidth: (text: string) => number
): string[] {
  const manualLines = text.split("\n");
  const wrappedLines: string[] = [];

  for (const manualLine of manualLines) {
    if (manualLine.trim() === "") {
      wrappedLines.push("");
      continue;
    }

    const words = manualLine.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = measureTextWidth(testLine);

      if (testWidth > widthPx && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines;
}

/**
 * Text width estimation when no canvas measureText is available.
 * Uses character-class widths relative to font size.
 */
function estimateTextWidth(text: string, fontSizePx: number, letterSpacingPx: number): number {
  let totalWidth = 0;
  for (const char of text) {
    if (char === " ") {
      totalWidth += fontSizePx * 0.3;
    } else if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      // Uppercase letters are wider - especially M, W, &
      if ("MW&".includes(char)) {
        totalWidth += fontSizePx * 0.85;
      } else if ("IJTL".includes(char)) {
        totalWidth += fontSizePx * 0.45;
      } else {
        totalWidth += fontSizePx * 0.7;
      }
    } else {
      // Lowercase
      if ("mw".includes(char)) {
        totalWidth += fontSizePx * 0.7;
      } else if ("ijtl".includes(char)) {
        totalWidth += fontSizePx * 0.3;
      } else {
        totalWidth += fontSizePx * 0.5;
      }
    }
    totalWidth += letterSpacingPx;
  }
  return totalWidth;
}

export function computeLayout(input: LayoutInput): LayoutOutput {
  const { template, sectionTexts, selectedPaletteId, selectedFontId, targetDPI, accentConnector = true, accentSingleLine = false, nameLayout = "three-line", accentColor } = input;

  const palette = resolvePalette(template.color_palettes, selectedPaletteId);
  const fontOption = resolveFontOption(template.font_options, selectedFontId);

  const canvas = {
    width_px: mmToPx(template.dimensions.width_mm, targetDPI),
    height_px: mmToPx(template.dimensions.height_mm, targetDPI),
  };

  const bleed_px = mmToPx(template.dimensions.bleed_mm, targetDPI);
  const bleed = { top_px: bleed_px, right_px: bleed_px, bottom_px: bleed_px, left_px: bleed_px };

  const background = template.background || { type: "color" as const, color: "#ffffff" };
  const resolvedBackground = {
    type: background.type,
    color: background.type === "color" ? background.color || resolveColor(palette, "background") : undefined,
    image_url: background.type === "image" ? background.image_url : undefined,
  };

  // Text area config (with defaults for legacy templates)
  const textArea = template.text_area || { y_start_mm: 0, y_offset_mm: 0, max_height_mm: template.dimensions.height_mm };

  // Sort sections by sort_order (or fallback to array order)
  const sortedSections = [...template.sections].sort((a, b) => {
    const orderA = a.layout.sort_order ?? 0;
    const orderB = b.layout.sort_order ?? 0;
    return orderA - orderB;
  });

  // PASS 1: Compute each section's resolved properties and height
  const textAreaStart_px = mmToPx(textArea.y_start_mm + textArea.y_offset_mm, targetDPI);
  const maxTotalHeight_px = mmToPx(textArea.max_height_mm, targetDPI);

  interface SectionMeasurement {
    section: typeof sortedSections[0];
    lines: string[];
    renderedHeight_px: number;
    sectionHeight_px: number;
    gap_px: number;
    fontSize_px: number;
    lineHeight_px: number;
    letterSpacing_px: number;
    widthPx: number;
    maxHeight_px: number;
    x_px: number;
    resolvedFont: { family: string; weight: number };
    resolvedColor: string;
    overflow: boolean;
    yOffset_px: number;
  }

  const measurements: SectionMeasurement[] = sortedSections.map((section) => {
    const { layout, typography, content } = section;

    const resolvedFont = resolveFontFamily(fontOption, typography.font_key);
    const resolvedColor = (typography.color_key === "accent" && accentColor)
      ? accentColor
      : resolveColor(palette, typography.color_key);
    const fontSize_px = ptToPx(typography.size_pt, targetDPI);
    const lineHeight_px = fontSize_px * typography.line_height;
    const letterSpacing_px = fontSize_px * typography.letter_spacing;
    const widthPx = mmToPx(layout.width_mm, targetDPI);
    const maxHeight_px = mmToPx(layout.max_height_mm, targetDPI);
    const x_px = mmToPx(layout.x_mm, targetDPI);
    const gap_px = mmToPx(layout.gap_after_mm ?? 5, targetDPI);
    const yOffset_px = mmToPx(layout.y_mm || 0, targetDPI);

    const rawText = sectionTexts[section.id] || content.default_text;
    const displayText = applyTextTransform(rawText, typography.transform);

    // Auto-shrink + wrap logic:
    // 1. Try original size - if single line fits, use it
    // 2. If too wide, shrink font down to 70% minimum
    // 3. If still too wide at 70%, wrap to multiple lines at the shrunk size
    let actualFontSize_px = fontSize_px;
    let actualLineHeight_px = lineHeight_px;
    let actualLetterSpacing_px = letterSpacing_px;
    let lines: string[];

    const minShrinkRatio = 0.5;
    const manualLines = displayText.split("\n");

    // Check if any manual line exceeds width at original size
    const measureAtSize = (size: number, ls: number) => (t: string) => estimateTextWidth(t, size, ls);
    const anyLineExceedsWidth = manualLines.some(
      (line) => estimateTextWidth(line, fontSize_px, letterSpacing_px) > widthPx
    );

    if (anyLineExceedsWidth) {
      // Try shrinking font to fit on one line per manual break
      let shrinkRatio = 1.0;
      while (shrinkRatio >= minShrinkRatio) {
        const testSize = fontSize_px * shrinkRatio;
        const testLS = letterSpacing_px * shrinkRatio;
        const stillExceeds = manualLines.some(
          (line) => estimateTextWidth(line, testSize, testLS) > widthPx
        );
        if (!stillExceeds) break;
        shrinkRatio -= 0.05;
      }

      if (shrinkRatio >= minShrinkRatio) {
        // Shrinking was enough - use shrunk size, no additional wrapping
        actualFontSize_px = fontSize_px * shrinkRatio;
        actualLineHeight_px = actualFontSize_px * typography.line_height;
        actualLetterSpacing_px = actualFontSize_px * typography.letter_spacing;
        lines = manualLines;
      } else {
        // Hit minimum shrink - use 70% size, keep manual line breaks only
        // Customer controls where lines break, not the engine
        actualFontSize_px = fontSize_px * minShrinkRatio;
        actualLineHeight_px = actualFontSize_px * typography.line_height;
        actualLetterSpacing_px = actualFontSize_px * typography.letter_spacing;
        lines = manualLines;
      }
    } else if (content.word_wrap) {
      // Normal word wrap at original size
      const measureFn = measureAtSize(fontSize_px, letterSpacing_px);
      lines = wrapText(displayText, widthPx, measureFn);
    } else {
      lines = manualLines;
    }

    const renderedHeight_px = lines.length * actualLineHeight_px;
    const sectionHeight_px = Math.min(renderedHeight_px, maxHeight_px);
    const overflow = renderedHeight_px > maxHeight_px;

    return {
      section, lines, renderedHeight_px, sectionHeight_px, gap_px,
      fontSize_px: actualFontSize_px,
      lineHeight_px: actualLineHeight_px,
      letterSpacing_px: actualLetterSpacing_px,
      widthPx, maxHeight_px,
      x_px, resolvedFont, resolvedColor, overflow, yOffset_px,
    };
  });

  // PASS 2: Compute total content height (all sections + gaps)
  let totalContentHeight_px = 0;
  measurements.forEach((m, i) => {
    totalContentHeight_px += m.sectionHeight_px;
    if (i < measurements.length - 1) {
      totalContentHeight_px += m.gap_px;
    }
  });

  // Centre the text block vertically within the text area
  const centreOffset_px = Math.max(0, (maxTotalHeight_px - totalContentHeight_px) / 2);
  let currentY_px = textAreaStart_px + centreOffset_px;

  // PASS 3: Assign Y positions
  const sections: LayoutSectionOutput[] = measurements.map((m) => {
    const y_px = currentY_px + m.yOffset_px;

    const result: LayoutSectionOutput = {
      id: m.section.id,
      type: m.section.type,
      bounds: {
        x_px: m.x_px,
        y_px,
        width_px: m.widthPx,
        height_px: m.maxHeight_px,
      },
      text: {
        content: m.lines.join("\n"),
        fontFamily: m.resolvedFont.family,
        fontSize_px: m.fontSize_px,
        fontWeight: m.section.typography.weight || m.resolvedFont.weight,
        lineHeight_px: m.lineHeight_px,
        letterSpacing_px: m.letterSpacing_px,
        color: m.resolvedColor,
        textTransform: m.section.typography.transform,
        alignment: m.section.layout.alignment,
      },
      overflow: m.overflow,
    };

    // Names section: accent colour (independent toggles per mode) + stroke
    if (m.section.type === "names") {
      const color = accentColor || resolveColor(palette, "accent");
      if (nameLayout === "three-line" && m.lines.length === 3 && accentConnector) {
        result.lineColorOverrides = { 1: color };
      } else if (nameLayout === "single-line" && accentSingleLine) {
        result.lineColorOverrides = { 0: color };
      }
      result.strokePt = 0.3;
    }

    currentY_px += m.sectionHeight_px + m.gap_px;
    return result;
  });

  // Global overflow: total content exceeds max height
  const globalOverflow = totalContentHeight_px > maxTotalHeight_px;
  if (globalOverflow) {
    // Mark the last section as overflowing to signal the issue
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      lastSection.overflow = true;
    }
  }

  return { canvas, bleed, background: resolvedBackground, sections };
}

// Screen preview DPI (for browser canvas rendering)
// 150 base * 2x Retina = 300 effective DPI - crisp text
export const SCREEN_DPI = 150;

// Print DPI
export const PROOF_DPI = 150;
export const PRINT_DPI = 300;
