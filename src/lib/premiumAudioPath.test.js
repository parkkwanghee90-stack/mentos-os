import { describe, it, expect } from 'vitest';
import { audioRelPath } from './premiumAudioPath';
import { getSafePath } from '@/config/pathMapping';

describe('audioRelPath', () => {
  it('returns an unencoded relative path (no %-encoding)', () => {
    const p = audioRelPath('고차방정식', 1);
    expect(p).toBe('/audio/premium_lectures/고차방정식/step_1.mp3');
    expect(p).not.toContain('%');
  });
  it('resolves via getSafePath to the English upload path (the bug fix)', () => {
    const rel = audioRelPath('고차방정식', 1).replace(/^\//, '');
    expect(getSafePath(rel)).toBe('audio/premium_lectures/higher_order_eq/step_1.mp3');
  });
  it('matches prob_cases mapping for 경우의수', () => {
    const rel = audioRelPath('경우의수', 3).replace(/^\//, '');
    expect(getSafePath(rel)).toBe('audio/premium_lectures/prob_cases/step_3.mp3');
  });
});
