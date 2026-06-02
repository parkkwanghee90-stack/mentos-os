import { describe, it, expect } from 'vitest';
import {
  verifyCredentials,
  decideAction,
  mapPaymentRow,
} from '../../../supabase/functions/payapp-feedback/lib.ts';

const creds = { userid: 'nuricampus', linkkey: 'KEY', linkval: 'VAL', expectedPrice: 1000 };

describe('verifyCredentials', () => {
  it('모든 값 일치 시 true', () => {
    const body = { userid: 'nuricampus', linkkey: 'KEY', linkval: 'VAL', price: '1000' };
    expect(verifyCredentials(body, creds)).toBe(true);
  });
  it('linkval 불일치 시 false', () => {
    const body = { userid: 'nuricampus', linkkey: 'KEY', linkval: 'WRONG', price: '1000' };
    expect(verifyCredentials(body, creds)).toBe(false);
  });
  it('금액 불일치 시 false', () => {
    const body = { userid: 'nuricampus', linkkey: 'KEY', linkval: 'VAL', price: '500' };
    expect(verifyCredentials(body, creds)).toBe(false);
  });
});

describe('decideAction', () => {
  it('4 → success', () => expect(decideAction('4')).toBe('success'));
  it('9 → cancelled', () => expect(decideAction('9')).toBe('cancelled'));
  it('64 → cancelled', () => expect(decideAction(64)).toBe('cancelled'));
  it('1 → pending', () => expect(decideAction('1')).toBe('pending'));
  it('알 수 없는 값 → ignore', () => expect(decideAction('999')).toBe('ignore'));
});

describe('mapPaymentRow', () => {
  it('success 행 매핑', () => {
    const body = { var1: 'user-uuid', var2: 'mentos_1', mul_no: '2000', price: '1000', pay_type: '1' };
    const row = mapPaymentRow(body, 'success', '2026-06-02T00:00:00.000Z');
    expect(row).toEqual({
      user_id: 'user-uuid',
      order_id: 'mentos_1',
      mul_no: 2000,
      amount: 1000,
      status: 'success',
      pay_type: 1,
      approved_at: '2026-06-02T00:00:00.000Z',
      raw: body,
    });
  });
  it('cancelled 행은 approved_at null', () => {
    const body = { var1: 'u', var2: 'o', mul_no: '3', price: '1000' };
    const row = mapPaymentRow(body, 'cancelled', '2026-06-02T00:00:00.000Z');
    expect(row.approved_at).toBeNull();
    expect(row.pay_type).toBeNull();
  });
});
