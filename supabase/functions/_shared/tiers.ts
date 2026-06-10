// 가입 순번(ordinal) 기반 멤버십 tier 판정 — 서버(엣지함수)·클라이언트 공용 단일 진실.
// 순수 로직(Deno/네트워크 미사용) → vitest 단위테스트 가능.
//
// 사양:
//   - 1~100번째 가입 고객: free (1개월 무료체험, 결제 없음)
//   - 101~1000번째: earlybird (45,000원)
//   - 1001번째 이상: regular (89,000원)
//   - 불명/비정상 순번: fail-closed로 regular (무료·할인 절대 미부여, 과소청구 방지)

export const FREE_CAP = 100;
export const EARLYBIRD_CAP = 1000;

export const PRICES = {
  earlybird: 45000,
  regular: 89000,
} as const;

export type Tier = 'free' | 'earlybird' | 'regular';
export type PaidPlan = 'earlybird' | 'regular';

function isValidOrdinal(ordinal: number): boolean {
  return typeof ordinal === 'number' && Number.isFinite(ordinal) && ordinal >= 1;
}

/** 가입 순번 → tier. 불명 순번은 fail-closed(regular). */
export function resolveTier(ordinal: number): Tier {
  if (!isValidOrdinal(ordinal)) return 'regular';
  if (ordinal <= FREE_CAP) return 'free';
  if (ordinal <= EARLYBIRD_CAP) return 'earlybird';
  return 'regular';
}

/**
 * 결제 시 서버가 강제할 plan(가격). free 구간이 결제로 들어와도 최저가(earlybird)로 안전 처리.
 * 불명 순번은 fail-closed(regular) — 절대 과소청구하지 않는다.
 */
export function effectivePaidPlan(ordinal: number): PaidPlan {
  if (!isValidOrdinal(ordinal)) return 'regular';
  return ordinal <= EARLYBIRD_CAP ? 'earlybird' : 'regular';
}

/** tier별 결제 금액(원). free=0. */
export function tierPrice(tier: Tier): number {
  if (tier === 'free') return 0;
  return PRICES[tier];
}

/** 클라이언트 표시용: 순번·tier·금액 묶음. */
export function membershipInfo(ordinal: number): { ordinal: number; tier: Tier; price: number } {
  const tier = resolveTier(ordinal);
  return { ordinal, tier, price: tierPrice(tier) };
}
