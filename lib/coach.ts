export type CoachCategory = { key: string; items: { key: string }[] };

export type CoachContext = {
  categories: CoachCategory[];
  doneToday: Set<string>; // "category:itemKey"
  categoryPercents: Record<string, number>; // today's % per category
  categoryTotals: Record<string, number>; // lifetime XP per category
  streak: number;
  hasEverCompletedAnything: boolean;
};

export type CoachInsight = {
  id: string;
  values?: Record<string, string | number>;
};

/**
 * Rule-based coach: looks at the user's real completion history and picks
 * the single most relevant, actionable insight to show right now. Rules
 * are checked in priority order — first match wins. No external API, no
 * cost, fully deterministic from data already loaded for the dashboard.
 */
export function computeCoachInsight(ctx: CoachContext): CoachInsight {
  const { categories, doneToday, categoryPercents, categoryTotals, streak, hasEverCompletedAnything } = ctx;

  if (!hasEverCompletedAnything) {
    return { id: "newUser" };
  }

  const totalItems = categories.reduce((acc, c) => acc + c.items.length, 0);
  const doneCountToday = doneToday.size;
  const remainingToday = totalItems - doneCountToday;
  const nothingDoneToday = doneCountToday === 0;

  // A real streak is on the line and nothing has been checked off yet today.
  if (streak >= 3 && nothingDoneToday) {
    return { id: "streakRisk", values: { streak } };
  }

  // Close to finishing the whole day — nudge to close it out.
  if (!nothingDoneToday && remainingToday > 0 && remainingToday <= 2) {
    return { id: "almostDone", values: { count: remainingToday } };
  }

  // One category is clearly neglected compared to the others and untouched today.
  const sortedByTotal = [...categories].sort(
    (a, b) => (categoryTotals[a.key] ?? 0) - (categoryTotals[b.key] ?? 0)
  );
  const weakest = sortedByTotal[0];
  const strongest = sortedByTotal[sortedByTotal.length - 1];
  const weakestTotal = weakest ? categoryTotals[weakest.key] ?? 0 : 0;
  const strongestTotal = strongest ? categoryTotals[strongest.key] ?? 0 : 0;
  if (
    weakest &&
    strongestTotal > 0 &&
    weakestTotal < strongestTotal * 0.4 &&
    categoryPercents[weakest.key] === 0
  ) {
    return { id: "neglectedCategory", values: { category: weakest.key } };
  }

  if (streak === 0) {
    return { id: "restart" };
  }

  // Positive reinforcement for a bundle already completed today.
  const completedBundle = categories.find((c) => categoryPercents[c.key] === 100);
  if (completedBundle) {
    return { id: "praiseCategory", values: { category: completedBundle.key } };
  }

  return { id: "default" };
}
