-- 기출 예상문제 추천(레퍼럴) 보상.
--  - 학생이 학교별 공유 링크(/class/exam-predict/:grade/:slug?ref=<추천인uid>)를 보내고,
--    친구가 그 링크로 가입하면 → 추천인에게 해당 학교 예상문제 3회차 전부 무료 해금.
--  - 프론트(ExamPredictCourse)가 신규 유저 로그인 직후 grant_exam_referral 을 호출한다.
--  - school_pass / grant_school_pass(2026-06-13) 가 먼저 배포돼 있어야 함.

create table if not exists public.exam_referral (
  id          uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referee_id  uuid not null,
  school_slug text,
  created_at  timestamptz not null default now(),
  unique (referee_id)                 -- 한 신규 유저당 1회만 보상
);

create index if not exists exam_referral_referrer_idx on public.exam_referral (referrer_id);

alter table public.exam_referral enable row level security;
drop policy if exists "exam_referral self read" on public.exam_referral;
create policy "exam_referral self read"
  on public.exam_referral for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- 신규 유저(=auth.uid())가 호출. 자기추천·중복 방지 후 추천인에게 보상.
-- SECURITY DEFINER 라 RLS·grant_school_pass(서비스 전용) 우회 가능.
create or replace function public.grant_exam_referral(p_referrer uuid, p_school text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_referrer is null or p_referrer = auth.uid() then
    return;                                   -- 자기추천/비로그인 무시
  end if;
  if exists (select 1 from public.exam_referral where referee_id = auth.uid()) then
    return;                                   -- 이미 보상 처리된 신규 유저
  end if;
  insert into public.exam_referral (referrer_id, referee_id, school_slug)
    values (p_referrer, auth.uid(), p_school);
  if p_school is not null and length(p_school) > 0 then
    perform public.grant_school_pass(p_referrer, p_school, 3);  -- 추천인에게 3회차 해금
  end if;
end;
$$;

revoke all on function public.grant_exam_referral(uuid, text) from public, anon;
grant execute on function public.grant_exam_referral(uuid, text) to authenticated;
