import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ensureQuestItems, groupQuestsByCategory } from "@/lib/quests";
import { updateQuestItem, deleteQuestItem, addQuestItem } from "../../actions";

export const dynamic = "force-dynamic";

const MAX_ITEMS_PER_CATEGORY = 8;

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
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  name="label"
                  defaultValue={item.label}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
                />
                <input
                  type="number"
                  name="xp"
                  min={1}
                  max={999}
                  defaultValue={item.xp}
                  className="w-16 rounded-lg border border-line bg-bg px-2 py-2 text-center text-sm text-ink focus:outline-none focus:border-accent"
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
              </form>
            ))}
          </div>

          {cat.items.length < MAX_ITEMS_PER_CATEGORY && (
            <form
              action={addQuestItem.bind(null, cat.key)}
              className="mt-3 flex items-center gap-2 border-t border-line pt-3"
            >
              <input
                type="text"
                name="label"
                required
                placeholder={t("newQuestPlaceholder")}
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
              />
              <input
                type="number"
                name="xp"
                min={1}
                max={999}
                defaultValue={15}
                className="w-16 rounded-lg border border-line bg-bg px-2 py-2 text-center text-sm text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-bg transition-transform duration-150 active:scale-95"
              >
                {t("add")}
              </button>
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
