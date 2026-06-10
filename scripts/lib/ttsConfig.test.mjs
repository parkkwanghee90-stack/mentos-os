import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { cleanNarration, MODEL, VOICE } = require('./ttsConfig.cjs');

describe('ttsConfig', () => {
  it('fixes model and voice', () => {
    expect(MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(VOICE).toBe('Aoede');
  });
  it('converts fractions and roots to Korean reading', () => {
    expect(cleanNarration('$\\frac{1}{2}$')).toBe('2 분의 1');
    expect(cleanNarration('\\sqrt{3}')).toBe('루트 3');
  });
  it('strips color tags and collapses whitespace', () => {
    expect(cleanNarration('<blue>안녕</blue>   하세요')).toBe('안녕 하세요');
  });
  it('returns empty string for falsy input', () => {
    expect(cleanNarration('')).toBe('');
  });
  it('converts operator and symbol macros', () => {
    expect(cleanNarration('a \\pm b')).toBe('a 플러스 마이너스 b');
    expect(cleanNarration('2 \\times 3')).toBe('2 곱하기 3');
    expect(cleanNarration('\\alpha + \\beta')).toBe('알파 + 베타');
  });
  it('reads permutation notation and strips carets', () => {
    expect(cleanNarration('$_n\\mathrm{P}_r$')).toBe('n 피 알');
    expect(cleanNarration('x^2')).toBe('x2');
  });
});
