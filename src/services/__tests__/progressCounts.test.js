import { describe, it, expect } from 'vitest';
import { computeSolvedCounts } from '@/services/progressCounts';

describe('computeSolvedCounts', () => {
  it('현재 problems 집합만 집계 (stale 키 무시)', () => {
    const problems = [{ problemId: 'a' }, { problemId: 'b' }];
    const solved = { a: { isCorrect: true }, b: { isCorrect: false }, stale: { isCorrect: true } };
    const r = computeSolvedCounts(problems, solved);
    expect(r.answeredCount).toBe(2);
    expect(r.correctCount).toBe(1);
    expect(r.wrongCount).toBe(1);
    expect(r.totalProblems).toBe(2);
    expect(r.isAllSolved).toBe(true);
  });

  it('미응답 있으면 isAllSolved=false', () => {
    const problems = [{ problemId: 'a' }, { problemId: 'b' }];
    const solved = { a: { isCorrect: true } };
    const r = computeSolvedCounts(problems, solved);
    expect(r.answeredCount).toBe(1);
    expect(r.isAllSolved).toBe(false);
  });

  it('빈 problems면 isAllSolved=false', () => {
    expect(computeSolvedCounts([], {}).isAllSolved).toBe(false);
  });
});
