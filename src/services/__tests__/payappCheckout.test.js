import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPayappParams, buildOrderId } from '../payappCheckout';

beforeEach(() => {
  vi.stubGlobal('window', { location: { origin: 'https://app.test' } });
  import.meta.env.VITE_PAYAPP_USERID = 'nuricampus';
  import.meta.env.VITE_PAYAPP_FEEDBACK_URL = 'https://ref.supabase.co/functions/v1/payapp-feedback';
});

describe('buildOrderId', () => {
  it('mentos_ 접두 + 숫자', () => {
    expect(buildOrderId()).toMatch(/^mentos_\d+$/);
  });
});

describe('buildPayappParams', () => {
  it('필수 파라미터를 구성한다', () => {
    const p = buildPayappParams({ userId: 'user-uuid', orderId: 'mentos_1' });
    expect(p.userid).toBe('nuricampus');
    expect(p.price).toBe('1000');
    expect(p.smsuse).toBe('n');
    expect(p.var1).toBe('user-uuid');
    expect(p.var2).toBe('mentos_1');
    expect(p.feedbackurl).toBe('https://ref.supabase.co/functions/v1/payapp-feedback');
    expect(p.returnurl).toBe('https://app.test/success?orderId=mentos_1');
    expect(p.checkretry).toBe('y');
  });
});
