import { describe, it, expect } from 'vitest';
import q from './elevenlabsQuota.cjs';

describe('elevenlabsQuota', () => {
  it('done 제외한 남은 작업 반환', () => {
    const r = q.remaining([{ key: 'a/001.mp3' }, { key: 'a/002.mp3' }], { done: ['a/001.mp3'] });
    expect(r.map(x => x.key)).toEqual(['a/002.mp3']);
  });
  it('progress가 비어도 전체 반환', () => {
    expect(q.remaining([{ key: 'a/001.mp3' }], {})).toHaveLength(1);
    expect(q.remaining([{ key: 'a/001.mp3' }], undefined)).toHaveLength(1);
  });
  it('다음 클립이 한도를 넘기면 true', () => {
    expect(q.wouldExceed(130000, 1500, 131000)).toBe(true);
    expect(q.wouldExceed(100000, 1500, 131000)).toBe(false);
  });
  it('429/401/402/quota 에러를 한도소진으로 판정', () => {
    expect(q.isQuotaError({ status: 429 })).toBe(true);
    expect(q.isQuotaError({ status: 401 })).toBe(true);
    expect(q.isQuotaError({ status: 402 })).toBe(true);
    expect(q.isQuotaError({ message: 'quota_exceeded' })).toBe(true);
    expect(q.isQuotaError({ status: 500 })).toBe(false);
    expect(q.isQuotaError(null)).toBe(false);
  });
});
