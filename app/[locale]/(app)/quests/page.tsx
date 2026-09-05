import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureQuestItems, groupQuestsByCategory } from "@/lib/quests";
import { XP_TIERS, nearestXpTier } from "@/lib/categories";
import { updateQuestItem, deleteQuestItem, addQuestItem } from "../../actions";

export const dynamic = "force-dynamic";

const MAX_ITEMS_PER_CATEGORY = 8;

/**
 * A row of pill radio buttons for the fixed XP difficulty tiers. Pure CSS
 * (peer + sr-only), so it works with these plain server-action forms
 * without any client JS. `groupName` must be unique per <form> since each
 * quest row is its own form on this page.
 */
function XpTierPicker({
  defaultXp,
  t,
}: {
  defaultXp: number;
  t: (key: string) => string;
}) {
  const snapped = nearestXpTier(defaultXp);
  return (
    <div className="flex gap-1">
      {XP_TIERS.map((tier) => (
        <label key={tier.key} className="relative">
          <input
            type="radio"
            name="xp"
            value={tier.xp}
            defaultChecked={snapped === tier.xp}
            className="peer sr-only"
          />
          <span className="block cursor-pointer select-none rounded-lg border border-line px-2 py-2 text-[10px] font-medium text-inkdim transition-colors duration-150 peer-checked:border-accent peer-checked:bg-accent peer-checked:text-bg hover:border-accent/60">
            {t(`difficulty.${tier.key}`)}
          </span>
        </label>
      ))}
    </div>
  );
}

export default async function QuestsPage() {
  const t = await getTranslations("quests");
  const tCategories = await getTranslations("categories");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const questItems = await ensureQuestItems(supabase, user.id, (catKey, itemKey) =>
    tCategories(`${catKey}.items.${itemKey}`)
  );
  const categories = groupQuestsByCategory(questItems);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md">
      <div>
        <h1 className="font-display text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-inkdim">{t("subtitle")}</p>
      </div>

      {categories.map((cat) => (
        <div key={cat.key} className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-inkdim">
            <span>{tCategories(`${cat.key}.label`)}</span>
            <span>{cat.items.length}/{MAX_ITEMS_PER_CATEGORY}</span>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {cat.items.map((item) => (
              <form
                key={item.id}
                action={updateQuestItem.bind(null, item.id)}
                className="flex flex-col gap-2 rounded-lg border border-line/60 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="label"
                    defaultValue={item.label}
                    className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-line px-2.5 py-2 text-[11px] text-inkdim transition-colors duration-150 hover:border-accent hover:text-ink active:scale-95"
                  >
                    {t("save")}
                  </button>
                  {cat.items.length > 1 && (
                    <button
                      type="submit"
                      formAction={deleteQuestItem.bind(null, item.id, cat.key)}
                      className="rounded-lg border border-line px-2.5 py-2 text-[11px] text-inkdim transition-colors duration-150 hover:border-red-400 hover:text-red-400 active:scale-95"
                    >
                      {t("delete")}
                    </button>
                  )}
                </div>
                <XpTierPicker defaultXp={item.xp} t={t} />
              </form>
            ))}
          </div>

          {cat.items.length < MAX_ITEMS_PER_CATEGORY && (
            <form
              action={addQuestItem.bind(null, cat.key)}
              className="mt-3 flex flex-col gap-2 border-t border-line pt-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="label"
                  required
                  placeholder={t("newQuestPlaceholder")}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-bg transition-transform duration-150 active:scale-95"
                >
                  {t("add")}
                </button>
              </div>
              <XpTierPicker defaultXp={20} t={t} />
            </form>
          )}
        </div>
      ))}

      <p className="text-center font-mono text-[10px] uppercase tracking-widest text-inkdim">
        {t("minimumNotice")}
      </p>
    </div>
  );
}
