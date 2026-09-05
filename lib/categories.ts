export type QuestItem = { key: string; label: string; xp: number };
export type Category = { key: string; label: string; items: QuestItem[] };

export const CATEGORIES: Category[] = [
  {
    key: "corps",
    label: "Corps",
    items: [
      { key: "seance", label: "Séance complétée", xp: 25 },
      { key: "repas", label: "Repas maison cuisiné", xp: 20 },
      { key: "routine_soir", label: "Routine du soir", xp: 15 },
    ],
  },
  {
    key: "esprit",
    label: "Esprit",
    items: [
      { key: "tache", label: "Tâche prioritaire complétée", xp: 20 },
      { key: "lecture", label: "20 minutes de lecture", xp: 15 },
      { key: "finances", label: "Dépenses du jour notées", xp: 15 },
    ],
  },
  {
    key: "coeur",
    label: "Cœur",
    items: [
      { key: "emotion", label: "Émotion nommée, pas enfouie", xp: 25 },
      { key: "moment", label: "Moment de qualité, téléphone loin", xp: 20 },
      { key: "conversation", label: "Conversation difficile abordée", xp: 20 },
    ],
  },
  {
    key: "ame",
    label: "Âme",
    items: [
      { key: "solo", label: "Moment seul sans écran", xp: 15 },
      { key: "journaling", label: "Réflexion ou journaling", xp: 15 },
      { key: "routine_matin", label: "Routine du matin", xp: 15 },
    ],
  },
];

export const BUNDLE_BONUS = 10;
