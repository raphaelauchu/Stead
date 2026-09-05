"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleCompletion(
  category: string,
  itemKey: string,
  day: string,
  done: boolean
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (done) {
    await supabase
      .from("completions")
      .insert({ user_id: user.id, category, item_key: itemKey, day });
  } else {
    await supabase
      .from("completions")
      .delete()
      .match({ user_id: user.id, category, item_key: itemKey, day });
  }

  revalidatePath("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
