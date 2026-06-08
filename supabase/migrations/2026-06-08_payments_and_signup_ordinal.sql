-- ============================================================
-- 결제 시스템 재정비: payments 테이블 정식화 + 가입 순번 RPC
-- 멱등(IF NOT EXISTS / CREATE OR REPLACE) — 기존 운영 DB에 안전하게 재적용 가능.
-- ============================================================

-- ── payments: PayApp 결제 기록 ─────────────────────────────
-- 두 writer 호환:
--   (a) payapp-feedback 웹훅(service_role): {user_id, order_id, mul_no, amount, status, pay_type, approved_at, raw}
--   (b) src/pages/Success.jsx(클라이언트 JWT): {user_id, payment_key, order_id, amount, status, approved_at}
-- 그래서 mul_no/payment_key 둘 다 nullable, mul_no는 존재 시 UNIQUE(웹훅 멱등 onConflict).
create table if not exists public.payments (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
  order_id     text,
  mul_no       bigint unique,
  payment_key  text,
  amount       integer not null,
  status       text not null,                 -- success | cancelled | pending
  pay_type     integer,
  approved_at  timestamptz,
  raw          jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_payments_user   on public.payments (user_id);
create index if not exists idx_payments_status on public.payments (status);

alter table public.payments enable row level security;

-- 클라이언트(authenticated)는 본인 결제만 조회/삽입. service_role(웹훅)은 RLS 우회.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_select_own'
  ) then
    create policy payments_select_own on public.payments
      for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payments' and policyname = 'payments_insert_own'
  ) then
    create policy payments_insert_own on public.payments
      for insert to authenticated with check (user_id = auth.uid());
  end if;
end $$;

-- ── signup_ordinal: 몇 번째 가입 고객인지(1-based) ──────────
-- auth.users.created_at 순위. admin 계정은 고객 카운트에서 제외(프로모 슬롯 미소모).
-- 존재하지 않는 uid → 0 (호출측에서 fail-closed/regular 처리).
-- SECURITY DEFINER로 auth 스키마 접근. 오남용 방지 위해 service_role 전용(엣지함수만 호출).
create or replace function public.signup_ordinal(uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  -- 동일 created_at은 id로 타이브레이크하여 순번이 고유하도록(경계 슬롯 초과 방지).
  -- 존재하지 않는 uid → 타깃 행(t) 없음 → 0 (호출측에서 fail-closed/regular 처리).
  select count(*)::int
  from auth.users u,
       (select created_at as ca, id as tid from auth.users where id = uid) t
  where coalesce(u.raw_user_meta_data->>'role', 'student') <> 'admin'
    and (u.created_at < t.ca or (u.created_at = t.ca and u.id <= t.tid))
$$;

revoke all on function public.signup_ordinal(uuid) from public;
revoke all on function public.signup_ordinal(uuid) from anon;
revoke all on function public.signup_ordinal(uuid) from authenticated;
grant execute on function public.signup_ordinal(uuid) to service_role;
