import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { groupMilestonesByObjective, type Objective, type Milestone } from "@/lib/objectives";
import type { FinanceEntry } from "@/lib/finance";
import ObjectiveBlock from "@/components/ObjectiveBlock";
import FinanceLedger from "@/components/FinanceLedger";
import { createObjective, deleteVenture } from "../../../business-actions";

export const dynamic = "force-dynamic";

export default async function VenturePage({
  params,
}: {
  params: Promise<{ ventureId: string }>;
}) {
  const { ventureId } = await params;
  const t = await getTranslations("business");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: venture } = await supabase
    .from("ventures")
    .select("id, name")
    .eq("id", ventureId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!venture) notFound();

  const { data: objectives } = await supabase
    .from("objectives")
    .select("id, venture_id, title, target_date, completed_at, position")
    .eq("user_id", user.id)
    .eq("venture_id", ventureId)
    .order("position", { ascending: true });

  const objectiveIds = (objectives ?? []).map((o) => o.id);
  const { data: milestones } =
    objectiveIds.length > 0
      ? await supabase
          .from("objective_milestones")
          .select("id, objective_id, label, done, completed_day, position")
          .eq("user_id", user.id)
          .in("objective_id", objectiveIds)
      : { data: [] as Milestone[] };

  const milestonesByObjective = groupMilestonesByObjective((milestones ?? []) as Milestone[]);

  const { data: financeEntries } = await supabase
    .from("finance_entries")
    .select("id, venture_id, type, amount, category, note, entry_date")
    .eq("user_id", user.id)
    .eq("venture_id", ventureId)
    .order("entry_date", { ascending: false });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md">
      <div>
        <Link href="/objectifs" className="font-mono text-[11px] uppercase tracking-widest text-inkdim hover:text-ink">
          ← {t("backToVentures")}
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="font-display text-2xl text-ink">{venture.name}</h1>
          <form action={deleteVenture.bind(null, venture.id)}>
            <button
              type="submit"
              className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] text-inkdim transition-colors duration-150 hover:border-red-400 hover:text-red-400 active:scale-95"
            >
              {t("delete")}
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {(objectives ?? []).map((o) => (
          <ObjectiveBlock
            key={o.id}
            objective={o as Objective}
            milestones={milestonesByObjective.get(o.id) ?? []}
            ventureId={venture.id}
            t={t}
          />
        ))}
        {(objectives ?? []).length === 0 && (
          <p className="text-sm text-inkdim">{t("noObjectives")}</p>
        )}
      </div>
      <form
        action={createObjective.bind(null, venture.id)}
        className="-mt-3 flex items-center gap-2"
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

      <FinanceLedger
        entries={(financeEntries ?? []) as FinanceEntry[]}
        ventureId={venture.id}
        t={t}
      />
    </div>
  );
}
