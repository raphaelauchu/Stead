// The four pillars are fixed — they're STEAD's identity. What lives inside
// each one (the actual quests) is per-user data stored in the `quest_items`
// table (see lib/quests.ts). This file only keeps:
//   - CATEGORY_KEYS: the fixed pillar order used everywhere in the UI
//   - DEFAULT_QUEST_TEMPLATE: the starter quests a brand-new account gets
//     seeded with (labels are resolved via next-intl at seed time)
//   - BUNDLE_BONUS: the XP bonus for completing every quest in a pillar
//     on a given day, regardless of how many quests it has

export const CATEGORY_KEYS = ["corps", "esprit", "coeur", "ame"] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type QuestItemTemplate = { key: string; xp: number };
export type CategoryTemplate = { key: CategoryKey; items: QuestItemTemplate[] };

export const DEFAULT_QUEST_TEMPLATE: CategoryTemplate[] = [
  {
    key: "corps",
    items: [
      { key: "seance", xp: 25 },
      { key: "repas", xp: 20 },
      { key: "routine_soir", xp: 15 },
    ],
  },
  {
    key: "esprit",
    items: [
      { key: "tache", xp: 20 },
      { key: "lecture", xp: 15 },
      { key: "finances", xp: 15 },
    ],
  },
  {
    key: "coeur",
    items: [
      { key: "emotion", xp: 25 },
      { key: "moment", xp: 20 },
      { key: "conversation", xp: 20 },
    ],
  },
  {
    key: "ame",
    items: [
      { key: "solo", xp: 15 },
      { key: "journaling", xp: 15 },
      { key: "routine_matin", xp: 15 },
    ],
  },
];

export const BUNDLE_BONUS = 10;
