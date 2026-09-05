import type { DayCategoryDetail } from "@/lib/stats";
import ProgressRing from "@/components/ProgressRing";

/** One pillar's detail card for the currently selected day — mirrors an Oura metric card. */
export default function CategoryDayCard({
  detail,
  label,
  xpUnit,
}: {
  detail: DayCategoryDetail;
  label: string;
  xpUnit: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-4">
        <ProgressRing percent={detail.percent} size={56} strokeWidth={5}>
          <span className="font-mono text-[10px] font-semibold text-ink">{detail.percent}%</span>
        </ProgressRing>
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          <div className="mt-0.5 font-mono text-[11px] text-inkdim">
            {detail.doneCount}/{detail.totalCount} · +{detail.xpEarned} {xpUnit}
          </div>
        </div>
      </div>

      {detail.items.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3">
          {detail.items.map((item) => (
            <div key={item.key} className="flex items-center gap-2 text-sm">
              <span
                className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                  item.done ? "border-accent bg-accent" : "border-line"
                }`}
              >
                {item.done && <span className="h-1 w-1 rounded-full bg-surface" />}
              </span>
              <span className={item.done ? "text-ink" : "text-inkdim"}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
