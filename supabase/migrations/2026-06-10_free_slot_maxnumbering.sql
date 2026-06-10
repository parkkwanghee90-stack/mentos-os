-- 무료이벤트 슬롯 번호 매김을 삭제-안전하게 변경.
-- 기존: v_new = count(*) + 1  → 중간 행을 삭제하면 다음 가입자가 기존 번호와 충돌(unique 위반)하여 가입 실패.
-- 변경: v_new = coalesce(max(slot_no),0) + 1 → 항상 단조 증가, 삭제해도 충돌 없음(번호 재사용 안 함).
-- 정원(sold_out) 판정은 그대로 count(*) >= 100 기준(실제 참여 인원).

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

  -- 삭제-안전 번호: 현재 최대 slot_no + 1 (번호 재사용/충돌 없음)
  select coalesce(max(slot_no), 0) + 1 into v_new from public.free_event_claims;

  insert into public.free_event_claims (slot_no, device_id, name, email)
  values (v_new, p_device_id, nullif(trim(p_name), ''), nullif(trim(p_email), ''));

  return json_build_object('slot_no', v_new, 'sold_out', false);
end;
$$;

notify pgrst, 'reload schema';
