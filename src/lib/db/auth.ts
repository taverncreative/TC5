import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

/**
 * Get the currently authenticated user's profile.
 * Returns null if not authenticated.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

/**
 * Get the currently authenticated user's profile or redirect to login.
 * Use in server components that require authentication.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return profile;
}

/**
 * Require the authenticated user has an admin role. Redirects to /login
 * if not authenticated, or /dashboard if authenticated but not an admin.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }
  return profile;
}
