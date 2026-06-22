-- 추천(레퍼럴) 시스템 — 고유 쿠폰코드 + 사용 이벤트 + 집계 RPC.
-- 클라이언트 직접 테이블 접근은 막고(RLS 기본 거부), security definer RPC로만 읽고 쓴다.
-- 어뷰징 방지: referee_device UNIQUE(한 친구는 평생 1회만 추천 인정), 셀프추천 차단.

create table if not exists public.referral_codes (
  code         text primary key,
  owner_device text not null unique,
  owner_name   text,
  created_at   timestamptz not null default now()
);

create table if not exists public.referral_events (
  id             bigint generated always as identity primary key,
  code           text not null references public.referral_codes(code) on delete cascade,
  referee_device text not null unique,
  referee_name   text,
  created_at     timestamptz not null default now()
);
create index if not exists referral_events_code_idx on public.referral_events(code);

alter table public.referral_codes  enable row level security;
alter table public.referral_events enable row level security;
-- 정책을 정의하지 않음 = 클라이언트(anon/authenticated) 직접 접근 전면 거부. RPC로만 접근.

-- 짧은 6자리 코드 생성(중복 회피). pgcrypto 불필요(core md5/random 사용).
create or replace function public._gen_referral_code()
returns text language plpgsql as $$
declare c text;
begin
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.referral_codes where code = c);
  end loop;
  return c;
end $$;

-- 내 추천코드 확보(없으면 생성)
create or replace function public.ensure_referral_code(p_device text, p_name text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_code text;
begin
  select code into v_code from public.referral_codes where owner_device = p_device;
  if v_code is null then
    v_code := public._gen_referral_code();
    insert into public.referral_codes(code, owner_device, owner_name)
    values (v_code, p_device, p_name)
    on conflict (owner_device)
      do update set owner_name = coalesce(excluded.owner_name, referral_codes.owner_name)
    returning code into v_code;
  end if;
  return jsonb_build_object('code', v_code);
end $$;

-- 쿠폰 사용(가입한 친구가 호출) → 추천인에게 1건 적립
create or replace function public.redeem_referral(p_code text, p_referee_device text, p_referee_name text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_owner text;
begin
  select owner_device into v_owner from public.referral_codes where code = upper(p_code);
  if v_owner is null then
    return jsonb_build_object('ok', false, 'reason', 'invalid_code');
  end if;
  if v_owner = p_referee_device then
    return jsonb_build_object('ok', false, 'reason', 'self');
  end if;
  if exists (select 1 from public.referral_events where referee_device = p_referee_device) then
    return jsonb_build_object('ok', false, 'reason', 'already_used');
  end if;
  insert into public.referral_events(code, referee_device, referee_name)
  values (upper(p_code), p_referee_device, p_referee_name);
  return jsonb_build_object('ok', true);
end $$;

-- 내 추천 집계(추천인 기기 기준)
create or replace function public.referral_stats(p_device text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_code text; v_count int;
begin
  select code into v_code from public.referral_codes where owner_device = p_device;
  if v_code is null then
    return jsonb_build_object('code', null, 'count', 0);
  end if;
  select count(*) into v_count from public.referral_events where code = v_code;
  return jsonb_build_object('code', v_code, 'count', coalesce(v_count, 0));
end $$;

grant execute on function public.ensure_referral_code(text, text)        to anon, authenticated;
grant execute on function public.redeem_referral(text, text, text)        to anon, authenticated;
grant execute on function public.referral_stats(text)                     to anon, authenticated;
