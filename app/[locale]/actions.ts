"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";

export async function toggleCompletion(
  category: string,
  itemKey: string,
  day: string,
  done: boolean
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (done) {
    await supabase
      .from("completions")
      .insert({ user_id: user.id, category, item_key: itemKey, day });
  } else {
    await supabase
      .from("completions")
      .delete()
      .match({ user_id: user.id, category, item_key: itemKey, day });
  }

  revalidatePath("/", "layout");
}

export async function signOut(locale: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect({ href: "/login", locale });
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "");

  await supabase.from("profiles").upsert({
    id: user.id,
    first_name,
    last_name,
    goal,
  });

  revalidatePath("/", "layout");
}
