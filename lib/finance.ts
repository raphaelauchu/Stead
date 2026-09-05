// A simple manual finance ledger — no bank connection, just entries the
// user logs by hand. Entries can be scoped to a venture (that business's
// revenue/expenses) or left unscoped (personal budget/investments).

export type FinanceEntryType = "revenu" | "depense" | "investissement";

export type FinanceEntry = {
  id: string;
  venture_id: string | null;
  type: FinanceEntryType;
  amount: number;
  category: string | null;
  note: string | null;
  entry_date: string;
};

export function computeFinanceSummary(entries: FinanceEntry[]) {
  let totalRevenu = 0;
  let totalDepense = 0;
  let totalInvesti = 0;

  const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  let monthRevenu = 0;
  let monthDepense = 0;

  for (const e of entries) {
    if (e.type === "revenu") {
      totalRevenu += e.amount;
      if (e.entry_date.startsWith(thisMonth)) monthRevenu += e.amount;
    } else if (e.type === "depense") {
      totalDepense += e.amount;
      if (e.entry_date.startsWith(thisMonth)) monthDepense += e.amount;
    } else {
      totalInvesti += e.amount;
    }
  }

  const balance = totalRevenu - totalDepense - totalInvesti;

  return { balance, totalRevenu, totalDepense, totalInvesti, monthRevenu, monthDepense };
}
