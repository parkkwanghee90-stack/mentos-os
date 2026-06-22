import { describe, it, expect } from 'vitest';
import calc from './latexToSpeechCalc.cjs';

describe('latexToSpeechCalc 미적분 전처리', () => {
  it('정적분 구간을 한국어로 읽는다', () => {
    const out = calc.latexToSpeechCalc('\\displaystyle\\int_{1}^{2} x\\,dx');
    expect(out).toContain('1');
    expect(out).toContain('2');
    expect(out).toContain('적분');
    expect(out).not.toContain('\\int');
    expect(out).not.toContain('displaystyle');
  });
  it('분수 dfrac/frac을 ~분의~로', () => {
    expect(calc.latexToSpeechCalc('\\dfrac{3x+2}{x^2}')).toContain('분의');
  });
  it('ln과 lim을 한국어로', () => {
    expect(calc.latexToSpeechCalc('\\ln x')).toContain('자연로그');
    expect(calc.latexToSpeechCalc('\\lim_{x \\to 0} f(x)')).toContain('극한');
  });
  it('도함수 프라임을 읽는다', () => {
    expect(calc.latexToSpeechCalc("f'(x)")).toMatch(/프라임|도함수/);
  });
  it('LaTeX 명령 잔여가 없다', () => {
    const out = calc.latexToSpeechCalc('\\displaystyle\\int_0^1 \\dfrac{1}{x}\\,dx + \\ln 2');
    expect(out).not.toMatch(/\\[a-zA-Z]+/);
  });
  it('분자/분모에 지수가 있는 분수(중첩 중괄호)도 처리', () => {
    const out = calc.latexToSpeechCalc('\\dfrac{3x+2}{x^{2}}');
    expect(out).toContain('분의');
    expect(out).not.toContain('frac');
    expect(out).not.toMatch(/\\[a-zA-Z]+/);
  });
});
