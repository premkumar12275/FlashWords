-- FlashWords per-user progress.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- One row per user; `data` holds the whole progress blob (known words,
-- Leitner boxes, settings, last card, mode) exactly as the app stores it
-- locally. The app owns the shape — no migration needed when it evolves.

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Each user can only see and modify their own row.
create policy "read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
