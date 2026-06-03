import { describe, it, expect } from 'vitest';
import { gradeMonthlyTest, buildMonthlyParentMessage } from '@/engine/math/monthlyTest';

describe('monthlyTest', () => {
  it('gradeMonthlyTest: 정오답 채점 및 정확도 계산', () => {
    const problems = [
      { id: 'p1', unit: '다항식', correctAnswer: '3' },
      { id: 'p2', unit: '다항식', correctAnswer: '5' },
    ];
    const res = gradeMonthlyTest({ p1: '3', p2: '1' }, problems);
    expect(res.correctCount).toBe(1);
    expect(res.totalCount).toBe(2);
    expect(res.accuracy).toBe(50);
  });

  it('buildMonthlyParentMessage: 학생명·점수 포함', () => {
    const msg = buildMonthlyParentMessage('홍길동', { accuracy: 70, correctCount: 28, totalCount: 40, unitDiagnoses: [] });
    expect(msg).toContain('홍길동');
    expect(msg).toContain('70');
    expect(msg).toContain('월간');
  });
});
