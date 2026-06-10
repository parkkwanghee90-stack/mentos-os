import { describe, it, expect } from 'vitest';
import { detectIssues } from '../latexDetect.js';

describe('detectIssues', () => {
  it('P1: 줄 단위 $ 짝 불균형을 검출한다', () => {
    const issues = detectIssues('① $2\n② $\\sqrt{5}$');
    expect(issues.some((i) => i.code === 'P1')).toBe(true);
  });

  it('P3: $ 없는 plaintext 수식(frac/sqrt)을 검출한다', () => {
    const issues = detectIssues('정답은 frac34+fracsqrt22 입니다');
    const p3 = issues.find((i) => i.code === 'P3');
    expect(p3).toBeTruthy();
    expect(p3.grade).toBe('REVIEW'); // 토큰 경계 모호 → 수동
  });

  it('P5: $…$ 내부 KaTeX 파싱 실패를 검출한다', () => {
    const issues = detectIssues('$\\frac{1}{$'); // 미닫힌 중괄호
    expect(issues.some((i) => i.code === 'P5')).toBe(true);
  });

  it('정상 문자열은 빈 배열을 반환한다', () => {
    expect(detectIssues('값은 $x^2 + 1$ 이다.')).toEqual([]);
  });
});
