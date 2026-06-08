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

import PaymentCheckoutModal from '../PaymentCheckoutModal';

describe('PaymentCheckoutModal', () => {
  // 회귀: IS_TEST_MODE 미정의로 인한 ReferenceError 방지 (구매 버튼 클릭 시 크래시)
  it('IS_TEST_MODE 미정의 ReferenceError 없이 렌더된다', () => {
    expect(() =>
      renderToString(<PaymentCheckoutModal plan="regular" onClose={() => {}} />)
    ).not.toThrow();
  });

  // 기본값(VITE_PAYAPP_TEST_MODE 미설정 → false)에서 실제 가격 문구 표시
  it('기본 모드에서 실제 가격 문구를 표시한다', () => {
    const html = renderToString(<PaymentCheckoutModal plan="regular" onClose={() => {}} />);
    expect(html).toContain('월 45,000원');
  });
});
