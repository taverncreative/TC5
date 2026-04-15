"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import type { ReverseBlock } from "@/lib/types/database";

export interface DesignSnapshot {
  id: string | null; // null = create, else update
  productSlug: string;
  name: string;
  sectionTexts: Record<string, string>;
  selectedPaletteId: string;
  selectedFontId: string;
  accentColor: string;
  nameLayout: "single-line" | "three-line";
  accentConnector: boolean;
  accentSingleLine: boolean;
  reverseEnabled: boolean;
  reverseBlocks: ReverseBlock[];
}

export interface UpsertDesignResult {
  ok: boolean;
  id?: string;
  savedAt?: string;
  error?: string;
}

export async function upsertDesign(
  snapshot: DesignSnapshot
): Promise<UpsertDesignResult> {
  // Require authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Resolve product_id from slug — products are public-readable so session
  // client works, but fall back to service client if not in the DB yet.
  const admin = await createServiceClient();
  const { data: product, error: productErr } = await admin
    .from("products")
    .select("id")
    .eq("slug", snapshot.productSlug)
    .maybeSingle();

  if (productErr) return { ok: false, error: productErr.message };
  if (!product) {
    return {
      ok: false,
      error: `Product "${snapshot.productSlug}" not found in database`,
    };
  }

  const payload = {
    customer_id: user.id,
    product_id: product.id,
    name: snapshot.name.trim() || "My Design",
    sections_data: snapshot.sectionTexts,
    selected_palette: snapshot.selectedPaletteId,
    selected_fonts: snapshot.selectedFontId,
    accent_color: snapshot.accentColor || null,
    name_layout: snapshot.nameLayout,
    accent_connector: snapshot.accentConnector,
    accent_single_line: snapshot.accentSingleLine,
    reverse_enabled: snapshot.reverseEnabled,
    reverse_blocks: snapshot.reverseBlocks,
  };

  if (snapshot.id) {
    // UPDATE — RLS enforces customer_id = auth.uid()
    const { error } = await supabase
      .from("saved_designs")
      .update(payload)
      .eq("id", snapshot.id)
      .eq("customer_id", user.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/designs");
    return { ok: true, id: snapshot.id, savedAt: new Date().toISOString() };
  }

  // INSERT
  const { data, error } = await supabase
    .from("saved_designs")
    .insert({ ...payload, status: "draft" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/designs");
  return { ok: true, id: data.id as string, savedAt: new Date().toISOString() };
}

export async function approveDesignFromEditor(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: current } = await supabase
    .from("saved_designs")
    .select("status")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Design not found" };
  if (current.status === "locked") {
    return { ok: false, error: "Design is already sent to print" };
  }
  const { error } = await supabase
    .from("saved_designs")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("customer_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/designs");
  return { ok: true };
}

export async function unlockDesignFromEditor(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: current } = await supabase
    .from("saved_designs")
    .select("status")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Design not found" };
  if (current.status !== "approved") {
    return { ok: false, error: "Only approved designs can be unlocked" };
  }
  const { error } = await supabase
    .from("saved_designs")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("customer_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/designs");
  return { ok: true };
}

export interface LoadedDesign {
  id: string;
  name: string;
  productSlug: string;
  sectionTexts: Record<string, string>;
  selectedPaletteId: string;
  selectedFontId: string;
  accentColor: string;
  nameLayout: "single-line" | "three-line";
  accentConnector: boolean;
  accentSingleLine: boolean;
  reverseEnabled: boolean;
  reverseBlocks: ReverseBlock[];
  status: "draft" | "approved" | "locked";
}

export async function loadDesign(
  id: string
): Promise<{ ok: true; design: LoadedDesign } | { ok: false; error: string }> {
  // Use the session client — RLS ensures only the owner (or admin) can read
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("saved_designs")
    .select("*, product:products(slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Design not found" };

  type Row = {
    id: string;
    name: string;
    product: { slug: string } | null;
    sections_data: Record<string, string> | null;
    selected_palette: string | null;
    selected_fonts: string | null;
    accent_color: string | null;
    name_layout: string | null;
    accent_connector: boolean | null;
    accent_single_line: boolean | null;
    reverse_enabled: boolean | null;
    reverse_blocks: ReverseBlock[] | null;
    status: string;
  };

  const row = data as unknown as Row;
  if (!row.product?.slug) {
    return { ok: false, error: "Design has no product" };
  }

  const nameLayout: "single-line" | "three-line" =
    row.name_layout === "single-line" ? "single-line" : "three-line";
  const status: "draft" | "approved" | "locked" =
    row.status === "approved" || row.status === "locked" ? row.status : "draft";

  return {
    ok: true,
    design: {
      id: row.id,
      name: row.name,
      productSlug: row.product.slug,
      sectionTexts: row.sections_data || {},
      selectedPaletteId: row.selected_palette || "",
      selectedFontId: row.selected_fonts || "",
      accentColor: row.accent_color || "",
      nameLayout,
      accentConnector: row.accent_connector ?? true,
      accentSingleLine: row.accent_single_line ?? false,
      reverseEnabled: row.reverse_enabled ?? false,
      reverseBlocks: row.reverse_blocks || [],
      status,
    },
  };
}
