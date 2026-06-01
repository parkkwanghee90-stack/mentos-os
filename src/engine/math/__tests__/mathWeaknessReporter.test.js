import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeMathWeakness } from '@/engine/math/mathWeaknessReporter';

beforeEach(() => { localStorage.clear(); });

function seedStore(entries) {
  const now = Date.now();
  localStorage.setItem('mentos_wrong_answers', JSON.stringify(
    entries.map(e => ({ resolved: false, resolvedAt: null, firstWrongAt: now, lastSeenAt: now, ...e }))
  ));
}

describe('analyzeMathWeakness 입력 C (오답스토어)', () => {
  it('모의고사 전용 오답(숙제 진도에 없음)이 취약단원에 반영된다', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w).toBeTruthy();
    expect(w.wrong).toBeGreaterThanOrEqual(1);
  });

  it('숙제+모의고사 동일 (hwId,num) 오답은 중복 계상하지 않는다', () => {
    localStorage.setItem('hw_progress_hw_01', JSON.stringify({ '005': { isCorrect: false } }));
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.wrong).toBe(1);
  });

  it('resolved(극복) 오답은 취약단원에 포함하지 않는다', () => {
    const now = Date.now();
    localStorage.setItem('mentos_wrong_answers', JSON.stringify([
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제',
        resolved: true, resolvedAt: now, firstWrongAt: now, lastSeenAt: now },
    ]));
    const { allWeakness } = analyzeMathWeakness();
    expect(allWeakness.find(x => x.unit === '다항식의 연산')).toBeFalsy();
  });

  it('errorRate 분모가 정상이다 (오답 1건 = 시도 1건)', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.errorRate).toBe(100);
    expect(w.total).toBeGreaterThanOrEqual(w.wrong);
  });
});
