-- A·B 결제 모드 지원: 학교별로 열람 가능한 회차 수(rounds)를 둔다.
--  - 모드 A(내 학교 집중): primary 학교 rounds=3
--  - 모드 B(다양화):       primary rounds=2, secondary rounds=2
-- payapp-feedback(service_role)이 결제 성공 시 학교별 행을 upsert(회차는 더 큰 값 유지).

alter table public.school_pass
  add column if not exists rounds int not null default 3;

-- 기존 권한(구버전 = 전체 열람)은 3회차로 유지(default 3 이라 자동).

-- 회차 다운그레이드 방지를 위해 feedback이 사용할 upsert 헬퍼(있으면 교체).
-- (user_id, school_slug) 충돌 시 rounds 는 기존값과 새값 중 큰 값으로.
create or replace function public.grant_school_pass(p_user uuid, p_school text, p_rounds int)
returns void language sql security definer set search_path = public as $$
  insert into public.school_pass (user_id, school_slug, rounds, purchased_at)
  values (p_user, p_school, p_rounds, now())
  on conflict (user_id, school_slug)
  do update set rounds = greatest(public.school_pass.rounds, excluded.rounds),
                purchased_at = now();
$$;

revoke all on function public.grant_school_pass(uuid, text, int) from public, anon, authenticated;
