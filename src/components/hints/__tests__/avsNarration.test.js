import { describe, it, expect } from 'vitest';
import { buildAvsNarration, buildProblemNarration } from '../avsNarration';

describe('buildAvsNarration', () => {
  it('스텝 산문(prose)을 연결하고 빈 값/raw LaTeX는 제외한다', () => {
    const steps = [
      { title: '1단계', caption: '구하는 것은 a', latex: 'x^2+1' },
      { content: '조건을 분석하면 b' },
      { lines: [{ type: 'text', content: '핵심 개념 c' }, { type: 'latex', content: '\\frac{a}{b}' }] },
      null,
      { text: '   ' },
    ];
    const r = buildAvsNarration(steps);
    expect(r).toContain('1단계');
    expect(r).toContain('구하는 것은 a');
    expect(r).toContain('조건을 분석하면 b');
    expect(r).toContain('핵심 개념 c');
    // raw LaTeX (s.latex 필드 / type:'latex' 라인)는 낭독 대본에서 제외
    expect(r).not.toContain('x^2+1');
    expect(r).not.toContain('frac');
  });

  it('배열이 아니면 빈 문자열을 반환한다', () => {
    expect(buildAvsNarration(null)).toBe('');
    expect(buildAvsNarration(undefined)).toBe('');
    expect(buildAvsNarration({})).toBe('');
  });

  it('입력 스텝 배열을 변형하지 않는다(immutable)', () => {
    const steps = [{ text: '원본' }];
    const snapshot = JSON.stringify(steps);
    buildAvsNarration(steps);
    expect(JSON.stringify(steps)).toBe(snapshot);
  });
});

describe('buildProblemNarration', () => {
  it('문제문과 힌트 단계(bg1..bgN)를 숫자 순서대로 포함한다', () => {
    const q = { id: 15, text: '문제 본문', hint: { clue: '단서', bg1: '배경1', bg2: '배경2', bg4: '배경4', bg5: '배경5' } };
    const r = buildProblemNarration(q);
    expect(r).toContain('문제 본문');
    expect(r).toContain('단서');
    expect(r).toContain('배경1');
    expect(r).toContain('배경5'); // bg5 도 누락되지 않음 (일반화)
    // 순서: 단서 → 배경1 → 배경2 → 배경4 → 배경5
    expect(r.indexOf('배경1')).toBeLessThan(r.indexOf('배경2'));
    expect(r.indexOf('배경2')).toBeLessThan(r.indexOf('배경4'));
    expect(r.indexOf('배경4')).toBeLessThan(r.indexOf('배경5'));
  });

  it('이미지 전용 문항(텍스트 없음)은 빈 문자열을 반환한다', () => {
    expect(buildProblemNarration({ id: 1, picture: '/x.webp' })).toBe('');
    expect(buildProblemNarration(null)).toBe('');
  });
});
