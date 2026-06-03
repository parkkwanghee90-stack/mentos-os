import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPayappParams,
  buildOrderId,
  normalizePhone,
  isValidPhone,
} from '../payappCheckout';

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

describe('normalizePhone', () => {
  it('하이픈/공백을 제거하고 숫자만 남긴다', () => {
    expect(normalizePhone('010-1234-5678')).toBe('01012345678');
    expect(normalizePhone(' 010 1234 5678 ')).toBe('01012345678');
  });
  it('빈 값/널은 빈 문자열', () => {
    expect(normalizePhone('')).toBe('');
    expect(normalizePhone(null)).toBe('');
    expect(normalizePhone(undefined)).toBe('');
  });
});

describe('isValidPhone', () => {
  it('01로 시작하는 10~11자리는 유효', () => {
    expect(isValidPhone('01012345678')).toBe(true);
    expect(isValidPhone('010-1234-5678')).toBe(true);
    expect(isValidPhone('0111234567')).toBe(true);
  });
  it('형식이 어긋나면 무효', () => {
    expect(isValidPhone('1234')).toBe(false);
    expect(isValidPhone('02-123-4567')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});

describe('buildPayappParams', () => {
  it('필수 파라미터(recvphone 포함)를 구성한다', () => {
    const p = buildPayappParams({ userId: 'user-uuid', orderId: 'mentos_1', recvphone: '01012345678' });
    expect(p.userid).toBe('nuricampus');
    expect(p.goodname).toBeTruthy();
    expect(p.price).toBe('1000');
    expect(p.recvphone).toBe('01012345678');
    expect(p.smsuse).toBe('n');
    expect(p.var1).toBe('user-uuid');
    expect(p.var2).toBe('mentos_1');
    expect(p.feedbackurl).toBe('https://ref.supabase.co/functions/v1/payapp-feedback');
    expect(p.returnurl).toBe('https://app.test/success?orderId=mentos_1');
    expect(p.checkretry).toBe('y');
  });
});
