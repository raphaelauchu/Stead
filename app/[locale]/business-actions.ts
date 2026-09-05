"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { objectiveCategory, MILESTONE_XP, OBJECTIVE_BONUS } from "@/lib/objectives";

const MAX_VENTURES = 12;
const MAX_OBJECTIVES_PER_SCOPE = 20;
const MAX_MILESTONES_PER_OBJECTIVE = 20;

export async function createVenture(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const { count } = await supabase
    .from("ventures")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_VENTURES) return;

  await supabase.from("ventures").insert({
    user_id: user.id,
    name,
    position: count ?? 0,
  });

  revalidatePath("/", "layout");
}

export async function deleteVenture(ventureId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Cascades to its objectives, their milestones, and its finance entries
  // (all reference ventures/objectives with `on delete cascade`).
  await supabase.from("ventures").delete().eq("id", ventureId).eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function createObjective(ventureId: string | null, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const targetDateRaw = String(formData.get("target_date") ?? "").trim();
  const target_date = targetDateRaw ? targetDateRaw : null;
  if (!title) return;

  let countQuery = supabase
    .from("objectives")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  countQuery = ventureId
    ? countQuery.eq("venture_id", ventureId)
    : countQuery.is("venture_id", null);
  const { count } = await countQuery;
  if ((count ?? 0) >= MAX_OBJECTIVES_PER_SCOPE) return;

  await supabase.from("objectives").insert({
    user_id: user.id,
    venture_id: ventureId,
    title,
    target_date,
    position: count ?? 0,
  });

  revalidatePath("/", "layout");
}

export async function deleteObjective(objectiveId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("objectives").delete().eq("id", objectiveId).eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function addMilestone(objectiveId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;

  const { count } = await supabase
    .from("objective_milestones")
    .select("id", { count: "exact", head: true })
    .eq("objective_id", objectiveId)
    .eq("user_id", user.id);
  if ((count ?? 0) >= MAX_MILESTONES_PER_OBJECTIVE) return;

  await supabase.from("objective_milestones").insert({
    user_id: user.id,
    objective_id: objectiveId,
    label,
    position: count ?? 0,
  });

  revalidatePath("/", "layout");
}

export async function deleteMilestone(milestoneId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("objective_milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
}

/**
 * Checking off a milestone awards a fixed, one-time XP bonus, frozen into
 * `completions` exactly like a daily quest (same table, same rules — see
 * lib/stats.ts) so it shows up in totals/levels without any special-casing.
 * A venture-linked objective's milestones feed the Argent pillar; a
 * standalone (personal) objective's feed Esprit.
 */
export async function toggleMilestone(
  milestoneId: string,
  objectiveId: string,
  ventureId: string | null,
  done: boolean
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const category = objectiveCategory(ventureId);
  const today = new Date().toISOString().slice(0, 10);

  if (done) {
    await supabase
      .from("objective_milestones")
      .update({ done: true, completed_day: today })
      .eq("id", milestoneId)
      .eq("user_id", user.id);

    await supabase.from("completions").insert({
      user_id: user.id,
      category,
      item_key: `milestone_${milestoneId}`,
      day: today,
      xp: MILESTONE_XP,
    });

    // First time every milestone in this objective is done, award a
    // one-time completion bonus. Never revoked if a milestone is later
    // unchecked — like a finished chapter, it stays finished.
    const { data: objective } = await supabase
      .from("objectives")
      .select("id, completed_at")
      .eq("id", objectiveId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (objective && !objective.completed_at) {
      const { data: milestones } = await supabase
        .from("objective_milestones")
        .select("done")
        .eq("objective_id", objectiveId)
        .eq("user_id", user.id);

      const allDone = (milestones ?? []).length > 0 && (milestones ?? []).every((m) => m.done);
      if (allDone) {
        await supabase
          .from("objectives")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", objectiveId)
          .eq("user_id", user.id);

        await supabase.from("completions").insert({
          user_id: user.id,
          category,
          item_key: `objective_${objectiveId}`,
          day: today,
          xp: OBJECTIVE_BONUS,
        });
      }
    }
  } else {
    const { data: milestone } = await supabase
      .from("objective_milestones")
      .select("completed_day")
      .eq("id", milestoneId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (milestone?.completed_day) {
      await supabase
        .from("completions")
        .delete()
        .match({
          user_id: user.id,
          category,
          item_key: `milestone_${milestoneId}`,
          day: milestone.completed_day,
        });
    }

    await supabase
      .from("objective_milestones")
      .update({ done: false, completed_day: null })
      .eq("id", milestoneId)
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
}

export async function createFinanceEntry(ventureId: string | null, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const type = String(formData.get("type") ?? "");
  if (!["revenu", "depense", "investissement"].includes(type)) return;

  const amountRaw = parseFloat(String(formData.get("amount") ?? ""));
  if (!Number.isFinite(amountRaw) || amountRaw <= 0) return;

  const category = String(formData.get("category") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const entryDateRaw = String(formData.get("entry_date") ?? "").trim();
  const entry_date = entryDateRaw || new Date().toISOString().slice(0, 10);

  await supabase.from("finance_entries").insert({
    user_id: user.id,
    venture_id: ventureId,
    type,
    amount: amountRaw,
    category,
    note,
    entry_date,
  });

  revalidatePath("/", "layout");
}

export async function deleteFinanceEntry(entryId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("finance_entries").delete().eq("id", entryId).eq("user_id", user.id);

  revalidatePath("/", "layout");
}
