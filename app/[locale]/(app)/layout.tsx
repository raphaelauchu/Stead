import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import InfinityMark from "@/components/InfinityMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import BottomNav from "@/components/BottomNav";

export default async function AppShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="mx-auto flex w-full max-w-sm items-center justify-between px-6 pt-10 md:max-w-md">
        <div className="flex items-center gap-3">
          <InfinityMark className="w-7 text-accent" />
          <span className="font-display text-base tracking-[0.15em] text-ink">
            STEAD
          </span>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-col items-center px-6 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
