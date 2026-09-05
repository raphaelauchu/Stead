import { BUNDLE_BONUS } from "@/lib/categories";

export type StatsCategory = { key: string; items: { key: string; xp: number }[] };

export type Completion = { category: string; item_key: string; day: string };

/**
 * Groups raw completion rows by day -> set of "category:itemKey" keys done
 * that day. Shared by the dashboard and the stats page so XP/bonus logic
 * never drifts between the two screens.
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

  for (const [day, doneSet] of byDay) {
    let dXp = 0;
    for (const cat of categories) {
      let catXp = 0;
      let allDone = cat.items.length > 0;
      for (const item of cat.items) {
        if (doneSet.has(`${cat.key}:${item.key}`)) {
          catXp += item.xp;
        } else {
          allDone = false;
        }
      }
      const total = catXp + (allDone ? BUNDLE_BONUS : 0);
      dXp += total;
      categoryTotals[cat.key] = (categoryTotals[cat.key] ?? 0) + total;
    }
    dayXp.set(day, dXp);
    historicalXp += dXp;
  }

  return { byDay, dayXp, categoryTotals, historicalXp };
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
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
