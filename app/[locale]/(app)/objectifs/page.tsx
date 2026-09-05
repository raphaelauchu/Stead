import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import {
  groupMilestonesByObjective,
  type Objective,
  type Milestone,
} from "@/lib/objectives";
import type { FinanceEntry } from "@/lib/finance";
import ObjectiveBlock from "@/components/ObjectiveBlock";
import FinanceLedger from "@/components/FinanceLedger";
import { createVenture, createObjective } from "../../business-actions";

export const dynamic = "force-dynamic";

export default async function ObjectifsPage() {
  const t = await getTranslations("business");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ventures } = await supabase
    .from("ventures")
    .select("id, name, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const { data: objectives } = await supabase
    .from("objectives")
    .select("id, venture_id, title, target_date, completed_at, position")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const allObjectives = (objectives ?? []) as Objective[];
  const personalObjectives = allObjectives.filter((o) => !o.venture_id);

  const ventureObjectiveCounts = new Map<string, number>();
  for (const o of allObjectives) {
    if (o.venture_id) {
      ventureObjectiveCounts.set(o.venture_id, (ventureObjectiveCounts.get(o.venture_id) ?? 0) + 1);
    }
  }

  const personalObjectiveIds = personalObjectives.map((o) => o.id);
  const { data: milestones } =
    personalObjectiveIds.length > 0
      ? await supabase
          .from("objective_milestones")
          .select("id, objective_id, label, done, completed_day, position")
          .eq("user_id", user.id)
          .in("objective_id", personalObjectiveIds)
      : { data: [] as Milestone[] };

  const milestonesByObjective = groupMilestonesByObjective((milestones ?? []) as Milestone[]);

  const { data: financeEntries } = await supabase
    .from("finance_entries")
    .select("id, venture_id, type, amount, category, note, entry_date")
    .eq("user_id", user.id)
    .is("venture_id", null)
    .order("entry_date", { ascending: false });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md">
      <h1 className="font-display text-2xl text-ink">{t("title")}</h1>

      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-inkdim">
          {t("venturesTitle")}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(ventures ?? []).map((v) => (
            <Link
              key={v.id}
              href={`/objectifs/${v.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-accent active:scale-[0.98]"
            >
              <span className="text-sm font-medium text-ink">{v.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-inkdim">
                {ventureObjectiveCounts.get(v.id) ?? 0}
              </span>
            </Link>
          ))}
        </div>
        {(ventures ?? []).length === 0 && (
          <p className="mt-3 text-sm text-inkdim">{t("noVentures")}</p>
        )}
        <form action={createVenture} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            name="name"
            required
            placeholder={t("venturePlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-bg transition-transform duration-150 active:scale-95"
          >
            {t("addVenture")}
          </button>
        </form>
      </div>

      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-inkdim">
          {t("personalTitle")}
        </div>
        <div className="mt-3 flex flex-col gap-3">
          {personalObjectives.map((o) => (
            <ObjectiveBlock
              key={o.id}
              objective={o}
              milestones={milestonesByObjective.get(o.id) ?? []}
              ventureId={null}
              t={t}
            />
          ))}
          {personalObjectives.length === 0 && (
            <p className="text-sm text-inkdim">{t("noObjectives")}</p>
          )}
        </div>
        <form
          action={createObjective.bind(null, null)}
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            name="title"
            required
            placeholder={t("objectiveTitlePlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <input
            type="date"
            name="target_date"
            className="rounded-lg border border-line bg-bg px-2 py-2 text-xs text-ink focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg border border-line px-3 py-2 text-[11px] text-inkdim transition-colors duration-150 hover:border-accent hover:text-ink active:scale-95"
          >
            {t("addObjective")}
          </button>
        </form>
      </div>

      <FinanceLedger entries={(financeEntries ?? []) as FinanceEntry[]} ventureId={null} t={t} />
    </div>
  );
}
