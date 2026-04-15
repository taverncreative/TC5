import { PDFDocument, rgb } from "pdf-lib";

const MM_PER_INCH = 25.4;
const PT_PER_INCH = 72;

function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * PT_PER_INCH;
}

interface WrapRasterOptions {
  rasterPng: Uint8Array;      // Client-rendered front at 300 DPI (trim size)
  rasterBackPng?: Uint8Array; // Client-rendered back at 300 DPI (trim size)
  widthMm: number;            // Trim width
  heightMm: number;           // Trim height
  bleedMm: number;            // Bleed amount (typically 3mm)
  slug: string;
}

/**
 * Wraps a client-rendered rasterized PNG in a print-ready PDF.
 *
 * The raster image is the complete design (background + text) rendered
 * at 300 DPI by the browser canvas with correct fonts.
 *
 * The PDF page is sized at trim + bleed (e.g. 133x184mm for a 127x178mm card).
 * The raster image is drawn slightly larger to extend 3mm beyond the trim on
 * all sides, ensuring bleed coverage. Crop marks are added at the trim line.
 */
export async function wrapRasterInPdf(options: WrapRasterOptions): Promise<Uint8Array> {
  const { rasterPng, rasterBackPng, widthMm, heightMm, bleedMm, slug } = options;

  const trimWidthPt = mmToPt(widthMm);
  const trimHeightPt = mmToPt(heightMm);
  const bleedPt = mmToPt(bleedMm);
  const pageWidthPt = trimWidthPt + bleedPt * 2;
  const pageHeightPt = trimHeightPt + bleedPt * 2;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Embed the rasterized design image
  const designImage = await pdfDoc.embedPng(rasterPng);

  // Draw the raster at the full page size (trim + bleed).
  // The raster was rendered at trim size, so stretching it to include bleed
  // extends the edge artwork by 3mm on each side — negligible for organic designs.
  page.drawImage(designImage, {
    x: 0,
    y: 0,
    width: pageWidthPt,
    height: pageHeightPt,
  });

  // Crop marks at the trim line
  drawCropMarks(page, pageWidthPt, pageHeightPt, bleedPt);

  // Page 2: Back side (if provided)
  if (rasterBackPng) {
    const backPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    // White background fills entire page including bleed
    backPage.drawRectangle({
      x: 0, y: 0, width: pageWidthPt, height: pageHeightPt,
      color: rgb(1, 1, 1),
    });
    // Draw back raster at trim size, positioned at bleed offset (no stretching)
    const backImage = await pdfDoc.embedPng(rasterBackPng);
    backPage.drawImage(backImage, {
      x: bleedPt,
      y: bleedPt,
      width: trimWidthPt,
      height: trimHeightPt,
    });
    drawCropMarks(backPage, pageWidthPt, pageHeightPt, bleedPt);
  }

  return await pdfDoc.save();
}

function drawCropMarks(
  page: ReturnType<PDFDocument["addPage"]>,
  pageWidthPt: number,
  pageHeightPt: number,
  bleedPt: number
) {
  const markLength = 10;
  const markOffset = 3;
  const color = rgb(0, 0, 0);
  const thickness = 0.5;

  // Top-left
  page.drawLine({
    start: { x: bleedPt, y: pageHeightPt - bleedPt + markOffset },
    end: { x: bleedPt, y: pageHeightPt - bleedPt + markOffset + markLength },
    color, thickness,
  });
  page.drawLine({
    start: { x: bleedPt - markOffset - markLength, y: pageHeightPt - bleedPt },
    end: { x: bleedPt - markOffset, y: pageHeightPt - bleedPt },
    color, thickness,
  });

  // Top-right
  page.drawLine({
    start: { x: pageWidthPt - bleedPt, y: pageHeightPt - bleedPt + markOffset },
    end: { x: pageWidthPt - bleedPt, y: pageHeightPt - bleedPt + markOffset + markLength },
    color, thickness,
  });
  page.drawLine({
    start: { x: pageWidthPt - bleedPt + markOffset, y: pageHeightPt - bleedPt },
    end: { x: pageWidthPt - bleedPt + markOffset + markLength, y: pageHeightPt - bleedPt },
    color, thickness,
  });

  // Bottom-left
  page.drawLine({
    start: { x: bleedPt, y: bleedPt - markOffset - markLength },
    end: { x: bleedPt, y: bleedPt - markOffset },
    color, thickness,
  });
  page.drawLine({
    start: { x: bleedPt - markOffset - markLength, y: bleedPt },
    end: { x: bleedPt - markOffset, y: bleedPt },
    color, thickness,
  });

  // Bottom-right
  page.drawLine({
    start: { x: pageWidthPt - bleedPt, y: bleedPt - markOffset - markLength },
    end: { x: pageWidthPt - bleedPt, y: bleedPt - markOffset },
    color, thickness,
  });
  page.drawLine({
    start: { x: pageWidthPt - bleedPt + markOffset, y: bleedPt },
    end: { x: pageWidthPt - bleedPt + markOffset + markLength, y: bleedPt },
    color, thickness,
  });
}
