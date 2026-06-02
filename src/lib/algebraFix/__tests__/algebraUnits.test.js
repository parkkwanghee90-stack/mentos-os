import { describe, it, expect } from 'vitest';
import { getAlgebraUnitRoots, normalizeUnitKey, isAlgebraKey } from '../algebraUnits.js';

describe('algebraUnits', () => {
  it('대수(수학1) 단원 루트를 추출한다', () => {
    const roots = getAlgebraUnitRoots();
    expect(roots).toContain('삼각함수');
    expect(roots).toContain('지수');
    expect(roots).toContain('수열'); // 등차등비/수열의합
    expect(roots.length).toBeGreaterThanOrEqual(8);
  });

  it('단원키에서 루트와 단계를 정규화한다', () => {
    expect(normalizeUnitKey('삼각함수성질3단계')).toEqual({ root: '삼각함수성질', stage: '3' });
    expect(normalizeUnitKey('삼각함수활용 4단계(68)')).toEqual({ root: '삼각함수활용', stage: '4' });
    expect(normalizeUnitKey('삼각함수그래프')).toEqual({ root: '삼각함수그래프', stage: null });
  });

  it('대수 단원 키 여부를 판정한다', () => {
    expect(isAlgebraKey('삼각함수활용3단계')).toBe(true);
    expect(isAlgebraKey('(1)일차부등식 개념2단계(26) 1+1(쌍둥이)')).toBe(false);
    expect(isAlgebraKey('지수로그함수활용3단계')).toBe(true);
    expect(isAlgebraKey('등차등비2단계')).toBe(true);
    expect(isAlgebraKey('(2)이차부등식 개념2단계(42)p21 1+1(쌍둥이)')).toBe(false);
  });

  it('미적분 단원은 대수 토큰을 부분 포함해도 제외한다', () => {
    expect(isAlgebraKey('3)지수로그삼각함수의 미분법 4단계')).toBe(false);
    expect(isAlgebraKey('4)삼각함수합성과미분')).toBe(false);
    expect(isAlgebraKey('3)지수로그함수의극한')).toBe(false);
  });
});
