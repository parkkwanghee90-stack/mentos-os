-- Math homework + parent-push cloud tables.
-- Schemas match the actual client inserts (code is source of truth):
--   wrong_answers     <- src/pages/MathClassroom.jsx:650
--   study_logs        <- src/pages/MathClassroom.jsx:760
--   homework_progress <- src/services/syncService.js:36
--   push_notifications<- src/services/pushService.js:44
-- App authenticates via Supabase Auth, so user.id === auth.uid() -> auth.uid() RLS is correct.

-- ── wrong_answers (math wrong-answer cloud log) ──────────────────────────
create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  subject text,
  unit_folder text,
  problem_num text,
  wrong_answer_text text,
  resolved boolean default false,
  created_at timestamptz default now()
);
alter table public.wrong_answers enable row level security;
drop policy if exists "wrong_answers own rows" on public.wrong_answers;
create policy "wrong_answers own rows" on public.wrong_answers
  for all to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- ── study_logs (per-lesson study record) ─────────────────────────────────
create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  subject text,
  unit text,
  duration_minutes int,
  score numeric,
  created_at timestamptz default now()
);
alter table public.study_logs enable row level security;
drop policy if exists "study_logs own rows" on public.study_logs;
create policy "study_logs own rows" on public.study_logs
  for all to authenticated
  using (student_id = (select auth.uid()))
  with check (student_id = (select auth.uid()));

-- ── homework_progress (per-problem homework progress mirror) ─────────────
create table if not exists public.homework_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  homework_id text not null,
  problem_id text not null,
  is_correct boolean,
  user_answer text,
  avs_viewed boolean default false,
  updated_at timestamptz default now(),
  unique (user_id, homework_id, problem_id)
);
alter table public.homework_progress enable row level security;
drop policy if exists "homework_progress own rows" on public.homework_progress;
create policy "homework_progress own rows" on public.homework_progress
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── push_notifications (parent-push history; no per-user column) ─────────
create table if not exists public.push_notifications (
  id uuid primary key default gen_random_uuid(),
  type text,
  message text,
  status text,
  channels jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
alter table public.push_notifications enable row level security;
drop policy if exists "push_notifications insert" on public.push_notifications;
create policy "push_notifications insert" on public.push_notifications
  for insert to anon, authenticated with check (true);
drop policy if exists "push_notifications select" on public.push_notifications;
create policy "push_notifications select" on public.push_notifications
  for select to authenticated using (true);

-- ── Data API exposure ────────────────────────────────────────────────────
grant select, insert, update, delete on
  public.wrong_answers, public.study_logs, public.homework_progress, public.push_notifications
  to anon, authenticated;

-- Reload PostgREST schema cache so the Data API sees the new tables immediately.
notify pgrst, 'reload schema';
