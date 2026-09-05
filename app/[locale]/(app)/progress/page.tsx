import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureQuestItems, groupQuestsByCategory } from "@/lib/quests";
import { computeStats, computeStreak, dayCategoryDetails, isoDay } from "@/lib/stats";
import { levelProgress } from "@/lib/xp";
import DateNav from "@/components/DateNav";
import CategoryDayCard from "@/components/CategoryDayCard";

export const dynamic = "force-dynamic";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const t = await getTranslations("progress");
  const tCategories = await getTranslations("categories");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const todayStr = isoDay(new Date());
  // Never let a bad/future ?date= param request a day that hasn't happened yet.
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) && date <= todayStr ? date : todayStr;

  const questItems = await ensureQuestItems(supabase, user.id, (catKey, itemKey) =>
    tCategories(`${catKey}.items.${itemKey}`)
  );
  const categories = groupQuestsByCategory(questItems);
  const statsCategories = categories.map((cat) => ({
    key: cat.key,
    items: cat.items.map((i) => ({ key: i.item_key, label: i.label, xp: i.xp })),
  }));

  const { data: completions } = await supabase
    .from("completions")
    .select("category, item_key, day, xp")
    .eq("user_id", user.id);

  const { byDay, historicalXp } = computeStats(completions ?? [], statsCategories);
  const streak = computeStreak(byDay);
  const { level } = levelProgress(historicalXp);
  const activeDays = byDay.size;

  const dayDetails = dayCategoryDetails(completions ?? [], statsCategories, selectedDate);

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

      <DateNav selectedDate={selectedDate} />

      <div className="flex flex-col gap-3">
        {dayDetails.map((detail) => (
          <CategoryDayCard
            key={detail.key}
            detail={detail}
            label={tCategories(`${detail.key}.label`)}
            xpUnit="XP"
          />
        ))}
      </div>
    </div>
  );
}
