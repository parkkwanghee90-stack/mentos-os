import { describe, it, expect } from 'vitest';
import { mergeByTimestamp } from '@/services/syncService';

describe('mergeByTimestamp', () => {
  it('같은 키는 updated_at이 큰 쪽이 이김', () => {
    const local = [{ key: 'a', updated_at: 100, v: 'L' }];
    const remote = [{ key: 'a', updated_at: 200, v: 'R' }];
    const merged = mergeByTimestamp(local, remote, e => e.key);
    expect(merged).toHaveLength(1);
    expect(merged[0].v).toBe('R');
  });

  it('서로 다른 키는 합집합', () => {
    const local = [{ key: 'a', updated_at: 100 }];
    const remote = [{ key: 'b', updated_at: 100 }];
    const merged = mergeByTimestamp(local, remote, e => e.key);
    expect(merged).toHaveLength(2);
  });
});
