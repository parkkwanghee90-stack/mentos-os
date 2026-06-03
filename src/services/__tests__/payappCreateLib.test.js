import { describe, it, expect } from 'vitest';
import {
  buildCreateParams,
  parsePayappResponse,
  isCreateSuccess,
} from '../../../supabase/functions/payapp-create/lib.ts';

const input = {
  userid: 'nuricampus',
  userId: 'user-uuid',
  orderId: 'mentos_1',
  phone: '01012345678',
  price: 1000,
  goodname: 'Mentos 프리미엄',
  feedbackurl: 'https://ref.supabase.co/functions/v1/payapp-feedback',
  returnurl: 'https://app.test/success?orderId=mentos_1',
};

describe('buildCreateParams', () => {
  it('REST payrequest 파라미터를 구성한다', () => {
    const p = buildCreateParams(input);
    expect(p.cmd).toBe('payrequest');
    expect(p.userid).toBe('nuricampus');
    expect(p.price).toBe('1000');
    expect(p.recvphone).toBe('01012345678');
    expect(p.smsuse).toBe('n');
    expect(p.var1).toBe('user-uuid');
    expect(p.var2).toBe('mentos_1');
    expect(p.feedbackurl).toBe('https://ref.supabase.co/functions/v1/payapp-feedback');
    expect(p.returnurl).toBe('https://app.test/success?orderId=mentos_1');
  });
});

describe('parsePayappResponse', () => {
  it('성공 응답에서 payurl/mul_no를 디코드해 추출한다', () => {
    const text = 'state=1&errorMessage=&errno=00000&mul_no=115990848&payurl=https%3A%2F%2Fwww.payapp.kr%2Fz7QGw81&qrurl=x';
    const r = parsePayappResponse(text);
    expect(r.state).toBe('1');
    expect(r.errno).toBe('00000');
    expect(r.mulNo).toBe(115990848);
    expect(r.payurl).toBe('https://www.payapp.kr/z7QGw81');
    expect(isCreateSuccess(r)).toBe(true);
  });

  it('실패 응답을 성공으로 보지 않는다', () => {
    const text = 'state=0&errorMessage=%EC%98%A4%EB%A5%98&errno=70080&payurl=';
    const r = parsePayappResponse(text);
    expect(r.errno).toBe('70080');
    expect(r.payurl).toBeFalsy();
    expect(isCreateSuccess(r)).toBe(false);
  });
});
