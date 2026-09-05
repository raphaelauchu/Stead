// The four pillars are fixed — they're STEAD's identity. What lives inside
// each one (the actual quests) is per-user data stored in the `quest_items`
// table (see lib/quests.ts). This file only keeps:
//   - CATEGORY_KEYS: the fixed pillar order used everywhere in the UI
//   - DEFAULT_QUEST_TEMPLATE: the starter quests a brand-new account gets
//     seeded with (labels are resolved via next-intl at seed time)
//   - BUNDLE_BONUS: the XP bonus for completing every quest in a pillar
//     on a given day, regardless of how many quests it has
//
// "argent" replaced the original "ame" pillar (Money/Business instead of
// Soul) — see objectifs_finances_setup.sql for the one-time rename of
// existing quest_items/completions rows. Only the key and its theme
// changed; nothing about how pillars work did.

export const CATEGORY_KEYS = ["corps", "esprit", "coeur", "argent"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type QuestItemTemplate = { key: string; xp: number };
export type CategoryTemplate = { key: CategoryKey; items: QuestItemTemplate[] };

export const DEFAULT_QUEST_TEMPLATE: CategoryTemplate[] = [
  {
    key: "corps",
    items: [
      { key: "seance", xp: 30 },
      { key: "repas", xp: 20 },
      { key: "routine_soir", xp: 10 },
    ],
  },
  {
    key: "esprit",
    items: [
      { key: "tache", xp: 20 },
      { key: "lecture", xp: 10 },
      { key: "journaling", xp: 10 },
    ],
  },
  {
    key: "coeur",
    items: [
      { key: "emotion", xp: 30 },
      { key: "moment", xp: 20 },
      { key: "conversation", xp: 30 },
    ],
  },
  {
    key: "argent",
    items: [
      { key: "finances", xp: 10 },
      { key: "action_business", xp: 30 },
      { key: "epargne", xp: 20 },
    ],
  },
];

export const BUNDLE_BONUS = 10;

// Custom quests can no longer take an arbitrary XP value — that would let
// someone inflate their own level progression. Every quest's XP is one of
// these three fixed difficulty tiers instead. `updateQuestItem` and
// `addQuestItem` (app/[locale]/actions.ts) clamp to this list server-side,
// so it's the single source of truth for what a quest can be worth.
export const XP_TIERS = [
  { key: "easy", xp: 10 },
  { key: "medium", xp: 20 },
  { key: "hard", xp: 30 },
] as const;
export type XpTierKey = (typeof XP_TIERS)[number]["key"];
export const ALLOWED_XP_VALUES: number[] = XP_TIERS.map((t) => t.xp);

/** Snaps a legacy/free-form XP value (from before tiers existed) to the closest tier, for display. */
export function nearestXpTier(xp: number): number {
  return XP_TIERS.reduce(
    (closest, t) => (Math.abs(t.xp - xp) < Math.abs(closest.xp - xp) ? t : closest),
    XP_TIERS[0]
  ).xp;
}
