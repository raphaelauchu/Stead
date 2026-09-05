"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function TodayIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      {active && <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />}
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V11" />
      <path d="M12 19V5" />
      <path d="M19 19V14" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 19.5c1.5-3.5 4.5-5.5 7.5-5.5s6 2 7.5 5.5" />
    </svg>
  );
}

const ITEMS = [
  { href: "/", key: "today", Icon: TodayIcon },
  { href: "/progress", key: "progress", Icon: ProgressIcon },
  { href: "/profile", key: "profile", Icon: ProfileIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex w-full max-w-sm items-center justify-around md:max-w-md">
        {ITEMS.map(({ href, key, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors duration-150 active:scale-95"
            >
              <span className={active ? "text-accent" : "text-inkdim"}>
                <Icon active={active} />
              </span>
              <span
                className={`font-mono text-[10px] uppercase tracking-wide ${
                  active ? "text-accent" : "text-inkdim"
                }`}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
