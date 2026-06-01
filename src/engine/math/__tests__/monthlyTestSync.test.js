import { describe, it, expect, beforeEach } from 'vitest';
import { recordMonthlyTestWrongs, generateMonthlyTestProblems } from '@/engine/math/monthlyTest';
import { addWrong, getActiveWrongAnswers } from '@/services/wrongAnswerStore';

beforeEach(() => { localStorage.clear(); });

describe('recordMonthlyTestWrongs', () => {
  it('틀린 문제는 오답스토어에 추가된다', () => {
    const grading = { problemDetails: [
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: false },
    ] };
    recordMonthlyTestWrongs(grading);
    const active = getActiveWrongAnswers().filter(e => !e.resolved);
    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({ hwId: 'hw_01', num: 5, answerKey: '수학상_01다항식_통합숙제' });
  });

  it('맞힌 문제는 기존 오답을 resolved 처리한다', () => {
    addWrong({ hwId: 'hw_01', num: 7, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' });
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 7, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: true },
    ] });
    const entry = getActiveWrongAnswers().find(e => e.hwId === 'hw_01' && e.num === 7);
    expect(entry.resolved).toBe(true);
  });

  it('answerKey 없는 오답 항목은 skip한다', () => {
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 9, unit: '다항식의 연산', isCorrect: false },
    ] });
    expect(getActiveWrongAnswers()).toHaveLength(0);
  });

  it('숙제 진도(hw_progress)는 건드리지 않는다', () => {
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: false },
    ] });
    expect(localStorage.getItem('hw_progress_hw_01')).toBeNull();
  });

  it('grading이 비정상이어도 throw하지 않는다', () => {
    expect(() => recordMonthlyTestWrongs(null)).not.toThrow();
    expect(() => recordMonthlyTestWrongs({})).not.toThrow();
  });
});

describe('generateMonthlyTestProblems', () => {
  it('생성된 문제는 answerKey 문자열을 가진다', () => {
    const problems = generateMonthlyTestProblems('4~5등급');
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every(p => typeof p.answerKey === 'string' && p.answerKey.length > 0)).toBe(true);
  });
});
