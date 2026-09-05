import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, BUNDLE_BONUS } from "@/lib/categories";
import { levelProgress } from "@/lib/xp";
import { toggleCompletion, signOut } from "./actions";
import InfinityMark from "@/components/InfinityMark";
import ProgressRing from "@/components/ProgressRing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: completions } = await supabase
    .from("completions")
    .select("category, item_key, day")
    .eq("user_id", user.id);

  const doneToday = new Set(
    (completions ?? [])
      .filter((c) => c.day === today)
      .map((c) => `${c.category}:${c.item_key}`)
  );

  let historicalXp = 0;
  for (const c of completions ?? []) {
    const cat = CATEGORIES.find((cc) => cc.key === c.category);
    const item = cat?.items.find((i) => i.key === c.item_key);
    if (item) historicalXp += item.xp;
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

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="flex items-center gap-3">
        <InfinityMark className="w-8 text-accent" />
        <span className="font-display text-lg tracking-[0.15em] text-ink">
          STEAD
        </span>
      </div>

      <div className="mt-10 w-full max-w-sm rounded-[22px] border border-line bg-surface p-8">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-inkdim">
          <span>Aujourd&apos;hui</span>
          <form action={signOut}>
            <button type="submit" className="underline">
              Se déconnecter
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
              Niveau
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
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-6 border-t border-line pt-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="font-mono text-xs uppercase tracking-widest text-inkdim">
                Bundle du jour — {cat.label}
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
                        className={`flex w-full items-center gap-3 text-left text-sm ${
                          done ? "text-ink" : "text-inkdim"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                            done ? "border-accent bg-accent" : "border-line"
                          }`}
                        >
                          {done && (
                            <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                          )}
                        </span>
                        {item.label}
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
                  Bundle complet — bonus +{BUNDLE_BONUS} XP
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
