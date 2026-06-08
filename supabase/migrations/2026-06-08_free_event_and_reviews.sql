-- 선착순 100명 한 달 무료 이벤트 + 7일 후 리뷰 게이트.
-- 전역(전 기기 공유) 카운터를 보장하기 위해 서버 테이블 + security definer RPC 사용.
--   free_event_claims  : 무료 슬롯 001~100 발급 기록 (device_id 1기기 1슬롯)
--   event_reviews      : 7일차 리뷰(별점+후기) 저장
-- 보안: 테이블은 RLS on + 정책 없음(직접 접근 차단). 오직 아래 definer 함수로만 접근.
--       클라이언트(anon)는 함수 EXECUTE 권한만 가진다.

-- ── free_event_claims ────────────────────────────────────────────────────
create table if not exists public.free_event_claims (
  id          bigint generated always as identity primary key,
  slot_no     int  not null unique,          -- 1 ~ 100 (고객 번호)
  device_id   text not null unique,           -- 기기/브라우저 식별자
  name        text,
  email       text,
  claimed_at  timestamptz not null default now()
);
alter table public.free_event_claims enable row level security;
-- 정책을 만들지 않음 → anon/authenticated 직접 접근 불가. definer 함수만 우회.

-- ── event_reviews ─────────────────────────────────────────────────────────
create table if not exists public.event_reviews (
  id          bigint generated always as identity primary key,
  device_id   text not null,
  slot_no     int,
  rating      int  not null check (rating between 1 and 5),
  review_text text not null,
  created_at  timestamptz not null default now()
);
alter table public.event_reviews enable row level security;

-- ── RPC: 무료 슬롯 발급 (원자적, 최대 100) ───────────────────────────────
-- 같은 기기는 재호출해도 동일 번호 반환. 100명 초과 시 sold_out=true.
create or replace function public.claim_free_slot(
  p_device_id text,
  p_name      text default null,
  p_email     text default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing int;
  v_count    int;
  v_new      int;
begin
  if p_device_id is null or length(trim(p_device_id)) = 0 then
    return json_build_object('slot_no', null, 'sold_out', false, 'error', 'no_device');
  end if;

  -- 이미 발급받은 기기면 기존 번호 그대로 반환
  select c.slot_no into v_existing
    from public.free_event_claims c
   where c.device_id = p_device_id;
  if v_existing is not null then
    return json_build_object('slot_no', v_existing, 'sold_out', false, 'already', true);
  end if;

  -- 동시 발급 직렬화 (번호 중복/초과 방지)
  perform pg_advisory_xact_lock(778899001122);

  -- 락 획득 후 다시 확인 (경쟁 상황)
  select c.slot_no into v_existing
    from public.free_event_claims c
   where c.device_id = p_device_id;
  if v_existing is not null then
    return json_build_object('slot_no', v_existing, 'sold_out', false, 'already', true);
  end if;

  select count(*) into v_count from public.free_event_claims;
  if v_count >= 100 then
    return json_build_object('slot_no', null, 'sold_out', true);
  end if;

  v_new := v_count + 1;
  insert into public.free_event_claims (slot_no, device_id, name, email)
  values (v_new, p_device_id, nullif(trim(p_name), ''), nullif(trim(p_email), ''));

  return json_build_object('slot_no', v_new, 'sold_out', false);
end;
$$;

-- ── RPC: 현재 발급 수 (남은 자리 표시용) ─────────────────────────────────
create or replace function public.free_event_count()
returns int
language sql
security definer
set search_path = public, pg_temp
as $$
  select count(*)::int from public.free_event_claims;
$$;

-- ── RPC: 리뷰 제출 ────────────────────────────────────────────────────────
create or replace function public.submit_event_review(
  p_device_id   text,
  p_rating      int,
  p_review_text text,
  p_slot_no     int default null
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    return json_build_object('ok', false, 'error', 'bad_rating');
  end if;
  if p_review_text is null or length(trim(p_review_text)) < 5 then
    return json_build_object('ok', false, 'error', 'too_short');
  end if;

  insert into public.event_reviews (device_id, slot_no, rating, review_text)
  values (p_device_id, p_slot_no, p_rating, trim(p_review_text));

  return json_build_object('ok', true);
end;
$$;

-- ── 권한: 테이블 직접권한은 주지 않고, 함수 EXECUTE만 부여 ──────────────
revoke all on function public.claim_free_slot(text, text, text)      from public;
revoke all on function public.free_event_count()                     from public;
revoke all on function public.submit_event_review(text, int, text, int) from public;

grant execute on function public.claim_free_slot(text, text, text)        to anon, authenticated;
grant execute on function public.free_event_count()                       to anon, authenticated;
grant execute on function public.submit_event_review(text, int, text, int) to anon, authenticated;

-- PostgREST 스키마 캐시 리로드 (RPC 즉시 노출)
notify pgrst, 'reload schema';
