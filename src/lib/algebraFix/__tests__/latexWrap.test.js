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
  it('$$…$$ 디스플레이 수식을 보존하고 $$$를 만들지 않는다', () => {
    const r = wrapPlainLatex('식 $$a^2 = b$$ 그리고 c^2 임');
    expect(r.output).toBe('식 $$a^2 = b$$ 그리고 $c^2$ 임');
    expect(r.output).not.toContain('$$$');
  });
  it('기존 $ 구조가 불균형이면(홀수/stray) 그 부분은 래핑하지 않는다', () => {
    const r = wrapPlainLatex('① $3$\\sqrt{3}$ ② 2');
    expect(r.output).toBe('① $3$\\sqrt{3}$ ② 2'); // 변경 없음
    expect(r.output).not.toContain('$$$');
  });
  it('un-wrapped + $짝깨짐이 섞인 항목은 손대지 않는다($$$ 생성 금지)', () => {
    const raw = '다음 $\\triangle ABC$에서? ① $3:2 ② 2:1 ③ 3:1 ④ 3$\\sqrt{2}$ : 2$\\sqrt{3}$';
    const r = wrapPlainLatex(raw);
    expect(r.output).not.toContain('$$$');
    // 안전: 깨끗하게 못 고치면 원본 유지
    expect(r.output).toBe(raw);
  });
  it('인라인을 디스플레이로 바꾸는(새 $$ 생성) 변환은 거부하고 원본 유지', () => {
    // 실데이터 삼각함수활용2단계/003.webp: stray $ 짝이 어긋나 인라인 $..$ → $$..$$ 로 오염되던 케이스
    const raw =
      '다음 그림과 같은 $\\triangle ABC$에서 $\\overline{BD} : \\overline{DC}$는? ① $3:2 ② 2:1 ③ 3:1 ④ 3$\\sqrt{2}$ : 2$\\sqrt{3}$ ⑤ 3$\\sqrt{3}$ : 2$\\sqrt{2}';
    const r = wrapPlainLatex(raw);
    expect(r.output).toBe(raw);          // 변경 없음
    expect(r.output).not.toMatch(/\$\$/); // 새 $$ 없음
  });
});
