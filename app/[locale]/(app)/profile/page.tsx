import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, signOut } from "../../actions";

export const dynamic = "force-dynamic";

const GOAL_KEYS = ["corps", "esprit", "coeur", "ame"] as const;

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("profile");
  const tGoals = await getTranslations("goals");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, goal")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 md:max-w-md">
      <h1 className="font-display text-2xl text-ink">{t("title")}</h1>

      <form
        action={updateProfile}
        className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6"
      >
        <label className="font-mono text-[10px] uppercase tracking-widest text-inkdim">
          {t("email")}
        </label>
        <div className="rounded-lg border border-line bg-bg px-4 py-3 text-sm text-inkdim">
          {user.email}
        </div>

        <div className="mt-2 flex gap-3">
          <div className="flex w-1/2 flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-inkdim">
              {t("firstName")}
            </label>
            <input
              type="text"
              name="first_name"
              defaultValue={profile?.first_name ?? ""}
              className="rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex w-1/2 flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-inkdim">
              {t("lastName")}
            </label>
            <input
              type="text"
              name="last_name"
              defaultValue={profile?.last_name ?? ""}
              className="rounded-lg border border-line bg-bg px-4 py-3 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-inkdim">
          {t("goalQuestion")}
        </div>
        <div className="flex flex-col gap-2">
          {GOAL_KEYS.map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-150 ${
                profile?.goal === key
                  ? "border-accent text-ink"
                  : "border-line text-inkdim"
              }`}
            >
              <input
                type="radio"
                name="goal"
                value={key}
                defaultChecked={profile?.goal === key}
                className="accent-accent"
              />
              {tGoals(key)}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg transition-transform duration-150 active:scale-[0.98]"
        >
          {t("save")}
        </button>
      </form>

      <form action={signOut.bind(null, locale)}>
        <button
          type="submit"
          className="w-full rounded-lg border border-line px-4 py-3 text-sm text-inkdim transition-colors duration-150 hover:border-accent hover:text-ink active:scale-[0.98]"
        >
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}
