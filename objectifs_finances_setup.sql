-- STEAD: Objectifs & Finances
--
-- 1) Renames the "ame" pillar to "argent" (Money/Business). This is a pure
--    string rename on existing rows — no data is created or destroyed, so
--    every existing quest and its history is preserved exactly, just under
--    the new pillar name. You can rename the quest labels themselves
--    afterwards from the Quêtes page if you want them to read as
--    money/business quests instead of the old soul-themed ones.
-- 2) Creates the tables for Ventures (businesses/projects), Objectives,
--    their Milestones, and a simple manual Finance ledger.
--
-- Run this once, in the Supabase SQL Editor, BEFORE using the updated app.

update quest_items set category = 'argent' where category = 'ame';
update completions set category = 'argent' where category = 'ame';

create table if not exists ventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table ventures enable row level security;
create policy "Users can view their own ventures" on ventures for select using (auth.uid() = user_id);
create policy "Users can insert their own ventures" on ventures for insert with check (auth.uid() = user_id);
create policy "Users can update their own ventures" on ventures for update using (auth.uid() = user_id);
create policy "Users can delete their own ventures" on ventures for delete using (auth.uid() = user_id);

create table if not exists objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venture_id uuid references ventures(id) on delete cascade,
  title text not null,
  target_date date,
  completed_at timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table objectives enable row level security;
create policy "Users can view their own objectives" on objectives for select using (auth.uid() = user_id);
create policy "Users can insert their own objectives" on objectives for insert with check (auth.uid() = user_id);
create policy "Users can update their own objectives" on objectives for update using (auth.uid() = user_id);
create policy "Users can delete their own objectives" on objectives for delete using (auth.uid() = user_id);

create table if not exists objective_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  objective_id uuid not null references objectives(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  completed_day date,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table objective_milestones enable row level security;
create policy "Users can view their own milestones" on objective_milestones for select using (auth.uid() = user_id);
create policy "Users can insert their own milestones" on objective_milestones for insert with check (auth.uid() = user_id);
create policy "Users can update their own milestones" on objective_milestones for update using (auth.uid() = user_id);
create policy "Users can delete their own milestones" on objective_milestones for delete using (auth.uid() = user_id);

create table if not exists finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venture_id uuid references ventures(id) on delete cascade,
  type text not null check (type in ('revenu', 'depense', 'investissement')),
  amount numeric not null check (amount > 0),
  category text,
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);
alter table finance_entries enable row level security;
create policy "Users can view their own finance entries" on finance_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own finance entries" on finance_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own finance entries" on finance_entries for update using (auth.uid() = user_id);
create policy "Users can delete their own finance entries" on finance_entries for delete using (auth.uid() = user_id);
