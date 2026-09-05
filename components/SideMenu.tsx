"use client";

import { useEffect, useState } from "react";
import { usePathname, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="flex h-8 w-8 items-center justify-center text-ink transition-transform duration-150 active:scale-90"
      >
        <MenuIcon />
      </button>

      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <div
          className={`absolute left-0 top-0 flex h-full w-64 max-w-[80vw] flex-col border-r border-line bg-surface p-6 shadow-xl transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="mb-8 flex h-8 w-8 items-center justify-center text-inkdim transition-colors duration-150 hover:text-ink"
          >
            <CloseIcon />
          </button>
          <nav className="flex flex-col gap-1">
            <Link
              href="/quests"
              className="rounded-lg px-3 py-3 text-sm text-ink transition-colors duration-150 hover:bg-surface2"
            >
              {t("quests")}
            </Link>
            <Link
              href="/profile"
              className="rounded-lg px-3 py-3 text-sm text-ink transition-colors duration-150 hover:bg-surface2"
            >
              {t("profile")}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
