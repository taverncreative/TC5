"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface UpdateProfileInput {
  id: string;
  full_name: string | null;
  phone: string | null;
  partner_name_1: string | null;
  partner_name_2: string | null;
  wedding_date: string | null;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();

  // Verify the caller is updating their own profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Not authenticated" };
  if (user.id !== input.id) {
    return { ok: false as const, error: "You can only update your own profile" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone,
      partner_name_1: input.partner_name_1,
      partner_name_2: input.partner_name_2,
      wedding_date: input.wedding_date,
    })
    .eq("id", input.id);

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
  return { ok: true as const };
}
