import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildOrderId,
  normalizePhone,
  isValidPhone,
  buildPayappParams,
} from '../payappCheckout';

beforeEach(() => {
  vi.stubGlobal('window', { location: { origin: 'https://app.test' } });
  import.meta.env.VITE_PAYAPP_USERID = 'nuricampus';
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
  it('필수 파라미터(recvphone·var1) 구성, feedbackurl은 포함하지 않는다', () => {
    const p = buildPayappParams({ userId: 'user-uuid', orderId: 'mentos_1', recvphone: '01012345678' });
    expect(p.userid).toBe('nuricampus');
    expect(p.price).toBe('1000');
    expect(p.recvphone).toBe('01012345678');
    expect(p.var1).toBe('user-uuid');
    expect(p.var2).toBe('mentos_1');
    expect(p.returnurl).toBe('https://app.test/success?orderId=mentos_1');
    // feedbackurl은 lite 결제 엔드포인트가 거부(70080)하므로 절대 포함하지 않는다.
    expect(p.feedbackurl).toBeUndefined();
  });
});
