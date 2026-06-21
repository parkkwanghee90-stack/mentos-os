// 🎉 1개월 전면 무료 개방 (사용자 확보 우선 프로모션)
//
// 이 기간 동안 모든 유료 콘텐츠(내신·모의고사·프리미엄 강의·AVS 등)를
// 결제 여부·로그인 여부와 무관하게 전원에게 무료로 개방한다.
//
// 동작 방식: 프로모 기간이면 접근 플래그(mentos_is_paid / mentos_premium)를
//   강제로 켜고, isTrulyPaid()/getAccessState()가 'paid' 로 단락된다.
//   → 전 화면의 isPaid 게이트가 자동 통과.
//
// 종료: 아래 PROMO_FREE_UNTIL 만 지나면 프로모가 자동 종료되고
//   기존 결제 게이트가 그대로 복구된다(코드 롤백 불필요).

// 시작 2026-06-20 기준 1개월 → 2026-07-21 자정(KST) 종료
export const PROMO_FREE_UNTIL = new Date('2026-07-21T00:00:00+09:00').getTime();

export const PROMO_PAID_SOURCE = 'promo_free';

// 추천 보상에 따른 개인 무료기간 연장(주 단위). referral.js가 localStorage에 동기화하는 값을
// 직접 읽는다(순환 import 방지). 추천 1명당 +1주, 초대받은 친구는 +2주.
function bonusMs() {
  try {
    const refCount = parseInt(localStorage.getItem('mentos_referral_count') || '0', 10) || 0;
    const refereeWeeks = localStorage.getItem('mentos_referral_referee_bonus') === 'true' ? 2 : 0;
    const weeks = refCount * 1 + refereeWeeks;
    return weeks * 7 * 24 * 60 * 60 * 1000;
  } catch {
    return 0;
  }
}

// 개인 프로모 종료 시점(기본 종료일 + 추천 보너스)
export function promoEnd() {
  return PROMO_FREE_UNTIL + bonusMs();
}

export function isPromoFree() {
  return Date.now() < promoEnd();
}

// 프로모 기간이면 접근 플래그를 강제로 켠다(전 화면 isPaid 게이트 통과).
// 비프로모 기간이면 아무것도 하지 않는다.
export function applyPromoFree() {
  if (!isPromoFree()) return false;
  try {
    localStorage.setItem('mentos_is_paid', 'true');
    localStorage.setItem('mentos_premium', 'true');
    localStorage.setItem('mentos_paid_source', PROMO_PAID_SOURCE);
  } catch {
    /* 비브라우저(SSR/테스트) 환경 무시 */
  }
  return true;
}

// 남은 일수 (배너 표기용) — 추천 연장 포함
export function promoDaysLeft() {
  return Math.max(0, Math.ceil((promoEnd() - Date.now()) / 86_400_000));
}
