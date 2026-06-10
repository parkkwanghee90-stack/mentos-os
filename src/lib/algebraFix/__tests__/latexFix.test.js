import { describe, it, expect } from 'vitest';
import { autoFix } from '../latexFix.js';

describe('autoFix', () => {
  it('APPEND-CLOSE: 보기줄 닫는 $ 보강 (리터럴 \\n 구분자 보존)', () => {
    const r = autoFix('① $1\\n② $2\\n⑤ $\\sqrt{5}');
    expect(r.output).toBe('① $1$\\n② $2$\\n⑤ $\\sqrt{5}$');
    expect(r.applied).toContain('APPEND-CLOSE');
  });
  it('REMOVE-STRAY: 보기줄 끝 잘못된 $ 제거', () => {
    const r = autoFix('① 2\\n⑤ 3$');
    expect(r.output).toBe('① 2\\n⑤ 3');
    expect(r.applied).toContain('REMOVE-STRAY');
  });
  it('중괄호 불균형이면 APPEND-CLOSE 미적용(REVIEW로 남김)', () => {
    const r = autoFix('① $\\frac{1');   // 미닫힌 중괄호
    expect(r.output).toBe('① $\\frac{1');
    expect(r.applied).toEqual([]);
  });
  it('비보기 줄/정상 입력은 변경 없음', () => {
    expect(autoFix('값은 $x^2$ 이다.').output).toBe('값은 $x^2$ 이다.');
    expect(autoFix('설명 텍스트 frac34 입니다').output).toBe('설명 텍스트 frac34 입니다');
  });
});
