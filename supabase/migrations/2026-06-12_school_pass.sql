-- 학교별 기말 예상문제 패키지 구매 권한 (학교당 5,000원)
-- payapp-feedback(service_role)이 결제 성공 시 (user_id, school_slug) 를 upsert.
-- 사용자는 자기 권한만 조회. 쓰기는 service_role(웹훅) 전용.

create table if not exists public.school_pass (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null,
  school_slug  text not null,
  purchased_at timestamptz not null default now(),
  unique (user_id, school_slug)
);

create index if not exists school_pass_user_idx on public.school_pass (user_id);

alter table public.school_pass enable row level security;

-- 본인 권한만 읽기
drop policy if exists "school_pass self read" on public.school_pass;
create policy "school_pass self read"
  on public.school_pass for select
  using (auth.uid() = user_id);

-- INSERT/UPDATE 정책 없음 → 익명/일반 사용자는 쓰기 불가. service_role(웹훅)은 RLS 우회.
