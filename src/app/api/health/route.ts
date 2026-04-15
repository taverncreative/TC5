import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase.from("templates").select("id").limit(1);

    if (error) {
      return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      supabase: "connected",
      templates_count: data?.length ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
