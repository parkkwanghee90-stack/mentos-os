// 선착순 100명 한 달 무료 이벤트 + 7일차 리뷰 게이트 접근제어.
//
// 상태 머신 (getAccessState):
//   paid            : 실제 결제 회원 → 게이트 없음
//   not_joined      : 아직 무료 이벤트 미합류 → 합류 모달
//   free_active     : 합류 후 30일 이내 (& 리뷰 게이트 통과) → 전체 이용
//   review_required : 합류 후 7일 경과 + 리뷰 미작성 → 리뷰 모달(차단)
//   expired         : 합류 후 30일 경과 → 페이월(차단)
//
// 카운터는 Supabase RPC(claim_free_slot)로 전역(전 기기 공유) 발급한다.
// 서버 호출 실패 시 앱이 죽지 않도록 로컬 폴백(번호 임시발급)으로 동작한다.

import { supabase } from '@/services/supabaseClient';

export const FREE_DAYS = 30;   // 무료 이용 기간(일)
export const REVIEW_DAY = 7;   // 리뷰 작성 요구 시작일
export const MAX_SLOTS = 100;  // 선착순 한정 인원

const K_DEVICE = 'mentos_device_id';
const K_EVENT = 'mentos_free_event';        // { slotNo, claimedAt, name, email, fallback }
const K_REVIEW = 'mentos_event_review_done'; // 'true'
const K_PAID = 'mentos_is_paid';
const K_PAID_SRC = 'mentos_paid_source';     // 'free_event' 면 우리가 임시로 켠 것

const DAY_MS = 24 * 60 * 60 * 1000;

// ── 기기 식별자 ────────────────────────────────────────────────────────────
export function getDeviceId() {
  let id = localStorage.getItem(K_DEVICE);
  if (!id) {
    const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'dev_' + Date.now() + '_' + Math.floor(Math.random() * 1e9);
    id = rnd;
    localStorage.setItem(K_DEVICE, id);
  }
  return id;
}

// ── 무료 이벤트 합류 기록 ──────────────────────────────────────────────────
export function getFreeEventRecord() {
  try {
    const raw = localStorage.getItem(K_EVENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveFreeEventRecord(rec) {
  localStorage.setItem(K_EVENT, JSON.stringify(rec));
}

export function isTrulyPaid() {
  if (localStorage.getItem('mentos_premium') === 'true') return true;
  if (localStorage.getItem('mentos_super_pass') === 'true') return true;
  // free_event 가 켠 mentos_is_paid 는 "실제 결제"가 아님
  if (localStorage.getItem(K_PAID) === 'true' && localStorage.getItem(K_PAID_SRC) !== 'free_event') return true;
  return false;
}

export function isReviewDone() {
  return localStorage.getItem(K_REVIEW) === 'true';
}

function daysSince(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / DAY_MS);
}

// ── 핵심: 현재 접근 상태 계산 ──────────────────────────────────────────────
export function getAccessState() {
  if (isTrulyPaid()) {
    return { state: 'paid' };
  }
  const rec = getFreeEventRecord();
  if (!rec || !rec.claimedAt) {
    return { state: 'not_joined' };
  }
  const days = daysSince(rec.claimedAt);
  const daysLeft = Math.max(0, FREE_DAYS - days);

  if (days >= FREE_DAYS) {
    return { state: 'expired', slotNo: rec.slotNo, days };
  }
  if (days >= REVIEW_DAY && !isReviewDone()) {
    return { state: 'review_required', slotNo: rec.slotNo, days, daysLeft };
  }
  return { state: 'free_active', slotNo: rec.slotNo, days, daysLeft };
}

// 다른 화면(NaesinCourse, MockExam 등)의 isPaid 게이트와 일관되게 맞춘다.
// free_active 동안만 mentos_is_paid 를 임시로 켜고, 차단 상태에선 끈다.
export function syncPaidFlag(state) {
  if (isTrulyPaid()) return; // 실제 결제 회원은 건드리지 않음
  if (state === 'free_active') {
    localStorage.setItem(K_PAID, 'true');
    localStorage.setItem(K_PAID_SRC, 'free_event');
  } else if (localStorage.getItem(K_PAID_SRC) === 'free_event') {
    // 우리가 켰던 것만 회수
    localStorage.removeItem(K_PAID);
    localStorage.removeItem(K_PAID_SRC);
  }
}

// ── 남은 자리 조회 ─────────────────────────────────────────────────────────
export async function getEventCount() {
  try {
    const { data, error } = await supabase.rpc('free_event_count');
    if (error) throw error;
    const claimed = Number(data) || 0;
    return { claimed, remaining: Math.max(0, MAX_SLOTS - claimed), ok: true };
  } catch (e) {
    console.warn('[freeEvent] count fallback:', e?.message || e);
    return { claimed: null, remaining: null, ok: false };
  }
}

// ── 무료 슬롯 발급 (합류) ──────────────────────────────────────────────────
// 성공 시 { slotNo, soldOut:false } 반환 + 로컬 저장.
export async function claimSlot({ name = null, email = null } = {}) {
  // 이미 합류했으면 그대로
  const existing = getFreeEventRecord();
  if (existing && existing.slotNo) {
    return { slotNo: existing.slotNo, soldOut: false, already: true };
  }

  const deviceId = getDeviceId();
  let slotNo = null;
  let soldOut = false;
  let fallback = false;

  try {
    const { data, error } = await supabase.rpc('claim_free_slot', {
      p_device_id: deviceId,
      p_name: name,
      p_email: email,
    });
    if (error) throw error;
    soldOut = !!data?.sold_out;
    slotNo = data?.slot_no ?? null;
    if (soldOut) {
      return { slotNo: null, soldOut: true };
    }
    if (slotNo == null) throw new Error('no slot returned');
  } catch (e) {
    // 서버 미배포/네트워크 실패 → 로컬 폴백 (앱이 죽지 않도록)
    console.warn('[freeEvent] claim fallback:', e?.message || e);
    fallback = true;
    const localNo = parseInt(localStorage.getItem('mentos_free_event_local_no') || '0', 10);
    slotNo = localNo > 0 ? localNo : Math.floor(Math.random() * 80) + 1;
    localStorage.setItem('mentos_free_event_local_no', String(slotNo));
  }

  const rec = {
    slotNo,
    claimedAt: new Date().toISOString(),
    name: name || null,
    email: email || null,
    fallback,
  };
  saveFreeEventRecord(rec);
  syncPaidFlag('free_active');
  return { slotNo, soldOut: false, fallback };
}

// ── 리뷰 제출 ──────────────────────────────────────────────────────────────
export async function submitReview({ rating, text }) {
  const rec = getFreeEventRecord();
  const deviceId = getDeviceId();
  try {
    const { data, error } = await supabase.rpc('submit_event_review', {
      p_device_id: deviceId,
      p_rating: rating,
      p_review_text: text,
      p_slot_no: rec?.slotNo ?? null,
    });
    if (error) throw error;
    if (data && data.ok === false) {
      return { ok: false, error: data.error };
    }
  } catch (e) {
    // 서버 실패해도 로컬로는 게이트 통과 (작성은 했으므로)
    console.warn('[freeEvent] review fallback:', e?.message || e);
  }
  localStorage.setItem(K_REVIEW, 'true');
  syncPaidFlag(getAccessState().state);
  return { ok: true };
}

// 슬롯 번호 → "001" 표기
export function formatSlot(n) {
  return String(n ?? 0).padStart(3, '0');
}
