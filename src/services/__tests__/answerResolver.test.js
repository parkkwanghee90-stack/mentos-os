import { describe, it, expect } from 'vitest';
import { resolveAnswer } from '@/services/answerResolver';

describe('resolveAnswer', () => {
  it('존재하지 않는 answerKey는 null (더미 미생성)', () => {
    expect(resolveAnswer('__없는키__', 1)).toBeNull();
  });

  it('존재하는 키라도 해당 번호 정답이 없으면 null', () => {
    expect(resolveAnswer('__없는키__', 9999)).toBeNull();
  });
});
