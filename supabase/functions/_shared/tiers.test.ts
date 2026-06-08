import { describe, it, expect } from 'vitest';
import {
  FREE_CAP,
  EARLYBIRD_CAP,
  PRICES,
  resolveTier,
  effectivePaidPlan,
  tierPrice,
  membershipInfo,
} from './tiers.ts';

describe('가입 순번 기반 멤버십 tier 판정', () => {
  it('상수가 사양과 일치한다 (free≤100, earlybird≤1000, 45000/89000)', () => {
    expect(FREE_CAP).toBe(100);
    expect(EARLYBIRD_CAP).toBe(1000);
    expect(PRICES.earlybird).toBe(45000);
    expect(PRICES.regular).toBe(89000);
  });

  describe('resolveTier(ordinal)', () => {
    it('1~100번째: free', () => {
      expect(resolveTier(1)).toBe('free');
      expect(resolveTier(100)).toBe('free');
    });
    it('101~1000번째: earlybird', () => {
      expect(resolveTier(101)).toBe('earlybird');
      expect(resolveTier(1000)).toBe('earlybird');
    });
    it('1001번째 이상: regular', () => {
      expect(resolveTier(1001)).toBe('regular');
      expect(resolveTier(50000)).toBe('regular');
    });
    it('불명/비정상 순번은 fail-closed로 regular (무료·할인 미부여)', () => {
      expect(resolveTier(0)).toBe('regular');
      expect(resolveTier(-5)).toBe('regular');
      expect(resolveTier(NaN)).toBe('regular');
      // @ts-expect-error 런타임 방어 검증
      expect(resolveTier(undefined)).toBe('regular');
    });
  });

  describe('effectivePaidPlan(ordinal) — 결제 시 서버 권위 plan', () => {
    it('≤1000은 earlybird(45000), 그 외 regular(89000)', () => {
      expect(effectivePaidPlan(101)).toBe('earlybird');
      expect(effectivePaidPlan(1000)).toBe('earlybird');
      expect(effectivePaidPlan(1001)).toBe('regular');
    });
    it('free 구간(≤100)도 결제로 들어오면 earlybird(최저가)로 안전 처리', () => {
      expect(effectivePaidPlan(1)).toBe('earlybird');
      expect(effectivePaidPlan(100)).toBe('earlybird');
    });
    it('불명 순번은 fail-closed로 regular(89000) — 절대 과소청구 안 함', () => {
      expect(effectivePaidPlan(0)).toBe('regular');
      expect(effectivePaidPlan(NaN)).toBe('regular');
    });
  });

  describe('tierPrice / membershipInfo', () => {
    it('tierPrice: free=0, earlybird=45000, regular=89000', () => {
      expect(tierPrice('free')).toBe(0);
      expect(tierPrice('earlybird')).toBe(45000);
      expect(tierPrice('regular')).toBe(89000);
    });
    it('membershipInfo가 ordinal·tier·price를 묶어 반환', () => {
      expect(membershipInfo(50)).toEqual({ ordinal: 50, tier: 'free', price: 0 });
      expect(membershipInfo(500)).toEqual({ ordinal: 500, tier: 'earlybird', price: 45000 });
      expect(membershipInfo(2000)).toEqual({ ordinal: 2000, tier: 'regular', price: 89000 });
    });
  });
});
