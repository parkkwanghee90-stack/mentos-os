import { describe, it, expect } from 'vitest';
import q from './regenQuota.cjs';

describe('할당량/재개 로직', () => {
  it('done에 포함된 항목은 제외하고 남은 작업만 반환', () => {
    const remaining = q.remainingWork(
      [{ key: 'a/001.mp3' }, { key: 'a/002.mp3' }],
      { done: ['a/001.mp3'] }
    );
    expect(remaining.map(r => r.key)).toEqual(['a/002.mp3']);
  });
  it('progress가 비었을 때 전체 반환', () => {
    const remaining = q.remainingWork([{ key: 'a/001.mp3' }], {});
    expect(remaining).toHaveLength(1);
  });
  it('일일 한도만큼만 배치로 자른다', () => {
    const batch = q.takeBatch([{ key: '1' }, { key: '2' }, { key: '3' }], 2);
    expect(batch).toHaveLength(2);
  });
  it('남은 수가 한도보다 적으면 남은 만큼만', () => {
    const batch = q.takeBatch([{ key: '1' }], 100);
    expect(batch).toHaveLength(1);
  });
  it('429/quota 에러를 할당량 소진으로 판정', () => {
    expect(q.isQuotaExhausted({ status: 429 })).toBe(true);
    expect(q.isQuotaExhausted({ message: 'RESOURCE_EXHAUSTED' })).toBe(true);
    expect(q.isQuotaExhausted({ message: 'quota exceeded' })).toBe(true);
    expect(q.isQuotaExhausted({ status: 500 })).toBe(false);
    expect(q.isQuotaExhausted(null)).toBe(false);
  });
});
