import { describe, it, expect } from 'vitest';
import { wrapPlainLatex } from '../latexWrap.js';

describe('wrapPlainLatex', () => {
  it('한글 사이의 un-wrapped 수식을 $…$로 감싼다', () => {
    const r = wrapPlainLatex('삼각형에서 a^2 = \\frac{1}{2}c^2 일 때');
    expect(r.output).toBe('삼각형에서 $a^2 = \\frac{1}{2}c^2$ 일 때');
    expect(r.wrapped).toBe(1);
  });
  it('이미 $…$로 감싼 수식은 건드리지 않는다', () => {
    const r = wrapPlainLatex('값 $x^2$ 이다');
    expect(r.output).toBe('값 $x^2$ 이다');
    expect(r.wrapped).toBe(0);
  });
  it('수식 신호가 없는 일반 텍스트/숫자는 감싸지 않는다', () => {
    expect(wrapPlainLatex('다음 그림과 같이 ① 2 ② 3').output).toBe('다음 그림과 같이 ① 2 ② 3');
  });
  it('katex 렌더 실패하는 모호한 run은 감싸지 않고 skipped에 기록', () => {
    const r = wrapPlainLatex('식 \\frac{1 임'); // 미닫힌 중괄호
    expect(r.output).toBe('식 \\frac{1 임');
    expect(r.wrapped).toBe(0);
    expect(r.skipped.length).toBe(1);
  });
  it('옵션 마커/구분자(리터럴 \\n)를 보존하며 각 보기 수식을 감싼다', () => {
    const r = wrapPlainLatex('① a^2\\n② \\sqrt{3}');
    expect(r.output).toBe('① $a^2$\\n② $\\sqrt{3}$');
    expect(r.wrapped).toBe(2);
  });
});
