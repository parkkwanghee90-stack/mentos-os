import { describe, it, expect, beforeEach } from 'vitest';
import {
  upsertWrong, applyResolved, computeActive, RETENTION_MS,
  getActiveUnresolvedWrongAnswers,
} from '@/services/wrongAnswerStore';

const T0 = 1_000_000_000_000; // 고정 기준 시각

describe('wrongAnswerStore 순수 헬퍼', () => {
  it('upsertWrong: 신규 오답 추가', () => {
    const next = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ hwId: 'hw_01', num: 3, resolved: false, firstWrongAt: T0 });
  });

  it('upsertWrong: 동일 문항 재오답 시 lastSeen 갱신·resolved 해제, firstWrongAt 유지', () => {
    const first = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    const resolved = applyResolved(first, 'hw_01', 3, T0 + 100);
    expect(resolved[0].resolved).toBe(true);
    const reWrong = upsertWrong(resolved, { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0 + 200);
    expect(reWrong).toHaveLength(1);
    expect(reWrong[0].resolved).toBe(false);
    expect(reWrong[0].firstWrongAt).toBe(T0);
    expect(reWrong[0].lastSeenAt).toBe(T0 + 200);
  });

  it('applyResolved: 목록에서 제거하지 않고 resolved 마킹', () => {
    const first = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    const next = applyResolved(first, 'hw_01', 3, T0 + 50);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ resolved: true, resolvedAt: T0 + 50 });
  });

  it('computeActive: 29일째 유지, 31일째 제거 (resolved 여부 무관)', () => {
    const entries = [
      { hwId: 'a', num: 1, firstWrongAt: T0, resolved: false },
      { hwId: 'b', num: 1, firstWrongAt: T0, resolved: true },
    ];
    const day29 = T0 + 29 * 24 * 60 * 60 * 1000;
    const day31 = T0 + 31 * 24 * 60 * 60 * 1000;
    expect(computeActive(entries, day29)).toHaveLength(2);
    expect(computeActive(entries, day31)).toHaveLength(0);
  });

  it('RETENTION_MS는 30일', () => {
    expect(RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});

describe('getActiveUnresolvedWrongAnswers', () => {
  beforeEach(() => localStorage.clear());

  it('resolved 항목은 제외하고 미해결만 반환한다', () => {
    const now = Date.now();
    localStorage.setItem('mentos_wrong_answers', JSON.stringify([
      { hwId: 'hw_01', num: 1, unit: 'u', answerKey: 'k', firstWrongAt: now, lastSeenAt: now, resolved: false, resolvedAt: null },
      { hwId: 'hw_01', num: 2, unit: 'u', answerKey: 'k', firstWrongAt: now, lastSeenAt: now, resolved: true, resolvedAt: now },
    ]));
    const r = getActiveUnresolvedWrongAnswers();
    expect(r).toHaveLength(1);
    expect(r[0].num).toBe(1);
  });

  it('30일 초과 만료 항목은 제외한다', () => {
    const now = Date.now();
    localStorage.setItem('mentos_wrong_answers', JSON.stringify([
      { hwId: 'hw_01', num: 1, unit: 'u', answerKey: 'k', firstWrongAt: now - 31 * 24 * 60 * 60 * 1000, lastSeenAt: now, resolved: false, resolvedAt: null },
    ]));
    expect(getActiveUnresolvedWrongAnswers(now)).toHaveLength(0);
  });
});
