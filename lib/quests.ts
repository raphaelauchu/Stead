import type { SupabaseClient } from "@supabase/supabase-js";
import { CATEGORY_KEYS, DEFAULT_QUEST_TEMPLATE, type CategoryKey } from "@/lib/categories";

export type QuestItemRow = {
  id: string;
  category: string;
  item_key: string;
  label: string;
  xp: number;
  position: number;
};

export type LiveCategory = {
  key: CategoryKey;
  items: QuestItemRow[];
};

/**
 * Loads the signed-in user's quest items, seeding the four pillars with the
 * default starter quests the first time they're ever loaded (brand-new
 * accounts, or existing accounts created before quests became
 * customizable). Seeded labels come from `translateLabel` so a user's
 * history keeps the exact wording they've always seen; from then on the
 * rows are plain per-user data they can freely edit.
 */
export async function ensureQuestItems(
  supabase: SupabaseClient,
  userId: string,
  translateLabel: (categoryKey: string, itemKey: string) => string
): Promise<QuestItemRow[]> {
  const { data: existing } = await supabase
    .from("quest_items")
    .select("id, category, item_key, label, xp, position")
    .eq("user_id", userId)
    .order("position", { ascending: true });

  if (existing && existing.length > 0) {
    return existing;
  }

  const rows = DEFAULT_QUEST_TEMPLATE.flatMap((cat) =>
    cat.items.map((item, i) => ({
      user_id: userId,
      category: cat.key,
      item_key: item.key,
      label: translateLabel(cat.key, item.key),
      xp: item.xp,
      position: i,
    }))
  );

  const { data: inserted } = await supabase
    .from("quest_items")
    .insert(rows)
    .select("id, category, item_key, label, xp, position");

  return inserted ?? [];
}

/** Groups flat quest item rows into the four fixed pillars, in order. */
export function groupQuestsByCategory(items: QuestItemRow[]): LiveCategory[] {
  return CATEGORY_KEYS.map((key) => ({
    key,
    items: items
      .filter((item) => item.category === key)
      .sort((a, b) => a.position - b.position),
  }));
}
