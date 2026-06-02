-- payments: PayApp feedback(웹훅)로만 기록되는 결제 원장
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  order_id text not null,
  mul_no bigint,
  amount int,
  status text not null default 'pending', -- pending | success | cancelled
  pay_type int,
  approved_at timestamptz,
  raw jsonb,
  created_at timestamptz default now()
);

-- 기존 테이블이 있던 경우를 위한 안전한 컬럼 보강
alter table public.payments add column if not exists mul_no bigint;
alter table public.payments add column if not exists pay_type int;
alter table public.payments add column if not exists raw jsonb;
alter table public.payments add column if not exists order_id text;

-- 멱등성: mul_no 유니크 (upsert onConflict 대상)
create unique index if not exists payments_mul_no_uniq
  on public.payments (mul_no) where mul_no is not null;

create index if not exists payments_order_id_idx on public.payments (order_id);

alter table public.payments enable row level security;

-- 본인 결제건만 조회 가능 (insert/update 정책 없음 → service_role만 쓰기 가능)
drop policy if exists "payments select own" on public.payments;
create policy "payments select own" on public.payments
  for select using (user_id = auth.uid());
