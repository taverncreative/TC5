/**
 * Unified data queries.
 * Uses Supabase when available, falls back to mock data.
 * This file will be simplified once mock data is removed.
 */

import * as db from "./products";
import * as mockData from "../mock-data";
import type { Product } from "@/lib/types/database";

export async function getShopProducts(category?: string): Promise<Product[]> {
  try {
    const products = await db.getProducts(category);
    if (products.length > 0) return products;
  } catch {
    // Supabase not configured or error - fall through to mock
  }
  return category ? mockData.getProducts(category) : mockData.getProducts();
}

export async function getShopProduct(slug: string): Promise<Product | null> {
  try {
    const product = await db.getProduct(slug);
    if (product) return product;
  } catch {
    // Fall through to mock
  }
  return mockData.getProduct(slug) || null;
}

export async function getShopFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await db.getFeaturedProducts();
    if (products.length > 0) return products;
  } catch {
    // Fall through to mock
  }
  return mockData.getFeaturedProducts();
}

export { formatPrice } from "@/lib/utils";
