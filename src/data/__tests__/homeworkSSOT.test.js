import { describe, it, expect } from 'vitest';
import { buildSolutionSrc } from '@/data/homeworkSSOT';

// 배경: 미적분 통합숙제 9개 폴더는 해설 이미지가 한 칸 밀려 저장돼 있다.
// 문제 N의 해설은 {N+1}a.webp 에 들어있다(문제 이미지 {N}.webp 는 정렬 정상).
// 그 외 과목(수학상/수학1/수학2) 숙제 폴더는 해설도 정렬 정상({N}a.webp).
describe('buildSolutionSrc', () => {
  describe('미적분 숙제 폴더 (해설 +1 시프트)', () => {
    it('문제 1의 해설은 002a.webp', () => {
      expect(buildSolutionSrc('/math_crops/숙제/미적분/04삼각함수미분/', 1))
        .toBe('/math_crops/숙제/미적분/04삼각함수미분/002a.webp');
    });

    it('마지막 문제(08단원 18번)의 해설은 019a.webp', () => {
      expect(buildSolutionSrc('/math_crops/숙제/미적분/08여러가지적분법/', 18))
        .toBe('/math_crops/숙제/미적분/08여러가지적분법/019a.webp');
    });

    it('자릿수 패딩: 문제 9 → 010a, 문제 99 → 100a', () => {
      expect(buildSolutionSrc('/math_crops/숙제/미적분/09정적분/', 9))
        .toBe('/math_crops/숙제/미적분/09정적분/010a.webp');
      expect(buildSolutionSrc('/math_crops/숙제/미적분/09정적분/', 99))
        .toBe('/math_crops/숙제/미적분/09정적분/100a.webp');
    });
  });

  describe('비(非)미적분 숙제 폴더 (해설 정렬 정상)', () => {
    it('수학상 문제 5의 해설은 005a.webp (시프트 없음)', () => {
      expect(buildSolutionSrc('/math_crops/숙제/수학상/01다항식/', 5))
        .toBe('/math_crops/숙제/수학상/01다항식/005a.webp');
    });

    it('수학1 문제 1의 해설은 001a.webp (시프트 없음)', () => {
      expect(buildSolutionSrc('/math_crops/숙제/수학1/10단원/', 1))
        .toBe('/math_crops/숙제/수학1/10단원/001a.webp');
    });
  });

  describe('가드', () => {
    it('imagePath가 비면 빈 문자열', () => {
      expect(buildSolutionSrc('', 1)).toBe('');
    });
  });
});
