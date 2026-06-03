-- homework_progress
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
create policy "own rows" on public.homework_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- wrong_answers
create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  unit text,
  hw_id text not null,
  problem_num int not null,
  answer_key text,
  first_wrong_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  resolved boolean default false,
  resolved_at timestamptz,
  unique (user_id, hw_id, problem_num)
);
alter table public.wrong_answers enable row level security;
create policy "own rows" on public.wrong_answers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- test_results
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  test_type text not null,
  accuracy int,
  correct_count int,
  total_count int,
  unit_diagnoses jsonb,
  created_at timestamptz default now()
);
alter table public.test_results enable row level security;
create policy "own rows" on public.test_results
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
