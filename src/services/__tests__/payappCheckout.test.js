import { describe, it, expect } from 'vitest';
import {
  buildOrderId,
  normalizePhone,
  isValidPhone,
} from '../payappCheckout';

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
