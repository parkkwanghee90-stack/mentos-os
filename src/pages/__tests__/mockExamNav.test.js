import { describe, it, expect } from 'vitest';
import { answerableQuestions, nextHintProblem } from '../mockExamNav';

const Q = [
  { id: 1, text: '문제1' },
  { id: 2, picture: '/2.webp' },      // 이미지 전용도 풀이가능
  { id: 3, text: '   ' },              // 공백 텍스트 → 제외
  { id: 4, options: [] },              // 텍스트/이미지 없음 → 제외
  { id: 5, text: '문제5' },
];

describe('answerableQuestions', () => {
  it('텍스트(공백아님)/이미지 보유 문항만 남긴다', () => {
    const r = answerableQuestions(Q).map(q => q.id);
    expect(r).toEqual([1, 2, 5]);
  });
  it('배열이 아니면 빈 배열', () => {
    expect(answerableQuestions(null)).toEqual([]);
    expect(answerableQuestions(undefined)).toEqual([]);
  });
});

describe('nextHintProblem', () => {
  it('현재 문항의 다음 풀이가능 문항으로 진행한다', () => {
    const r = nextHintProblem(Q, 1);
    expect(r.hasNext).toBe(true);
    expect(r.next.id).toBe(2);     // 3,4 건너뛰지 않고 순서상 다음(2)
    expect(r.total).toBe(3);
  });
  it('중간 문항(2) 다음은 5 (placeholder 3,4 건너뜀)', () => {
    const r = nextHintProblem(Q, 2);
    expect(r.hasNext).toBe(true);
    expect(r.next.id).toBe(5);
  });
  it('마지막 문항이면 hasNext=false, next=null (버튼 비활성)', () => {
    const r = nextHintProblem(Q, 5);
    expect(r.hasNext).toBe(false);
    expect(r.next).toBe(null);
  });
  it('목록에 없는 id면 hasNext=false', () => {
    const r = nextHintProblem(Q, 999);
    expect(r.index).toBe(-1);
    expect(r.hasNext).toBe(false);
  });
  it('빈/비배열 입력에도 안전', () => {
    expect(nextHintProblem([], 1).hasNext).toBe(false);
    expect(nextHintProblem(null, 1).hasNext).toBe(false);
  });
  it('입력 배열을 변형하지 않는다(immutable)', () => {
    const snap = JSON.stringify(Q);
    nextHintProblem(Q, 1);
    expect(JSON.stringify(Q)).toBe(snap);
  });
});
