import { describe, it, expect } from 'vitest';
import { normalizeAnswer, gradeAnswer } from '@/lib/grading/normalizeAnswer';

describe('normalizeAnswer — 기존 동작 보존(회귀)', () => {
  it('공백 제거', () => expect(normalizeAnswer(' 3 ')).toBe('3'));
  it('원숫자 ①→1', () => expect(normalizeAnswer('①')).toBe('1'));
  it('변수 할당 접두 제거 x=', () => expect(normalizeAnswer('x=5')).toBe('5'));
  it('선행 + 제거', () => expect(normalizeAnswer('+7')).toBe('7'));
  it('정수형 소수 정리 5.0→5', () => expect(normalizeAnswer('5.0')).toBe('5'));
  it('빈값/널 → 빈문자', () => {
    expect(normalizeAnswer('')).toBe('');
    expect(normalizeAnswer(null)).toBe('');
    expect(normalizeAnswer(undefined)).toBe('');
  });
});

describe('gradeAnswer — 기본 스칼라', () => {
  it('정확 일치 정답', () => expect(gradeAnswer('5', '5')).toBe(true));
  it('불일치 오답', () => expect(gradeAnswer('6', '5')).toBe(false));
  it('빈 입력은 오답', () => expect(gradeAnswer('', '5')).toBe(false));
  it('콤마 숫자쌍은 순서 유의(집합 아님)', () => {
    expect(gradeAnswer('1,2', '2,1')).toBe(false);
  });
});

describe('gradeAnswer — LaTeX 정답(실데이터 16건)', () => {
  it('√ 루트: $\\sqrt{5}$', () => {
    expect(gradeAnswer('√5', '$\\sqrt{5}$')).toBe(true);
    expect(gradeAnswer('루트5', '$\\sqrt{5}$')).toBe(true);
    expect(gradeAnswer('sqrt5', '$\\sqrt{5}$')).toBe(true);
  });
  it('계수 있는 루트: $20\\sqrt{2}$', () => {
    expect(gradeAnswer('20√2', '$20\\sqrt{2}$')).toBe(true);
    expect(gradeAnswer('20루트2', '$20\\sqrt{2}$')).toBe(true);
  });
  it('로그: $2\\log_2 3$', () => {
    expect(gradeAnswer('2log23', '$2\\log_2 3$')).toBe(true);
  });
  it('분수: $\\frac{2}{3}$', () => {
    expect(gradeAnswer('2/3', '$\\frac{2}{3}$')).toBe(true);
  });
  it('루트 정답에 정수만 입력하면 오답', () => {
    expect(gradeAnswer('5', '$\\sqrt{5}$')).toBe(false);
  });
});

describe('gradeAnswer — ㄱㄴㄷ 보기형(실데이터 22건)', () => {
  it('콤마 없이 입력해도 정답', () => {
    expect(gradeAnswer('ㄱㄴ', 'ㄱ,ㄴ')).toBe(true);
  });
  it('순서 바꿔 입력해도 정답', () => {
    expect(gradeAnswer('ㄴ,ㄱ', 'ㄱ,ㄴ')).toBe(true);
    expect(gradeAnswer('ㄷㄱㄴ', 'ㄱ,ㄴ,ㄷ')).toBe(true);
  });
  it('부분집합/초과집합은 오답', () => {
    expect(gradeAnswer('ㄱ', 'ㄱ,ㄴ')).toBe(false);
    expect(gradeAnswer('ㄱㄴㄷ', 'ㄱ,ㄴ')).toBe(false);
  });
});

describe('gradeAnswer — 또는 복수정답(robustness)', () => {
  it('어느 한쪽이면 정답', () => {
    expect(gradeAnswer('32', '32 또는 14')).toBe(true);
    expect(gradeAnswer('14', '32 또는 14')).toBe(true);
  });
  it('둘 다 아니면 오답', () => {
    expect(gradeAnswer('15', '32 또는 14')).toBe(false);
  });
});
