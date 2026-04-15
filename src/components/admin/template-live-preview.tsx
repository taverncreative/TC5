"use client";

import { useRef, useEffect, useCallback } from "react";
import { computeLayout, SCREEN_DPI } from "@/lib/editor/layout-engine";
import type { Template, TemplateSection, TemplateTextArea, ColorPalette, FontOption, TemplateBackground } from "@/lib/types/database";
import type { LayoutOutput } from "@/lib/editor/types";

interface TemplateLivePreviewProps {
  name: string;
  slug: string;
  category: string;
  dimensions: { width_mm: number; height_mm: number; bleed_mm: number };
  sections: TemplateSection[];
  colorPalettes: ColorPalette[];
  fontOptions: FontOption[];
  background: TemplateBackground | null;
  textArea?: TemplateTextArea;
  thumbnailUrl?: string | null;
}

export function TemplateLivePreview({
  name,
  slug,
  category,
  dimensions,
  sections,
  colorPalettes,
  fontOptions,
  background,
  textArea,
  thumbnailUrl,
}: TemplateLivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const render = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const renderDPI = SCREEN_DPI * dpr;

    // Build a template object for the layout engine
    const template: Template = {
      id: "",
      name,
      slug,
      category: category as Template["category"],
      dimensions,
      sections,
      color_palettes: colorPalettes,
      font_options: fontOptions,
      background,
      text_area: textArea || { y_start_mm: 30, y_offset_mm: 0, max_height_mm: 140 },
      thumbnail_url: null,
      status: "draft",
      created_at: "",
      updated_at: "",
    };

    // Use default text from sections
    const sectionTexts: Record<string, string> = {};
    sections.forEach((s) => {
      let text = s.content.default_text;
      if (s.type === "names") {
        if (s.content.multiline && !text.includes("\n")) {
          // Split "Name1 & Name2" into 3 lines for the layout engine
          const match = text.match(/^(.+?)\s*(&)\s*(.+)$/);
          if (match) {
            text = `${match[1].trim()}\n${match[2]}\n${match[3].trim()}`;
          }
        } else if (!s.content.multiline && text.includes("\n")) {
          // Merge 3 lines back into single line: "Name1 & Name2"
          text = text.split("\n").filter(Boolean).join(" ");
        }
      }
      sectionTexts[s.id] = text;
    });

    const layout = computeLayout({
      template,
      sectionTexts,
      selectedPaletteId: colorPalettes[0]?.id || "",
      selectedFontId: fontOptions[0]?.id || "",
      targetDPI: renderDPI,
      accentColor: colorPalettes[0]?.colors["accent"] || colorPalettes[0]?.colors["primary"] || "#1a1a1a",
    });

    const cssW = (dimensions.width_mm / 25.4) * SCREEN_DPI;
    const cssH = (dimensions.height_mm / 25.4) * SCREEN_DPI;

    const canvas = canvasRef.current;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Background
    const bgColor = background?.type === "color" && background.color ? background.color : "#ffffff";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssW, cssH);

    const ta = textArea || { y_start_mm: 30, y_offset_mm: 0, max_height_mm: 140 };

    // Background image if slug matches a known design
    const bgPath = getBackgroundImagePath(slug + "-invitation") || getBackgroundImagePath(slug);
    if (bgPath) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cssW, cssH);
        drawTextAreaGuide(ctx, ta, dimensions, dpr);
        renderText(ctx, layout, dpr);
      };
      img.src = bgPath;
    } else {
      drawTextAreaGuide(ctx, ta, dimensions, dpr);
      renderText(ctx, layout, dpr);
    }
  }, [name, slug, category, dimensions, sections, colorPalettes, fontOptions, background, textArea]);

  useEffect(() => {
    if (typeof document === "undefined") { render(); return; }

    // Explicitly trigger loading of all fonts used by the template
    // (canvas text alone doesn't trigger @font-face downloads)
    const families = new Set<string>();
    fontOptions.forEach((fo) => {
      Object.values(fo.fonts).forEach((f) => families.add(f.family));
    });
    const loadPromises = Array.from(families).map((family) =>
      document.fonts.load(`400 16px "${family}"`).catch(() => {})
    );
    Promise.all(loadPromises).then(() => document.fonts.ready).then(() => render());
  }, [render, fontOptions]);

  const cssW = (dimensions.width_mm / 25.4) * SCREEN_DPI;
  const cssH = (dimensions.height_mm / 25.4) * SCREEN_DPI;

  // Scale to fit the sticky panel
  const containerW = 360;
  const scale = Math.min(containerW / cssW, 1);

  return (
    <div ref={containerRef} className="sticky top-8">
      <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">Live Preview</h3>
      <div
        className="shadow-lg rounded-sm border border-[var(--tc-gray-200)] overflow-hidden"
        style={{
          width: cssW * scale,
          height: cssH * scale,
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            width: cssW,
            height: cssH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--tc-gray-400)]">
        {dimensions.width_mm} x {dimensions.height_mm}mm
      </p>

      {/* Design thumbnail for reference */}
      {thumbnailUrl && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--tc-black)] mb-3">Design Reference</h3>
          <div
            className="rounded-sm border border-[var(--tc-gray-200)] overflow-hidden"
            style={{ width: cssW * scale }}
          >
            <img
              src={thumbnailUrl}
              alt="Design reference"
              className="w-full h-auto"
            />
          </div>
          <p className="mt-1 text-xs text-[var(--tc-gray-400)]">
            Original PDF proof — match your live preview to this
          </p>
        </div>
      )}
    </div>
  );
}

function drawTextAreaGuide(
  ctx: CanvasRenderingContext2D,
  textArea: { y_start_mm: number; y_offset_mm: number; max_height_mm: number },
  dimensions: { width_mm: number; height_mm: number },
  dpr: number
) {
  const MM_PER_INCH = 25.4;
  const toCSS = (mm: number) => (mm / MM_PER_INCH) * SCREEN_DPI;

  const startY = toCSS(textArea.y_start_mm + textArea.y_offset_mm);
  const maxH = toCSS(textArea.max_height_mm);
  const fullW = toCSS(dimensions.width_mm);

  // Start line (blue, dashed)
  ctx.save();
  ctx.strokeStyle = "rgba(66, 133, 244, 0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, startY);
  ctx.lineTo(fullW, startY);
  ctx.stroke();

  // Max height boundary (red, dashed)
  ctx.strokeStyle = "rgba(234, 67, 53, 0.5)";
  ctx.beginPath();
  ctx.moveTo(0, startY + maxH);
  ctx.lineTo(fullW, startY + maxH);
  ctx.stroke();

  // Fill the text area zone with a very subtle tint
  ctx.fillStyle = "rgba(66, 133, 244, 0.03)";
  ctx.fillRect(0, startY, fullW, maxH);

  // Labels
  ctx.font = "9px Montserrat, sans-serif";
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(66, 133, 244, 0.6)";
  ctx.fillText("▲ text start", 4, startY - 2);
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(234, 67, 53, 0.6)";
  ctx.fillText("▼ max height", 4, startY + maxH + 2);

  ctx.setLineDash([]);
  ctx.restore();
}

function renderText(ctx: CanvasRenderingContext2D, layout: LayoutOutput, dpr: number) {
  for (const section of layout.sections) {
    const { bounds, text } = section;

    const bx = bounds.x_px / dpr;
    const by = bounds.y_px / dpr;
    const bw = bounds.width_px / dpr;
    const fontSize = text.fontSize_px / dpr;
    const lineHeight = text.lineHeight_px / dpr;
    const letterSpacing = text.letterSpacing_px / dpr;

    ctx.save();
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontWeight} ${fontSize}px "${text.fontFamily}", "Montserrat", sans-serif`;
    ctx.textBaseline = "top";

    let textX = bx;
    if (text.alignment === "center") {
      ctx.textAlign = "center";
      textX = bx + bw / 2;
    } else if (text.alignment === "right") {
      ctx.textAlign = "right";
      textX = bx + bw;
    } else {
      ctx.textAlign = "left";
    }

    const lines = text.content.split("\n");
    let currentY = by;

    for (const line of lines) {
      if (letterSpacing > 0.5) {
        drawSpacedText(ctx, line, textX, currentY, letterSpacing, text.alignment, bw);
      } else {
        ctx.fillText(line, textX, currentY);
      }
      currentY += lineHeight;
    }

    // Section bounds outline (helpful for positioning)
    ctx.strokeStyle = "rgba(163, 177, 138, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(bx, by, bw, bounds.height_px / dpr);
    ctx.setLineDash([]);

    ctx.restore();
  }
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  alignment: string,
  boundsWidth: number
) {
  const chars = text.split("");
  let totalWidth = 0;
  for (const char of chars) {
    totalWidth += ctx.measureText(char).width + spacing;
  }
  totalWidth -= spacing;

  let startX = x;
  if (alignment === "center") startX = x - totalWidth / 2;
  else if (alignment === "right") startX = x - totalWidth;

  const savedAlign = ctx.textAlign;
  ctx.textAlign = "left";
  let currentX = startX;
  for (const char of chars) {
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
  ctx.textAlign = savedAlign;
}

// Import shared background image lookup
import { getBackgroundImagePath } from "@/lib/editor/background-images";
