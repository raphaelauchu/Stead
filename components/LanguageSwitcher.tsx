"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-inkdim">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-line">/</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            className={loc === locale ? "text-accent" : "hover:text-ink"}
          >
            {loc.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
