"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/lib/editor/store";
import { computeLayout, SCREEN_DPI } from "@/lib/editor/layout-engine";
import type { LayoutOutput, LayoutSectionOutput } from "@/lib/editor/types";
import QRCode from "qrcode";
import { getBackgroundImagePath } from "@/lib/editor/background-images";

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const layoutSectionsRef = useRef<LayoutSectionOutput[]>([]);
  const [scale, setScale] = useState(1);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [bgImageLoaded, setBgImageLoaded] = useState(0);

  const template = useEditorStore((s) => s.template);
  const sectionTexts = useEditorStore((s) => s.sectionTexts);
  const selectedPaletteId = useEditorStore((s) => s.selectedPaletteId);
  const selectedFontId = useEditorStore((s) => s.selectedFontId);
  const productSlug = useEditorStore((s) => s.productSlug);
  const nameLayout = useEditorStore((s) => s.nameLayout);
  const accentConnector = useEditorStore((s) => s.accentConnector);
  const accentSingleLine = useEditorStore((s) => s.accentSingleLine);
  const accentColor = useEditorStore((s) => s.accentColor);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);
  const currentSide = useEditorStore((s) => s.currentSide);
  const reverseBlocks = useEditorStore((s) => s.reverseBlocks);
  const reverseEnabled = useEditorStore((s) => s.reverseEnabled);
  const qrImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [qrImagesLoaded, setQrImagesLoaded] = useState(0);

  // Generate QR code images when URLs change
  useEffect(() => {
    const qrBlocks = reverseBlocks.filter((b) => b.type === "qr" && b.qrUrl);
    if (qrBlocks.length === 0) { qrImagesRef.current.clear(); return; }

    let cancelled = false;
    (async () => {
      const newMap = new Map<string, HTMLImageElement>();
      for (const block of qrBlocks) {
        if (!block.qrUrl) continue;
        try {
          const dataUrl = await QRCode.toDataURL(block.qrUrl, { width: 200, margin: 0, color: { dark: "#000000", light: "#ffffff" } });
          const img = new Image();
          await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = dataUrl; });
          if (!cancelled) newMap.set(block.id, img);
        } catch { /* invalid URL */ }
      }
      if (!cancelled) {
        qrImagesRef.current = newMap;
        setQrImagesLoaded((c) => c + 1);
      }
    })();
    return () => { cancelled = true; };
  }, [reverseBlocks]);

  // Wait for custom fonts to load
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  // Load background image when product changes
  useEffect(() => {
    // Clear immediately so a stale image is never drawn for the new product
    bgImageRef.current = null;

    const bgPath = getBackgroundImagePath(productSlug);
    if (!bgPath) return;

    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      // Bump counter to trigger re-render with the new image
      setBgImageLoaded((c) => c + 1);
    };
    img.onerror = () => {
      bgImageRef.current = null;
    };
    img.src = bgPath;
  }, [productSlug]);

  const computeScale = useCallback(() => {
    if (!containerRef.current || !template) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48;
    const containerHeight = container.clientHeight - 48;

    const canvasW = (template.dimensions.width_mm / 25.4) * SCREEN_DPI;
    const canvasH = (template.dimensions.height_mm / 25.4) * SCREEN_DPI;

    const scaleX = containerWidth / canvasW;
    const scaleY = containerHeight / canvasH;
    setScale(Math.min(scaleX, scaleY, 2));
  }, [template]);

  useEffect(() => {
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [computeScale]);

  const renderCanvas = useCallback(() => {
    if (!template || !canvasRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const renderDPI = SCREEN_DPI * dpr;

    const layout = computeLayout({
      template,
      sectionTexts,
      selectedPaletteId,
      selectedFontId,
      targetDPI: renderDPI,
      accentConnector,
      accentSingleLine,
      nameLayout,
      accentColor,
    });

    const cssW = (template.dimensions.width_mm / 25.4) * SCREEN_DPI;
    const cssH = (template.dimensions.height_mm / 25.4) * SCREEN_DPI;

    const canvas = canvasRef.current;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Store layout sections for click hit-testing (in CSS pixel coordinates)
    layoutSectionsRef.current = layout.sections.map((s) => ({
      ...s,
      bounds: {
        x_px: s.bounds.x_px / dpr,
        y_px: s.bounds.y_px / dpr,
        width_px: s.bounds.width_px / dpr,
        height_px: s.bounds.height_px / dpr,
      },
    }));

    renderToCanvas(canvas, layout, bgImageRef.current, dpr);
  }, [template, sectionTexts, selectedPaletteId, selectedFontId, nameLayout, accentConnector, accentSingleLine, accentColor, bgImageLoaded]);

  // Render back side
  const renderBackCanvas = useCallback(() => {
    if (!template || !canvasRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = (template.dimensions.width_mm / 25.4) * SCREEN_DPI;
    const cssH = (template.dimensions.height_mm / 25.4) * SCREEN_DPI;

    const canvas = canvasRef.current;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);

    // Render blocks vertically centred
    renderBackBlocks(ctx, reverseBlocks, accentColor, cssW, cssH, qrImagesRef.current);
  }, [template, reverseBlocks, accentColor, qrImagesLoaded]);

  useEffect(() => {
    if (currentSide === "back" && reverseEnabled) {
      renderBackCanvas();
    } else {
      renderCanvas();
    }
  }, [renderCanvas, renderBackCanvas, currentSide, reverseEnabled, fontsLoaded]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Convert click position to CSS pixel coordinates on the canvas
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Hit-test against section bounds
    for (const section of layoutSectionsRef.current) {
      const b = section.bounds;
      if (x >= b.x_px && x <= b.x_px + b.width_px && y >= b.y_px && y <= b.y_px + b.height_px) {
        setActiveSection(section.id);
        // Scroll the edit panel to the matching field
        const el = document.getElementById(`section-${section.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
  }, [scale, setActiveSection]);

  if (!template) return null;

  const canvasW = (template.dimensions.width_mm / 25.4) * SCREEN_DPI;
  const canvasH = (template.dimensions.height_mm / 25.4) * SCREEN_DPI;

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center h-full bg-[#e8e8e8] p-6"
    >
      <div
        className="shadow-xl rounded-sm cursor-pointer"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: canvasW, height: canvasH }}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}

function renderToCanvas(
  canvas: HTMLCanvasElement,
  layout: LayoutOutput,
  bgImage: HTMLImageElement | null,
  dpr: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { canvas: size, background, sections } = layout;

  // Size in CSS pixels (layout is computed at renderDPI = SCREEN_DPI * dpr)
  const cssW = size.width_px / dpr;
  const cssH = size.height_px / dpr;

  // Clear and fill solid white base (prevents PNG edge transparency)
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cssW, cssH);

  // Template background colour on top (if different from white)
  if (background.type === "color" && background.color && background.color !== "#ffffff") {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  // Background image (the design artwork)
  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, cssW, cssH);
  }

  // Text sections - convert from render pixels back to CSS pixels
  for (const section of sections) {
    const { bounds, text } = section;

    const bx = bounds.x_px / dpr;
    const by = bounds.y_px / dpr;
    const bw = bounds.width_px / dpr;
    const bh = bounds.height_px / dpr;
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

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      // Per-line colour override (e.g. accent & in names)
      const lineColor = section.lineColorOverrides?.[lineIdx];
      if (lineColor) {
        ctx.fillStyle = lineColor;
      } else {
        ctx.fillStyle = text.color;
      }

      // Inline accent: draw segments with different colours for the match character
      if (section.inlineAccent && line.includes(section.inlineAccent.match)) {
        drawLineWithInlineAccent(ctx, line, textX, currentY, letterSpacing, text.alignment, bw, text.color, section.inlineAccent);
      } else if (letterSpacing > 0.5) {
        drawTextWithSpacing(ctx, line, textX, currentY, letterSpacing, text.alignment, bw);
      } else {
        ctx.fillText(line, textX, currentY);
      }

      // Stroke (e.g. 0.3pt on names)
      if (section.strokePt) {
        const strokeWidth = section.strokePt * (150 / 72); // convert pt to CSS px at SCREEN_DPI
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

    if (section.overflow) {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
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
  if (alignment === "center") {
    startX = x - totalWidth / 2;
  } else if (alignment === "right") {
    startX = x - totalWidth;
  }

  const savedAlign = ctx.textAlign;
  ctx.textAlign = "left";

  let currentX = startX;
  for (const char of chars) {
    if (strokeMode) {
      ctx.strokeText(char, currentX, y);
    } else {
      ctx.fillText(char, currentX, y);
    }
    currentX += ctx.measureText(char).width + spacing;
  }

  ctx.textAlign = savedAlign;
}

/** Draw a text line with an inline accent colour on a specific character (e.g. "&") */
function drawLineWithInlineAccent(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  spacing: number,
  alignment: string,
  boundsWidth: number,
  baseColor: string,
  accent: { match: string; color: string }
) {
  // Split text into segments: parts before/between/after the match character
  const parts: { text: string; isAccent: boolean }[] = [];
  const segments = line.split(accent.match);
  for (let i = 0; i < segments.length; i++) {
    if (segments[i]) parts.push({ text: segments[i], isAccent: false });
    if (i < segments.length - 1) parts.push({ text: accent.match, isAccent: true });
  }

  // Measure total width (character by character for spacing support)
  const useSpacing = spacing > 0.5;
  let totalWidth = 0;
  const allChars = line.split("");
  if (useSpacing) {
    for (const char of allChars) {
      totalWidth += ctx.measureText(char).width + spacing;
    }
    totalWidth -= spacing;
  } else {
    totalWidth = ctx.measureText(line).width;
  }

  // Compute start X based on alignment
  let startX = x;
  if (alignment === "center") {
    startX = x - totalWidth / 2;
  } else if (alignment === "right") {
    startX = x - totalWidth;
  }

  const savedAlign = ctx.textAlign;
  ctx.textAlign = "left";

  let currentX = startX;
  for (const part of parts) {
    ctx.fillStyle = part.isAccent ? accent.color : baseColor;
    if (useSpacing) {
      for (const char of part.text.split("")) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
      }
    } else {
      ctx.fillText(part.text, currentX, y);
      currentX += ctx.measureText(part.text).width;
    }
  }

  ctx.textAlign = savedAlign;
}

/** Render reverse side blocks vertically centred on a white canvas */
function renderBackBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: import("@/lib/types/database").ReverseBlock[],
  accentColor: string,
  canvasW: number,
  canvasH: number,
  qrImages: Map<string, HTMLImageElement>
) {
  if (blocks.length === 0) {
    ctx.fillStyle = "#999";
    ctx.font = "14px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Add blocks to design your reverse side", canvasW / 2, canvasH / 2);
    return;
  }

  const headerSize = 14;
  const bodySize = 12;
  const headerLineHeight = headerSize * 2;
  const bodyLineHeight = bodySize * 1.7;
  const blockGap = 28;
  const qrSize = 90;
  const inset = canvasW * 0.1; // 10% inset on each side
  const maxTextWidth = canvasW - inset * 2;

  // Measure total height
  let totalHeight = 0;
  const blockMeasurements: { headerH: number; bodyH: number; qrH: number; bodyLines: string[] }[] = [];

  for (const block of blocks) {
    const headerH = block.header ? headerLineHeight : 0;
    ctx.font = `${bodySize}px "Montserrat", sans-serif`;
    const bodyLines = block.body ? wrapTextLines(ctx, block.body, maxTextWidth) : [];
    const bodyH = bodyLines.length * bodyLineHeight;
    const qrH = block.type === "qr" && block.qrUrl ? qrSize + 8 : 0;
    blockMeasurements.push({ headerH, bodyH, qrH, bodyLines });
    totalHeight += headerH + bodyH + qrH;
  }
  totalHeight += (blocks.length - 1) * blockGap;

  let currentY = Math.max(inset, (canvasH - totalHeight) / 2);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const m = blockMeasurements[i];

    // Header in accent colour with letter spacing
    if (block.header) {
      ctx.fillStyle = accentColor || "#333";
      ctx.font = `600 ${headerSize}px "Montserrat", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const display = block.header.toUpperCase();
      const spacing = 2;
      let totalW = 0;
      for (const ch of display) totalW += ctx.measureText(ch).width + spacing;
      totalW -= spacing;
      let hx = (canvasW - totalW) / 2;
      for (const ch of display) {
        ctx.fillText(ch, hx, currentY);
        hx += ctx.measureText(ch).width + spacing;
      }
      currentY += m.headerH;
    }

    // Body text
    if (m.bodyLines.length > 0) {
      ctx.fillStyle = "#333";
      ctx.font = `${bodySize}px "Montserrat", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const line of m.bodyLines) {
        ctx.fillText(line, canvasW / 2, currentY);
        currentY += bodyLineHeight;
      }
    }

    // QR code
    if (block.type === "qr" && block.qrUrl) {
      const qrX = (canvasW - qrSize) / 2;
      const qrImg = qrImages.get(block.id);
      if (qrImg) {
        ctx.drawImage(qrImg, qrX, currentY, qrSize, qrSize);
      } else {
        // Placeholder while loading
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        ctx.strokeRect(qrX, currentY, qrSize, qrSize);
        ctx.fillStyle = "#999";
        ctx.font = "8px Montserrat, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Enter URL to generate QR", canvasW / 2, currentY + qrSize / 2);
      }
      currentY += m.qrH;
    }

    if (i < blocks.length - 1) currentY += blockGap;
  }
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    // Preserve empty lines (from double line breaks)
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
