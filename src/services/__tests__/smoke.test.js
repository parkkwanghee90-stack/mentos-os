import { describe, it, expect } from 'vitest';

describe('test infra', () => {
  it('localStorage available in jsdom', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    localStorage.clear();
  });
});
