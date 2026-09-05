import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureQuestItems, groupQuestsByCategory } from "@/lib/quests";
import { computeStats, computeStreak, lastDays } from "@/lib/stats";
import { levelProgress } from "@/lib/xp";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const t = await getTranslations("progress");
  const tCategories = await getTranslations("categories");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const questItems = await ensureQuestItems(supabase, user.id, (catKey, itemKey) =>
    tCategories(`${catKey}.items.${itemKey}`)
  );
  const categories = groupQuestsByCategory(questItems);
  const statsCategories = categories.map((cat) => ({
    key: cat.key,
    items: cat.items.map((i) => ({ key: i.item_key, xp: i.xp })),
  }));

  const { data: completions } = await supabase
    .from("completions")
    .select("category, item_key, day")
    .eq("user_id", user.id);

  const { byDay, dayXp, categoryTotals, historicalXp } = computeStats(
    completions ?? [],
    statsCategories
  );
  const streak = computeStreak(byDay);
  const { level } = levelProgress(historicalXp);
  const activeDays = byDay.size;

  const days = lastDays(14);
  const dayValues = days.map((d) => dayXp.get(d) ?? 0);
  const maxDayXp = Math.max(1, ...dayValues);

  const maxCategoryXp = Math.max(1, ...categories.map((c) => categoryTotals[c.key] ?? 0));

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 md:max-w-md">
      <h1 className="font-display text-2xl text-ink">{t("title")}</h1>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <div className="font-display text-2xl text-ink">{level}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-inkdim">
            {t("level")}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <div className="font-display text-2xl text-accent">{streak}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-inkdim">
            {t("streakLabel")}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <div className="font-display text-2xl text-ink">{activeDays}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-inkdim">
            {t("activeDaysLabel")}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="font-mono text-[11px] uppercase tracking-widest text-inkdim">
          {t("last14Days")}
        </div>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {dayValues.map((xp, i) => {
            const heightPct = Math.max(4, Math.round((xp / maxDayXp) * 100));
            const isToday = i === dayValues.length - 1;
            return (
              <div key={days[i]} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      xp > 0 ? (isToday ? "bg-accent" : "bg-accent/60") : "bg-surface2"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] text-inkdim">
                  {new Date(days[i] + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "narrow",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="font-mono text-[11px] uppercase tracking-widest text-inkdim">
          {t("byCategory")}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {categories.map((cat) => {
            const xp = categoryTotals[cat.key] ?? 0;
            const widthPct = Math.max(3, Math.round((xp / maxCategoryXp) * 100));
            return (
              <div key={cat.key}>
                <div className="flex items-center justify-between font-mono text-[11px] text-inkdim">
                  <span className="uppercase tracking-wide">
                    {tCategories(`${cat.key}.label`)}
                  </span>
                  <span className="text-ink">{xp} XP</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
