// Business/career objectives, with checklist-style milestones. A venture
// (a business or project) groups its objectives together; an objective with
// no venture is a standalone personal goal. Which of the two it is decides
// which pillar its XP feeds: objectives under a venture are "pro" and feed
// Argent, standalone objectives are "perso" and feed Esprit — see
// `objectiveCategory` below, used by the toggleMilestone action.

import type { CategoryKey } from "@/lib/categories";

// Fixed XP awarded once per milestone the first time it's checked off, and
// a one-time bonus the moment an objective's last milestone is completed.
// Both are frozen into the `completions` table exactly like daily quests,
// so they show up in stats/levels automatically and are never rewritten
// retroactively.
export const MILESTONE_XP = 25;
export const OBJECTIVE_BONUS = 50;

export type Venture = {
  id: string;
  name: string;
  position: number;
};

export type Milestone = {
  id: string;
  objective_id: string;
  label: string;
  done: boolean;
  completed_day: string | null;
  position: number;
};

export type Objective = {
  id: string;
  venture_id: string | null;
  title: string;
  target_date: string | null;
  completed_at: string | null;
  position: number;
};

export type ObjectiveWithMilestones = Objective & { milestones: Milestone[] };

/** A venture-linked objective is professional (feeds Argent); a standalone one is personal (feeds Esprit). */
export function objectiveCategory(ventureId: string | null): CategoryKey {
  return ventureId ? "argent" : "esprit";
}

export function milestoneProgress(milestones: Milestone[]) {
  const total = milestones.length;
  const done = milestones.filter((m) => m.done).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

/** Groups a flat milestone list by their objective_id, preserving position order. */
export function groupMilestonesByObjective(
  milestones: Milestone[]
): Map<string, Milestone[]> {
  const byObjective = new Map<string, Milestone[]>();
  for (const m of milestones) {
    const list = byObjective.get(m.objective_id) ?? [];
    list.push(m);
    byObjective.set(m.objective_id, list);
  }
  for (const list of byObjective.values()) {
    list.sort((a, b) => a.position - b.position);
  }
  return byObjective;
}
