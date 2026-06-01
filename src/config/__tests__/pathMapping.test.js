import { describe, it, expect } from 'vitest';
import { getSafePath } from '@/config/pathMapping';

describe('getSafePath 월/과목 매핑', () => {
  it('9월 모평 미적분 해설 경로를 sept/calculus로 변환', () => {
    expect(getSafePath('math_hints/CSAT_2025_9월_미적분/027.json'))
      .toBe('math_hints/CSAT_2025_sept_calculus/027.json');
  });

  it('3월 학평 미적분 해설 경로를 march/calculus로 변환', () => {
    expect(getSafePath('math_hints/CSAT_2024_3월_미적분/027.json'))
      .toBe('math_hints/CSAT_2024_march_calculus/027.json');
  });

  it('9월 확통은 과목 접미사 없이 sept로 변환', () => {
    expect(getSafePath('math_hints/CSAT_2023_9월_확통/027.json'))
      .toBe('math_hints/CSAT_2023_sept/027.json');
  });

  it('회귀: 6월은 기존대로 june 유지', () => {
    expect(getSafePath('math_hints/CSAT_2024_6월_미적분/027.json'))
      .toBe('math_hints/CSAT_2024_june_calculus/027.json');
  });
});
