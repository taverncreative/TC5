import { createServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/database";

export async function getProducts(category?: string): Promise<Product[]> {
  const supabase = await createServiceClient();
  let query = supabase
    .from("products")
    .select("*, template:templates(*)")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  if (category) {
    query = query.eq("template.category", category);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Filter out products where template doesn't match category (Supabase returns null joins)
  if (category) {
    return ((data || []) as Product[]).filter((p) => p.template !== null);
  }
  return (data || []) as Product[];
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, template:templates(*)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, template:templates(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, template:templates(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, template:templates(*)")
    .eq("status", "active")
    .eq("featured", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as Product[];
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "template">): Promise<Product> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select("*, template:templates(*)")
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const supabase = await createServiceClient();
  // Remove joined fields before update
  const { template, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from("products")
    .update(cleanUpdates)
    .eq("id", id)
    .select("*, template:templates(*)")
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}
