import { describe, it, expect } from 'vitest';
import { parseRichSolution } from '../AlgebraHintPlayer.jsx';

describe('parseRichSolution (수학상 본수업 AVS 해설 텍스트 파서)', () => {
  it('빈 입력은 빈 배열', () => {
    expect(parseRichSolution('')).toEqual([]);
    expect(parseRichSolution(null)).toEqual([]);
    expect(parseRichSolution(undefined)).toEqual([]);
  });

  it('순수 텍스트는 단일 text 토큰', () => {
    expect(parseRichSolution('곱셈 공식을 이용한다')).toEqual([
      { type: 'text', value: '곱셈 공식을 이용한다' },
    ]);
  });

  it('텍스트 + 인라인 수식($...$) 분리', () => {
    expect(parseRichSolution('주어진 식 $(x+2y)^2$을 전개')).toEqual([
      { type: 'text', value: '주어진 식 ' },
      { type: 'math', value: '(x+2y)^2' },
      { type: 'text', value: '을 전개' },
    ]);
  });

  it('순수 수식(finalAnswer 형태)은 단일 math 토큰', () => {
    expect(parseRichSolution('$x^2+4y^2+9z^2$')).toEqual([
      { type: 'math', value: 'x^2+4y^2+9z^2' },
    ]);
  });

  it('LaTeX 줄바꿈(\\\\)을 br 토큰으로 분리', () => {
    // 실제 JSON 문자열에 담긴 두 개의 백슬래시(\\) = LaTeX 줄바꿈
    expect(parseRichSolution('앞줄\\\\뒷줄')).toEqual([
      { type: 'text', value: '앞줄' },
      { type: 'br' },
      { type: 'text', value: '뒷줄' },
    ]);
  });

  it('실제 데이터 형태(텍스트 + 줄바꿈 + 인라인 수식)', () => {
    const real = '세 항의 합의 제곱 공식은 다음과 같습니다.\\\\ $(a+b+c)^2 = a^2+b^2+c^2$';
    expect(parseRichSolution(real)).toEqual([
      { type: 'text', value: '세 항의 합의 제곱 공식은 다음과 같습니다.' },
      { type: 'br' },
      { type: 'text', value: ' ' },
      { type: 'math', value: '(a+b+c)^2 = a^2+b^2+c^2' },
    ]);
  });

  it('수식 내부 백슬래시는 보존된다(\\frac 등)', () => {
    const tokens = parseRichSolution('값은 $\\frac{1}{2}$ 이다');
    expect(tokens).toEqual([
      { type: 'text', value: '값은 ' },
      { type: 'math', value: '\\frac{1}{2}' },
      { type: 'text', value: ' 이다' },
    ]);
  });
});
