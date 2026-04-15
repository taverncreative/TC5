import { NextResponse, type NextRequest } from "next/server";
import { getTemplates, createTemplate } from "@/lib/db/templates";

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await createTemplate(body);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
