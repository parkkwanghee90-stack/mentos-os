import { describe, it, expect } from 'vitest';
import ex from './extractNarration.cjs';

describe('extractNarration', () => {
  it('P/C/B/S phase steps에서 낭독문 생성(A=정답 제외)', () => {
    const data = { steps: [
      { phase: 'P', content: '$\\int_0^1 x\\,dx$ 의 값' },
      { phase: 'C', content: '구간은 0부터 1' },
      { phase: 'B', content: '정적분 공식' },
      { phase: 'S', content: '$\\dfrac{1}{2}$' },
      { phase: 'A', content: '정답 노출 금지' },
    ]};
    const out = ex.extractNarration(data);
    expect(out).toContain('적분');
    expect(out).toContain('분의');
    expect(out).not.toContain('정답 노출 금지');
    expect(out).not.toMatch(/\\[a-zA-Z]+/);
  });
  it('top-level P/C/B/S 스키마도 처리', () => {
    const out = ex.extractNarration({ P: '극한을 구한다', C: '조건', B: '개념', S: '풀이', A: '답' });
    expect(out).toContain('극한을 구한다');
    expect(out).not.toContain('답');
  });
  it('label P: 스키마도 처리', () => {
    const out = ex.extractNarration({ steps: [{ label: 'P: 구하는 것', content: '넓이' }] });
    expect(out).toContain('넓이');
  });
  it('낭독 텍스트가 없으면 빈 문자열', () => {
    expect(ex.extractNarration({})).toBe('');
    expect(ex.extractNarration({ steps: [] })).toBe('');
    expect(ex.extractNarration(null)).toBe('');
  });
});
