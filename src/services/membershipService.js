import { supabase } from '@/services/supabaseClient';

/**
 * 현재 로그인 사용자의 멤버십 상태(가입 순번 기반 tier)를 서버에서 조회한다.
 * 반환: { ordinal, tier: 'free'|'earlybird'|'regular', price, premium, premium_until }
 * 가격/무료 판정은 전적으로 서버(가입 순번)가 결정 — 클라이언트는 표시만 한다.
 */
export async function getMembershipStatus() {
  const { data, error } = await supabase.functions.invoke('membership', {
    body: { action: 'status' },
  });
  if (error) {
    console.error('[membershipService] status 조회 실패:', error.message);
    throw new Error('멤버십 상태를 불러오지 못했습니다.');
  }
  return data;
}

/**
 * 선착순 100명 1개월 무료 혜택을 청구한다(서버가 순번 검증 후 부여).
 * 대상이 아니면 서버가 403으로 거부한다.
 * 반환: { ordinal, tier, granted?, alreadyPremium?, premium_until }
 */
export async function claimFreeMembership() {
  const { data, error } = await supabase.functions.invoke('membership', {
    body: { action: 'claim_free' },
  });
  if (error) {
    console.error('[membershipService] 무료 혜택 청구 실패:', error.message);
    throw new Error('무료 혜택을 받지 못했습니다.');
  }
  return data;
}

/** tier → 한국어 가격 표기(원). free=무료. */
export function priceLabel(tier, price) {
  if (tier === 'free') return '1개월 무료';
  return `월 ${Number(price).toLocaleString()}원`;
}
