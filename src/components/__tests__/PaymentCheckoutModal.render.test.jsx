import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

// 의존성 모킹 (Supabase/Router 초기화 회피)
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));
vi.mock('react-router-dom', () => ({
  useNavigate: () => () => {},
}));
vi.mock('@/services/membershipService', () => ({
  getMembershipStatus: vi.fn().mockResolvedValue({ ordinal: 500, tier: 'earlybird', price: 45000, premium: false }),
}));

import PaymentCheckoutModal from '../PaymentCheckoutModal';

describe('PaymentCheckoutModal', () => {
  // 회귀: IS_TEST_MODE 미정의로 인한 ReferenceError 방지 (구매 버튼 클릭 시 크래시)
  it('IS_TEST_MODE 미정의 ReferenceError 없이 렌더된다', () => {
    expect(() =>
      renderToString(<PaymentCheckoutModal plan="regular" onClose={() => {}} />)
    ).not.toThrow();
  });

  // 멤버십(regular)은 tier 미확정(SSR) 시 선착순 가격(월 45,000원)을 낙관 표시
  it('멤버십 모달은 선착순 가격 월 45,000원을 표시한다', () => {
    const html = renderToString(<PaymentCheckoutModal plan="regular" onClose={() => {}} />);
    expect(html).toContain('월 45,000원');
  });

  // 회귀(치명): 공유 모달이 plan에 따라 올바른 가격을 보여야 한다.
  // 평생권은 1,800,000원을 보여야 하고 절대 '45,000원'을 보이면 안 된다(과거 단일가 하드코딩 버그).
  it('평생권(lifetime)은 1,800,000원을 표시하고 45,000원을 표시하지 않는다', () => {
    const html = renderToString(<PaymentCheckoutModal plan="lifetime" onClose={() => {}} />);
    expect(html).toContain('1,800,000원');
    expect(html).not.toContain('45,000원');
  });
});
