// 🎟️ 추천(레퍼럴) — 고유 쿠폰코드 + ?ref 캡처 + 가입 시 적립 + 집계 동기화.
// 서버(Supabase RPC)가 진실. 서버 미적용(마이그레이션 전)이면 조용히 로컬 폴백(앱은 안 죽음).

import { supabase } from '@/services/supabaseClient';
import { getDeviceId } from '@/lib/freeEvent';

export const REFERRALS_PER_SET = 3;   // 친구 3명 = 다음 학기 예상문제 1세트
export const WEEKS_PER_REFERRAL = 1;  // 추천 1명당 본인 무료 +1주
export const REFEREE_BONUS_WEEKS = 2; // 초대받은 친구 즉시 보상 +2주

const K_MYCODE = 'mentos_referral_code';
const K_PENDING = 'mentos_referral_pending';            // 캡처된 추천코드(가입 시 사용)
const K_REDEEMED = 'mentos_referral_redeemed';          // 이미 사용함
const K_COUNT = 'mentos_referral_count';                // 내 추천 인원(서버 동기화 캐시) — promo.js가 직접 읽음
const K_REFEREE_BONUS = 'mentos_referral_referee_bonus'; // 친구로서 받은 보상 — promo.js가 직접 읽음

export function getReferralCount() { return parseInt(localStorage.getItem(K_COUNT) || '0', 10) || 0; }
export function getMyCodeCached() { return localStorage.getItem(K_MYCODE) || null; }
export function isRefereeBonus() { return localStorage.getItem(K_REFEREE_BONUS) === 'true'; }

// 내 추천코드 확보(없으면 서버에서 발급)
export async function ensureMyCode(name = null) {
  const cached = getMyCodeCached();
  if (cached) return cached;
  try {
    const { data, error } = await supabase.rpc('ensure_referral_code', { p_device: getDeviceId(), p_name: name });
    if (error) throw error;
    if (data?.code) { localStorage.setItem(K_MYCODE, data.code); return data.code; }
  } catch (e) {
    console.warn('[referral] ensureMyCode 실패(서버 미적용?):', e?.message || e);
  }
  return null;
}

// 앱 로드 시 ?ref= 캡처(이미 사용했으면 무시)
export function captureRefFromUrl() {
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && !localStorage.getItem(K_REDEEMED)) {
      localStorage.setItem(K_PENDING, ref.trim().toUpperCase());
    }
  } catch { /* noop */ }
}
export function getPendingRef() { return localStorage.getItem(K_PENDING); }
export function clearPendingRef() { try { localStorage.removeItem(K_PENDING); } catch { /* noop */ } }

// 가입(로그인) 후 호출 — 보류 중인 추천코드를 서버에 적립. 멱등(이미 사용/셀프/중복은 서버가 거부).
export async function redeemPendingReferral(name = null) {
  const code = getPendingRef();
  if (!code || localStorage.getItem(K_REDEEMED) === 'true') return { ok: false, skipped: true };
  try {
    const { data, error } = await supabase.rpc('redeem_referral', {
      p_code: code, p_referee_device: getDeviceId(), p_referee_name: name,
    });
    if (error) throw error;
    if (data?.ok) {
      localStorage.setItem(K_REDEEMED, 'true');
      localStorage.setItem(K_REFEREE_BONUS, 'true'); // 친구(나)도 즉시 보상(+무료 2주)
      clearPendingRef();
      return { ok: true };
    }
    // invalid_code/self/already_used → 더 시도하지 않도록 보류 해제
    if (data?.reason) { localStorage.setItem(K_REDEEMED, 'true'); clearPendingRef(); }
    return { ok: false, reason: data?.reason };
  } catch (e) {
    console.warn('[referral] redeem 실패(서버 미적용?):', e?.message || e);
    return { ok: false, reason: 'network' };
  }
}

// 내 추천 집계 동기화(서버 진실 → 로컬 캐시; promo.js 무료연장도 이 값을 읽음)
export async function syncMyStats() {
  try {
    const { data, error } = await supabase.rpc('referral_stats', { p_device: getDeviceId() });
    if (error) throw error;
    if (data) {
      if (data.code) localStorage.setItem(K_MYCODE, data.code);
      localStorage.setItem(K_COUNT, String(data.count || 0));
      return { code: data.code, count: data.count || 0 };
    }
  } catch (e) {
    console.warn('[referral] stats 실패(서버 미적용?):', e?.message || e);
  }
  return { code: getMyCodeCached(), count: getReferralCount() };
}

export function buildShareUrl(code) {
  const base = (typeof window !== 'undefined' && window.location) ? window.location.origin : '';
  return `${base}/?ref=${code || ''}`;
}

export function getProgress() {
  const count = getReferralCount();
  const inSet = count % REFERRALS_PER_SET;
  return {
    count,
    sets: Math.floor(count / REFERRALS_PER_SET),       // 받은 다음학기 예상문제 세트 수
    inSet,                                             // 현재 세트 진행(0~2)
    toNextSet: inSet === 0 ? REFERRALS_PER_SET : REFERRALS_PER_SET - inSet, // 다음 세트까지 남은 친구 수
    bonusWeeks: count * WEEKS_PER_REFERRAL,            // 본인 무료 연장 주차
    coupons: count,                                    // 적립 쿠폰(=인원)
  };
}
