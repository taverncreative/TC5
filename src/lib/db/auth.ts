import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

/**
 * Get the currently authenticated user's profile.
 * If the user is authenticated but has no profile row yet (trigger missing,
 * race, etc.), creates one on the fly using the service client so the app
 * never white-screens due to a missing profile.
 * Returns null only if the user isn't authenticated at all.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Use maybeSingle to avoid throwing when no row exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  // Self-heal: create the profile via service client (bypasses RLS)
  const admin = await createServiceClient();
  const fullName =
    (user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    null;

  const { data: created } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
    })
    .select("*")
    .single();

  return (created as Profile | null) ?? null;
}

/**
 * Get the currently authenticated user's profile or redirect to login.
 * Use in server components that require authentication.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
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
    redirect("/dashboard");
  }
  return profile;
}
