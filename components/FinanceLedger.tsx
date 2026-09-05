import type { FinanceEntry } from "@/lib/finance";
import { computeFinanceSummary } from "@/lib/finance";
import { createFinanceEntry, deleteFinanceEntry } from "../app/[locale]/business-actions";

type BusinessT = (key: string, values?: Record<string, string | number>) => string;

function formatAmount(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** A manual finance ledger, scoped to a venture (business P&L) or to the user directly (personal budget). */
export default function FinanceLedger({
  entries,
  ventureId,
  t,
}: {
  entries: FinanceEntry[];
  ventureId: string | null;
  t: BusinessT;
}) {
  const { balance, totalDepense, totalInvesti, monthRevenu, monthDepense } =
    computeFinanceSummary(entries);

  const sorted = [...entries].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="font-mono text-[11px] uppercase tracking-widest text-inkdim">
        {t("finance.title")}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-display text-lg text-ink">{formatAmount(balance)}</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-inkdim">
            {t("finance.balance")}
          </div>
        </div>
        <div>
          <div className="font-display text-lg text-ink">
            +{formatAmount(monthRevenu)} / -{formatAmount(monthDepense)}
          </div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-inkdim">
            {t("finance.thisMonth")}
          </div>
        </div>
        <div>
          <div className="font-display text-lg text-ink">{formatAmount(totalInvesti)}</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-inkdim">
            {t("finance.invested")}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3">
        {sorted.slice(0, 8).map((e) => (
          <div key={e.id} className="flex items-center gap-2 text-sm">
            <span
              className={`font-mono text-xs ${
                e.type === "revenu"
                  ? "text-accent"
                  : e.type === "depense"
                  ? "text-red-400"
                  : "text-inkdim"
              }`}
            >
              {e.type === "revenu" ? "+" : "-"}
              {formatAmount(e.amount)}
            </span>
            <span className="min-w-0 flex-1 truncate text-inkdim">
              {e.category || t(`finance.type.${e.type}`)}
              {e.note ? ` — ${e.note}` : ""}
            </span>
            <span className="flex-shrink-0 font-mono text-[10px] text-inkdim">
              {new Date(e.entry_date + "T00:00:00").toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <form action={deleteFinanceEntry.bind(null, e.id)}>
              <button
                type="submit"
                aria-label={t("delete")}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-inkdim transition-colors duration-150 hover:text-red-400"
              >
                ×
              </button>
            </form>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-inkdim">{t("finance.noEntries")}</p>
        )}
      </div>

      <form
        action={createFinanceEntry.bind(null, ventureId)}
        className="mt-3 flex flex-col gap-2 border-t border-line pt-3"
      >
        <div className="flex gap-2">
          <select
            name="type"
            defaultValue="depense"
            className="rounded-lg border border-line bg-bg px-2 py-2 text-xs text-ink focus:outline-none focus:border-accent"
          >
            <option value="revenu">{t("finance.type.revenu")}</option>
            <option value="depense">{t("finance.type.depense")}</option>
            <option value="investissement">{t("finance.type.investissement")}</option>
          </select>
          <input
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            required
            placeholder={t("finance.amountPlaceholder")}
            className="w-24 min-w-0 flex-1 rounded-lg border border-line bg-bg px-2 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          />
          <input
            type="date"
            name="entry_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-line bg-bg px-2 py-2 text-xs text-ink focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            name="category"
            placeholder={t("finance.categoryPlaceholder")}
            className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-bg transition-transform duration-150 active:scale-95"
          >
            {t("finance.addEntry")}
          </button>
        </div>
      </form>
    </div>
  );
}
