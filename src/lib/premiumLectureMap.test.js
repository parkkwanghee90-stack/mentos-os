import { describe, it, expect } from 'vitest';
import { toBaseId } from './premiumLectureMap';

describe('toBaseId', () => {
  it('maps 고차방정식 variants', () => {
    expect(toBaseId('고차방정식')).toBe('고차방정식');
    expect(toBaseId('09고차방정식 2단계')).toBe('고차방정식');
  });
  it('maps 미적분 sub-units before generic 정적분', () => {
    expect(toBaseId('미적분_정적분')).toBe('미적분_정적분');
    expect(toBaseId('미적분 삼각함수의 극한')).toBe('미적분_삼각함수극한');
  });
  it('maps 확통 units', () => {
    expect(toBaseId('원순열')).toBe('확통_순열');
    expect(toBaseId('이항정리')).toBe('확통_중복조합');
  });
  it('maps 수학2 정적분 to 부정적분과정적분', () => {
    expect(toBaseId('정적분')).toBe('부정적분과정적분');
  });
  it('returns input unchanged when no rule matches', () => {
    expect(toBaseId('unknown-xyz')).toBe('unknown-xyz');
  });
});
