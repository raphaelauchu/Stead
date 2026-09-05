"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { ALLOWED_XP_VALUES } from "@/lib/categories";

/** Clamps a requested XP value to one of the fixed difficulty tiers (defense in depth — the UI only ever sends one of these). */
function clampXp(value: number, fallback: number): number {
  return ALLOWED_XP_VALUES.includes(value) ? value : fallback;
}

export async function toggleCompletion(
  category: string,
  itemKey: string,
  day: string,
  done: boolean,
  xp: number
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (done) {
    // The XP earned is frozen at the moment of check-off. If the quest's
    // XP is edited later, this row keeps the value it was worth today —
    // past totals and levels never get rewritten retroactively.
    await supabase
      .from("completions")
      .insert({ user_id: user.id, category, item_key: itemKey, day, xp });
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

export async function updateQuestItem(itemId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const label = String(formData.get("label") ?? "").trim();
  const xpRaw = parseInt(String(formData.get("xp") ?? ""), 10);
  const xp = clampXp(xpRaw, 20);
  if (!label) return;

  await supabase
    .from("quest_items")
    .update({ label, xp })
    .eq("id", itemId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function deleteQuestItem(itemId: string, category: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Never let a category drop to zero quests — the bundle mechanic needs
  // at least one to mean anything.
  const { count } = await supabase
    .from("quest_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("category", category);
  if ((count ?? 0) <= 1) return;

  await supabase
    .from("quest_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function addQuestItem(category: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const label = String(formData.get("label") ?? "").trim();
  const xpRaw = parseInt(String(formData.get("xp") ?? ""), 10);
  const xp = clampXp(xpRaw, 20);
  if (!label) return;

  const { count } = await supabase
    .from("quest_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("category", category);
  // Soft cap so a bundle stays a meaningful, completable daily set.
  if ((count ?? 0) >= 8) return;

  const itemKey = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  await supabase.from("quest_items").insert({
    user_id: user.id,
    category,
    item_key: itemKey,
    label,
    xp,
    position: count ?? 0,
  });

  revalidatePath("/", "layout");
}
