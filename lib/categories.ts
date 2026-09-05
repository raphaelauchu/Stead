// Structural quest data only — labels live in messages/{locale}.json under
// categories.<key>.label and categories.<key>.items.<itemKey>, so the app
// stays translatable. Look up labels with next-intl's `useTranslations` /
// `getTranslations` using these keys.

export type QuestItem = { key: string; xp: number };
export type Category = { key: string; items: QuestItem[] };

export const CATEGORIES: Category[] = [
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
