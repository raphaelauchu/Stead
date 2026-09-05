import { BUNDLE_BONUS } from "@/lib/categories";

export type StatsCategory = { key: string; items: { key: string; xp: number }[] };

// `xp` is the amount actually earned when this quest was checked off,
// frozen at that moment (see `toggleCompletion` in app/[locale]/actions.ts).
// It is NOT re-derived from the quest's current XP value, so editing a
// quest's difficulty later never rewrites past totals or levels.
export type Completion = { category: string; item_key: string; day: string; xp: number };

/**
 * Groups raw completion rows by day -> set of "category:itemKey" keys done
 * that day. Used for streaks and for the bundle-bonus "did they finish every
 * quest in this category today" check — never for XP amounts, which come
 * straight from each completion's own frozen `xp`.
 */
export function groupByDay(completions: Completion[]) {
  const byDay = new Map<string, Set<string>>();
  for (const c of completions) {
    const set = byDay.get(c.day) ?? new Set<string>();
    set.add(`${c.category}:${c.item_key}`);
    byDay.set(c.day, set);
  }
  return byDay;
}

export function computeStats(completions: Completion[], categories: StatsCategory[]) {
  const byDay = groupByDay(completions);

  const dayXp = new Map<string, number>();
  const categoryTotals: Record<string, number> = {};
  let historicalXp = 0;

  const addXp = (day: string, category: string, amount: number) => {
    dayXp.set(day, (dayXp.get(day) ?? 0) + amount);
    categoryTotals[category] = (categoryTotals[category] ?? 0) + amount;
    historicalXp += amount;
  };

  // Sum each completion's own frozen XP — this is what makes past totals
  // immune to a quest's XP being edited afterwards.
  for (const c of completions) {
    addXp(c.day, c.category, c.xp ?? 0);
  }

  // Bundle bonus still depends on the *current* quest definition (which
  // items exist in a category today), since it's a same-day completeness
  // check rather than a historical XP amount.
  for (const [day, doneSet] of byDay) {
    for (const cat of categories) {
      if (cat.items.length === 0) continue;
      const allDone = cat.items.every((item) => doneSet.has(`${cat.key}:${item.key}`));
      if (allDone) {
        addXp(day, cat.key, BUNDLE_BONUS);
      }
    }
  }

  return { byDay, dayXp, categoryTotals, historicalXp };
}

export function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export type DayCategoryItem = { key: string; label: string; xp: number; done: boolean };
export type DayCategoryDetail = {
  key: string;
  items: DayCategoryItem[];
  doneCount: number;
  totalCount: number;
  percent: number;
  xpEarned: number;
};

/**
 * Per-category breakdown for one specific day — which of that category's
 * *current* quests were done that day, and the total XP actually earned in
 * that category that day (frozen completion XP, so it also folds in any
 * Objectifs milestone/objective bonuses earned that day under this pillar,
 * even though those aren't "quest items" and won't appear in `items`).
 * Powers the Progress page's calendar-driven, per-category detail cards.
 */
export function dayCategoryDetails(
  completions: Completion[],
  categories: { key: string; items: { key: string; label: string; xp: number }[] }[],
  day: string
): DayCategoryDetail[] {
  const doneKeys = new Set<string>();
  const xpByCategory: Record<string, number> = {};

  for (const c of completions) {
    if (c.day !== day) continue;
    doneKeys.add(`${c.category}:${c.item_key}`);
    xpByCategory[c.category] = (xpByCategory[c.category] ?? 0) + (c.xp ?? 0);
  }

  return categories.map((cat) => {
    const items = cat.items.map((item) => ({
      key: item.key,
      label: item.label,
      xp: item.xp,
      done: doneKeys.has(`${cat.key}:${item.key}`),
    }));
    const doneCount = items.filter((i) => i.done).length;
    const totalCount = items.length;
    return {
      key: cat.key,
      items,
      doneCount,
      totalCount,
      percent: totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0,
      xpEarned: xpByCategory[cat.key] ?? 0,
    };
  });
}

/**
 * Current streak of consecutive days with at least one completed quest,
 * counting back from today. A day still in progress (today, if nothing is
 * checked off yet) doesn't break a streak earned on prior days.
 */
export function computeStreak(byDay: Map<string, Set<string>>): number {
  const cursor = new Date();
  const todayStr = isoDay(cursor);
  const todaySet = byDay.get(todayStr);
  if (!todaySet || todaySet.size === 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const dayStr = isoDay(cursor);
    const set = byDay.get(dayStr);
    if (set && set.size > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/** Last `count` ISO day strings, oldest first, ending today. */
export function lastDays(count: number): string[] {
  const days: string[] = [];
  const cursor = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setDate(d.getDate() - i);
    days.push(isoDay(d));
  }
  return days;
}
