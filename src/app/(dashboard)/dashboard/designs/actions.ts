"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUserClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  return { ok: true as const, supabase, userId: user.id };
}

export async function renameDesign(id: string, newName: string) {
  const name = newName.trim();
  if (!name) return { ok: false as const, error: "Name cannot be empty" };
  if (name.length > 80)
    return { ok: false as const, error: "Name must be 80 characters or fewer" };

  const ctx = await requireUserClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("saved_designs")
    .update({ name })
    .eq("id", id)
    .eq("customer_id", ctx.userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/designs");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function duplicateDesign(id: string) {
  const ctx = await requireUserClient();
  if (!ctx.ok) return ctx;

  const { data: original, error: readErr } = await ctx.supabase
    .from("saved_designs")
    .select("*")
    .eq("id", id)
    .eq("customer_id", ctx.userId)
    .single();

  if (readErr || !original) {
    return { ok: false as const, error: readErr?.message || "Design not found" };
  }

  const { id: _omit, created_at: _c, updated_at: _u, ...rest } = original as Record<
    string,
    unknown
  > & { id: string; created_at: string; updated_at: string };

  const copyName =
    typeof rest.name === "string" ? `${rest.name} (copy)` : "Design (copy)";

  const { data: inserted, error: insertErr } = await ctx.supabase
    .from("saved_designs")
    .insert({
      ...rest,
      name: copyName,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertErr) return { ok: false as const, error: insertErr.message };

  revalidatePath("/dashboard/designs");
  revalidatePath("/dashboard");
  return { ok: true as const, newId: inserted.id as string };
}

export async function approveDesign(id: string) {
  const ctx = await requireUserClient();
  if (!ctx.ok) return ctx;

  const { data: current, error: readErr } = await ctx.supabase
    .from("saved_designs")
    .select("status")
    .eq("id", id)
    .eq("customer_id", ctx.userId)
    .single();

  if (readErr || !current) {
    return { ok: false as const, error: readErr?.message || "Design not found" };
  }

  if (current.status === "locked") {
    return {
      ok: false as const,
      error: "This design is already sent to print",
    };
  }

  const { error } = await ctx.supabase
    .from("saved_designs")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("customer_id", ctx.userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/designs");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function unlockDesign(id: string) {
  const ctx = await requireUserClient();
  if (!ctx.ok) return ctx;

  const { data: current, error: readErr } = await ctx.supabase
    .from("saved_designs")
    .select("status")
    .eq("id", id)
    .eq("customer_id", ctx.userId)
    .single();

  if (readErr || !current) {
    return { ok: false as const, error: readErr?.message || "Design not found" };
  }

  if (current.status !== "approved") {
    return {
      ok: false as const,
      error: "Only approved designs can be unlocked",
    };
  }

  const { error } = await ctx.supabase
    .from("saved_designs")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("customer_id", ctx.userId);

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/designs");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function deleteDesign(id: string) {
  const ctx = await requireUserClient();
  if (!ctx.ok) return ctx;

  const { data: design, error: readErr } = await ctx.supabase
    .from("saved_designs")
    .select("status")
    .eq("id", id)
    .eq("customer_id", ctx.userId)
    .single();

  if (readErr || !design) {
    return { ok: false as const, error: readErr?.message || "Design not found" };
  }

  if (design.status !== "draft") {
    return { ok: false as const, error: "Only drafts can be deleted" };
  }

  const { error } = await ctx.supabase
    .from("saved_designs")
    .delete()
    .eq("id", id)
    .eq("customer_id", ctx.userId);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/designs");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
