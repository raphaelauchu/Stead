import type { Objective, Milestone } from "@/lib/objectives";
import { milestoneProgress } from "@/lib/objectives";
import {
  toggleMilestone,
  addMilestone,
  deleteMilestone,
  deleteObjective,
} from "../app/[locale]/business-actions";

type BusinessT = (key: string, values?: Record<string, string | number>) => string;

/**
 * One objective: title, progress bar, its milestone checklist, and the
 * add-milestone form. Used both for a venture's objectives and for
 * standalone personal objectives — `ventureId` is what decides which
 * pillar a milestone's XP feeds (see lib/objectives.ts#objectiveCategory).
 */
export default function ObjectiveBlock({
  objective,
  milestones,
  ventureId,
  t,
}: {
  objective: Objective;
  milestones: Milestone[];
  ventureId: string | null;
  t: BusinessT;
}) {
  const { done, total, percent } = milestoneProgress(milestones);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink">{objective.title}</div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-inkdim">
            {total > 0 && <span>{t("progressLabel", { done, total })}</span>}
            {objective.target_date && (
              <span>
                ·{" "}
                {new Date(objective.target_date + "T00:00:00").toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {objective.completed_at && <span className="text-accent">· {t("completed")}</span>}
          </div>
        </div>
        <form action={deleteObjective.bind(null, objective.id)}>
          <button
            type="submit"
            className="rounded-lg border border-line px-2 py-1 text-[10px] text-inkdim transition-colors duration-150 hover:border-red-400 hover:text-red-400 active:scale-95"
          >
            {t("delete")}
          </button>
        </form>
      </div>

      {total > 0 && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${Math.max(3, percent)}%` }}
          />
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1.5">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <form
              action={toggleMilestone.bind(null, m.id, objective.id, ventureId, !m.done)}
              className="min-w-0 flex-1"
            >
              <button
                type="submit"
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 text-left text-sm transition-all duration-150 hover:bg-surface2 active:scale-[0.98] ${
                  m.done ? "text-ink" : "text-inkdim"
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-150 ${
                    m.done ? "border-accent bg-accent" : "border-line"
                  }`}
                >
                  {m.done && <span className="h-1.5 w-1.5 rounded-full bg-surface" />}
                </span>
                <span className={m.done ? "line-through decoration-inkdim/50" : ""}>
                  {m.label}
                </span>
              </button>
            </form>
            <form action={deleteMilestone.bind(null, m.id)}>
              <button
                type="submit"
                aria-label={t("delete")}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-inkdim transition-colors duration-150 hover:text-red-400"
              >
                ×
              </button>
            </form>
          </div>
        ))}
        {milestones.length === 0 && (
          <p className="text-xs text-inkdim">{t("noObjectives")}</p>
        )}
      </div>

      <form
        action={addMilestone.bind(null, objective.id)}
        className="mt-3 flex items-center gap-2 border-t border-line pt-3"
      >
        <input
          type="text"
          name="label"
          required
          placeholder={t("milestonePlaceholder")}
          className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-lg border border-line px-3 py-2 text-[11px] text-inkdim transition-colors duration-150 hover:border-accent hover:text-ink active:scale-95"
        >
          {t("addMilestone")}
        </button>
      </form>
    </div>
  );
}
