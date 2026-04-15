import { NextResponse, type NextRequest } from "next/server";
import { wrapRasterInPdf } from "@/lib/pdf/generator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rasterFile = formData.get("raster") as File | null;
    const rasterBackFile = formData.get("rasterBack") as File | null;
    const productSlug = formData.get("productSlug") as string;
    const widthMm = parseFloat(formData.get("widthMm") as string);
    const heightMm = parseFloat(formData.get("heightMm") as string);
    const bleedMm = parseFloat(formData.get("bleedMm") as string) || 3;

    if (!rasterFile || !productSlug || !widthMm || !heightMm) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rasterBytes = new Uint8Array(await rasterFile.arrayBuffer());
    const rasterBackBytes = rasterBackFile
      ? new Uint8Array(await rasterBackFile.arrayBuffer())
      : undefined;

    const pdfBytes = await wrapRasterInPdf({
      rasterPng: rasterBytes,
      rasterBackPng: rasterBackBytes,
      widthMm,
      heightMm,
      bleedMm,
      slug: productSlug,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="print-${productSlug}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
