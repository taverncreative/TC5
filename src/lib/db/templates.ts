import { createServiceClient } from "@/lib/supabase/server";
import type { Template } from "@/lib/types/database";

export async function getTemplates(): Promise<Template[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Template[];
}

export async function getActiveTemplates(): Promise<Template[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Template[];
}

export async function getTemplate(id: string): Promise<Template | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Template;
}

export async function getTemplateBySlug(slug: string): Promise<Template | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Template;
}

export async function createTemplate(template: Omit<Template, "id" | "created_at" | "updated_at">): Promise<Template> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as Template;
}

export async function updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Template;
}

export async function deleteTemplate(id: string): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}
