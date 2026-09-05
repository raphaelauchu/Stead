-- STEAD: freeze XP at completion time
--
-- Why: quest XP is now editable (via fixed difficulty tiers), so completions
-- must record the XP they actually earned at the moment they were checked
-- off. Otherwise, changing a quest's difficulty later would retroactively
-- rewrite every past day's totals and levels.
--
-- This adds an `xp` column to `completions`, backfills it from the matching
-- quest_items row (best-effort, for existing history), and falls back to a
-- safe default for anything that can't be matched (e.g. a quest that was
-- since deleted). Run this once, in the Supabase SQL Editor, BEFORE using
-- the updated app — the app now selects and inserts this column, so it will
-- error until this migration has run.

alter table completions add column if not exists xp integer;

update completions c
set xp = qi.xp
from quest_items qi
where c.xp is null
  and c.user_id = qi.user_id
  and c.category = qi.category
  and c.item_key = qi.item_key;

-- Anything left unmatched (quest deleted since, or pre-dates quest_items)
-- gets a reasonable default rather than blocking the NOT NULL constraint.
update completions set xp = 20 where xp is null;

alter table completions alter column xp set default 20;
alter table completions alter column xp set not null;
