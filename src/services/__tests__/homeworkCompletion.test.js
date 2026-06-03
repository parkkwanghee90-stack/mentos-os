import { describe, it, expect, beforeEach } from 'vitest';
import { buildSummaryMessage, recordCompletion, hasPushed } from '@/services/homeworkCompletion';

beforeEach(() => localStorage.clear());

describe('homeworkCompletion', () => {
  it('buildSummaryMessage: 요약 문자열에 핵심 지표 포함', () => {
    const msg = buildSummaryMessage('홍길동', { title: '다항식', accuracy: 80, correct: 8, total: 10, wrong: 2, minutes: 12 });
    expect(msg).toContain('홍길동');
    expect(msg).toContain('다항식');
    expect(msg).toContain('80');
  });

  it('recordCompletion: 최초 1회만 shouldPush=true', () => {
    const r1 = recordCompletion('hw_x', { title: 't', accuracy: 90, correct: 9, total: 10, wrong: 1, minutes: 5 });
    const r2 = recordCompletion('hw_x', { title: 't', accuracy: 90, correct: 9, total: 10, wrong: 1, minutes: 5 });
    expect(r1.shouldPush).toBe(true);
    expect(r2.shouldPush).toBe(false);
    expect(hasPushed('hw_x')).toBe(true);
  });
});
