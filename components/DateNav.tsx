"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5" />
      <path d="M16 3v3.5" />
    </svg>
  );
}

/**
 * The Oura-style date navigator for the Progress page: quick "Yesterday" /
 * "Today" tabs plus a calendar icon that opens a month grid for picking any
 * past day. Navigating changes the `?date=` query param, which the server
 * component reads to compute that day's per-category detail.
 */
export default function DateNav({ selectedDate }: { selectedDate: string }) {
  const t = useTranslations("progress");
  const locale = useLocale();
  const router = useRouter();

  const today = useMemo(() => new Date(), []);
  const todayStr = isoDay(today);
  const yesterdayStr = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return isoDay(d);
  }, [today]);

  const isToday = selectedDate === todayStr;
  const isYesterday = selectedDate === yesterdayStr;
  const isCustom = !isToday && !isYesterday;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  function goTo(day: string) {
    setOpen(false);
    router.push(`/progress?date=${day}`);
  }

  function openCalendar() {
    const [y, m] = selectedDate.split("-").map(Number);
    setViewMonth(new Date(y, m - 1, 1));
    setOpen(true);
  }

  const monthLabel = viewMonth.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const weekdayLabels = useMemo(() => {
    // Monday-first row of short weekday labels, localized.
    const base = new Date(2024, 0, 1); // a Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: "narrow" });
    });
  }, [locale]);

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    // Monday = 0 ... Sunday = 6
    const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const list: { day: number; iso: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ day: d, iso: isoDay(new Date(year, month, d)) });
    }
    return { leadingBlanks, list };
  }, [viewMonth]);

  function shiftMonth(delta: number) {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => goTo(yesterdayStr)}
          className={`font-mono text-xs uppercase tracking-widest transition-colors duration-150 ${
            isYesterday ? "text-ink" : "text-inkdim"
          }`}
        >
          {t("yesterdayTab")}
        </button>
        <button
          type="button"
          onClick={() => goTo(todayStr)}
          className={`border-b-2 pb-1 font-mono text-xs uppercase tracking-widest transition-colors duration-150 ${
            isToday ? "border-accent text-ink" : "border-transparent text-inkdim"
          }`}
        >
          {t("todayTab")}
        </button>
        <button
          type="button"
          onClick={openCalendar}
          aria-label={t("pickDate")}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-150 ${
            isCustom ? "text-accent" : "text-inkdim hover:text-ink"
          }`}
        >
          <CalendarIcon />
        </button>
      </div>

      {isCustom && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-mono text-[11px] text-accent">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            type="button"
            onClick={() => goTo(todayStr)}
            aria-label={t("todayTab")}
            className="text-inkdim hover:text-ink"
          >
            ×
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)}>
          <div
            className="absolute left-1/2 top-24 w-72 -translate-x-1/2 rounded-2xl border border-line bg-surface p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-inkdim hover:text-ink"
                aria-label="Previous month"
              >
                ‹
              </button>
              <span className="font-mono text-xs uppercase tracking-widest text-ink">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                disabled={
                  viewMonth.getFullYear() === today.getFullYear() &&
                  viewMonth.getMonth() === today.getMonth()
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-inkdim hover:text-ink disabled:opacity-30"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {weekdayLabels.map((w, i) => (
                <span key={i} className="font-mono text-[10px] text-inkdim">
                  {w}
                </span>
              ))}
              {Array.from({ length: cells.leadingBlanks }).map((_, i) => (
                <span key={`b${i}`} />
              ))}
              {cells.list.map(({ day, iso }) => {
                const future = iso > todayStr;
                const active = iso === selectedDate;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={future}
                    onClick={() => goTo(iso)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors duration-150 ${
                      active
                        ? "bg-accent text-bg font-semibold"
                        : future
                        ? "text-inkdim/40"
                        : "text-ink hover:bg-surface2"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
