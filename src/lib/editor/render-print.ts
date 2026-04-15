import { computeLayout } from "./layout-engine";
import type { Template, ReverseBlock } from "@/lib/types/database";
import type { LayoutOutput } from "./types";

import { SCREEN_DPI } from "./layout-engine";
import { getBackgroundImagePath } from "./background-images";
const PRINT_DPI = 300;

interface RenderPrintOptions {
  template: Template;
  productSlug: string;
  sectionTexts: Record<string, string>;
  selectedPaletteId: string;
  selectedFontId: string;
  accentColor?: string;
  nameLayout?: "single-line" | "three-line";
  accentConnector?: boolean;
  accentSingleLine?: boolean;
}

/**
 * Renders the design at 300 DPI on an offscreen canvas and returns a PNG blob.
 * Uses the browser's canvas for pixel-perfect font rendering.
 */
export async function renderPrintCanvas(options: RenderPrintOptions): Promise<Blob> {
  const { template, productSlug, sectionTexts, selectedPaletteId, selectedFontId, accentColor, nameLayout, accentConnector, accentSingleLine } = options;

  // Compute layout at 300 DPI
  const layout = computeLayout({
    template,
    sectionTexts,
    selectedPaletteId,
    selectedFontId,
    targetDPI: PRINT_DPI,
    accentColor,
    nameLayout,
    accentConnector,
    accentSingleLine,
  });

  // Canvas size in pixels at 300 DPI (trim area only — bleed handled by PDF)
  const widthPx = layout.canvas.width_px;
  const heightPx = layout.canvas.height_px;

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // Background colour
  if (layout.background.type === "color" && layout.background.color) {
    ctx.fillStyle = layout.background.color;
    ctx.fillRect(0, 0, widthPx, heightPx);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, widthPx, heightPx);
  }

  // Load and draw background image
  const bgPath = getBackgroundImagePath(productSlug);
  if (bgPath) {
    const bgImage = await loadImage(bgPath);
    ctx.drawImage(bgImage, 0, 0, widthPx, heightPx);
  }

  // Render text sections (at full 300 DPI pixel coordinates — no dpr division needed)
  for (const section of layout.sections) {
    const { bounds, text } = section;
    const bx = bounds.x_px;
    const by = bounds.y_px;
    const bw = bounds.width_px;
    const fontSize = text.fontSize_px;
    const lineHeight = text.lineHeight_px;
    const letterSpacing = text.letterSpacing_px;

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

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const lineColor = section.lineColorOverrides?.[lineIdx];
      ctx.fillStyle = lineColor || text.color;

      if (letterSpacing > 0.5) {
        drawTextWithSpacing(ctx, line, textX, currentY, letterSpacing, text.alignment, bw);
      } else {
        ctx.fillText(line, textX, currentY);
      }

      // Stroke (e.g. 0.3pt on names)
      if (section.strokePt) {
        const strokeWidth = section.strokePt * (150 / 72); // pt to CSS px at SCREEN_DPI
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = strokeWidth;
        if (letterSpacing > 0.5) {
          drawTextWithSpacing(ctx, line, textX, currentY, letterSpacing, text.alignment, bw, true);
        } else {
          ctx.strokeText(line, textX, currentY);
        }
      }

      currentY += lineHeight;
    }

    ctx.restore();
  }

  // Export as PNG blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export canvas to blob"));
    }, "image/png");
  });
}

/**
 * Renders the reverse side at 300 DPI — uses same coordinate space as screen
 * preview (CSS pixels) with ctx.scale() for DPI, guaranteeing identical output.
 */
export async function renderBackPrintCanvas(
  widthMm: number,
  heightMm: number,
  blocks: ReverseBlock[],
  accentColor: string,
): Promise<Blob> {
  // CSS pixel dimensions at trim size (same as screen preview)
  const cssW = (widthMm / 25.4) * SCREEN_DPI;
  const cssH = (heightMm / 25.4) * SCREEN_DPI;

  // Scale factor from CSS pixels to 300 DPI pixels
  const dpr = PRINT_DPI / SCREEN_DPI;

  const canvas = document.createElement("canvas");
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  // Scale so we draw in CSS-pixel coordinates (identical to screen)
  ctx.scale(dpr, dpr);

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssW, cssH);

  if (blocks.length === 0) {
    return canvasToBlob(canvas);
  }

  // Use IDENTICAL sizes to the screen preview renderBackBlocks function
  const headerSize = 14;
  const bodySize = 12;
  const headerLH = headerSize * 2;
  const bodyLH = bodySize * 1.7;
  const blockGap = 28;
  const qrSize = 90;
  const inset = cssW * 0.1;
  const maxTextWidth = cssW - inset * 2;
  const letterSpacing = 2;

  // Measure total height
  let totalHeight = 0;
  const measurements: { headerH: number; bodyH: number; qrH: number; bodyLines: string[] }[] = [];

  for (const block of blocks) {
    const headerH = block.header ? headerLH : 0;
    ctx.font = `${bodySize}px "Montserrat", sans-serif`;
    const bodyLines = block.body ? wrapLines(ctx, block.body, maxTextWidth) : [];
    const bodyH = bodyLines.length * bodyLH;
    const qrH = block.type === "qr" && block.qrUrl ? qrSize + 8 : 0;
    measurements.push({ headerH, bodyH, qrH, bodyLines });
    totalHeight += headerH + bodyH + qrH;
  }
  totalHeight += (blocks.length - 1) * blockGap;

  let currentY = Math.max(inset, (cssH - totalHeight) / 2);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const m = measurements[i];

    if (block.header) {
      ctx.fillStyle = accentColor || "#333";
      ctx.font = `600 ${headerSize}px "Montserrat", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const display = block.header.toUpperCase();
      let totalW = 0;
      for (const ch of display) totalW += ctx.measureText(ch).width + letterSpacing;
      totalW -= letterSpacing;
      let hx = (cssW - totalW) / 2;
      for (const ch of display) {
        ctx.fillText(ch, hx, currentY);
        hx += ctx.measureText(ch).width + letterSpacing;
      }
      currentY += m.headerH;
    }

    if (m.bodyLines.length > 0) {
      ctx.fillStyle = "#333";
      ctx.font = `${bodySize}px "Montserrat", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const line of m.bodyLines) {
        ctx.fillText(line, cssW / 2, currentY);
        currentY += bodyLH;
      }
    }

    if (block.type === "qr" && block.qrUrl) {
      try {
        const QRCode = (await import("qrcode")).default;
        const qrDataUrl = await QRCode.toDataURL(block.qrUrl, { width: qrSize * dpr, margin: 0 });
        const qrImg = await loadImage(qrDataUrl);
        ctx.drawImage(qrImg, (cssW - qrSize) / 2, currentY, qrSize, qrSize);
      } catch {
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect((cssW - qrSize) / 2, currentY, qrSize, qrSize);
      }
      currentY += m.qrH;
    }

    if (i < blocks.length - 1) currentY += blockGap;
  }

  return canvasToBlob(canvas);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export canvas to blob"));
    }, "image/png");
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  alignment: string,
  boundsWidth: number,
  strokeMode: boolean = false
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
    if (strokeMode) { ctx.strokeText(char, currentX, y); } else { ctx.fillText(char, currentX, y); }
    currentX += ctx.measureText(char).width + spacing;
  }
  ctx.textAlign = savedAlign;
}
