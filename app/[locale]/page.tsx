import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, BUNDLE_BONUS } from "@/lib/categories";
import { levelProgress } from "@/lib/xp";
import { toggleCompletion, signOut } from "./actions";
import InfinityMark from "@/components/InfinityMark";
import ProgressRing from "@/components/ProgressRing";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const tCategories = await getTranslations("categories");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user!.id)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);

  const { data: completions } = await supabase
    .from("completions")
    .select("category, item_key, day")
    .eq("user_id", user!.id);

  const doneToday = new Set(
    (completions ?? [])
      .filter((c) => c.day === today)
      .map((c) => `${c.category}:${c.item_key}`)
  );

  // Group completions by day so we can award the per-category bundle
  // bonus for every day it was actually earned, not just tally raw items.
  const byDay = new Map<string, Set<string>>();
  for (const c of completions ?? []) {
    const set = byDay.get(c.day) ?? new Set<string>();
    set.add(`${c.category}:${c.item_key}`);
    byDay.set(c.day, set);
  }

  let historicalXp = 0;
  let todayXp = 0;
  for (const [day, doneSet] of byDay) {
    for (const cat of CATEGORIES) {
      let catXp = 0;
      let allDone = true;
      for (const item of cat.items) {
        if (doneSet.has(`${cat.key}:${item.key}`)) {
          catXp += item.xp;
        } else {
          allDone = false;
        }
      }
      const bonus = allDone ? BUNDLE_BONUS : 0;
      historicalXp += catXp + bonus;
      if (day === today) todayXp += catXp + bonus;
    }
  }

  const categoryPercents: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    const doneCount = cat.items.filter((item) =>
      doneToday.has(`${cat.key}:${item.key}`)
    ).length;
    categoryPercents[cat.key] = Math.round(
      (doneCount / cat.items.length) * 100
    );
  }

  const { level, xpIntoLevel, xpForNext, percent } =
    levelProgress(historicalXp);

  const hasEverCompletedAnything = (completions ?? []).length > 0;

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="flex w-full max-w-sm items-center justify-between md:max-w-md">
        <div className="flex items-center gap-3">
          <InfinityMark className="w-8 text-accent" />
          <span className="font-display text-lg tracking-[0.15em] text-ink">
            STEAD
          </span>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="mt-10 w-full max-w-sm rounded-[22px] border border-line bg-surface p-8 md:max-w-md">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-inkdim">
          <div className="flex flex-col gap-1">
            <span>
              {profile?.first_name
                ? t("greeting", { name: profile.first_name })
                : t("greetingFallback")}
            </span>
            {todayXp > 0 && (
              <span className="text-accent">{t("todayXp", { xp: todayXp })}</span>
            )}
          </div>
          <form action={signOut.bind(null, locale)}>
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1.5 text-inkdim transition-colors duration-150 hover:border-accent hover:text-ink active:scale-95"
            >
              {t("signOut")}
            </button>
          </form>
        </div>

        <div className="relative mt-6 flex justify-center">
          <div
            className="pointer-events-none absolute h-56 w-56 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,181,113,0.20) 0%, transparent 70%)",
            }}
          />
          <ProgressRing percent={percent} size={180} strokeWidth={10}>
            <span className="font-mono text-[11px] uppercase tracking-widest text-inkdim">
              {t("level")}
            </span>
            <span className="font-display text-4xl text-ink">{level}</span>
            <span className="mt-1 font-mono text-xs text-inkdim">
              {xpIntoLevel} / {xpForNext} XP
            </span>
          </ProgressRing>
        </div>

        <div className="mt-4 flex justify-center gap-6">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex flex-col items-center gap-2">
              <ProgressRing
                percent={categoryPercents[cat.key]}
                size={60}
                strokeWidth={6}
              >
                <span className="font-mono text-[11px] font-semibold text-ink">
                  {categoryPercents[cat.key]}%
                </span>
              </ProgressRing>
              <span className="font-mono text-[11px] uppercase tracking-wide text-inkdim">
                {tCategories(`${cat.key}.label`)}
              </span>
            </div>
          ))}
        </div>

        {!hasEverCompletedAnything && (
          <div className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-center font-mono text-[11px] text-inkdim">
            {t("emptyState")}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-6 border-t border-line pt-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="font-mono text-xs uppercase tracking-widest text-inkdim">
                {t("bundleTitle", { category: tCategories(`${cat.key}.label`) })}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {cat.items.map((item) => {
                  const done = doneToday.has(`${cat.key}:${item.key}`);
                  return (
                    <form
                      key={item.key}
                      action={toggleCompletion.bind(
                        null,
                        cat.key,
                        item.key,
                        today,
                        !done
                      )}
                    >
                      <button
                        type="submit"
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 text-left text-sm transition-all duration-150 hover:bg-surface2 active:scale-[0.98] ${
                          done ? "text-ink" : "text-inkdim"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150 ${
                            done ? "border-accent bg-accent" : "border-line"
                          }`}
                        >
                          {done && (
                            <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                          )}
                        </span>
                        {tCategories(`${cat.key}.items.${item.key}`)}
                        <span className="ml-auto font-mono text-xs text-accent">
                          +{item.xp}
                        </span>
                      </button>
                    </form>
                  );
                })}
              </div>
              {categoryPercents[cat.key] === 100 && (
                <div className="mt-2 font-mono text-[11px] text-accent">
                  {t("bundleComplete", { bonus: BUNDLE_BONUS })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
