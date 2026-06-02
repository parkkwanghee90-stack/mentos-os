import { describe, it, expect } from 'vitest';
import { normalizeMathText } from '../normalize.js';

describe('normalizeMathText', () => {
  it('리터럴 \\n(역슬래시+n)을 줄바꿈으로 바꾼다', () => {
    expect(normalizeMathText('① $1$\\n② $2$')).toBe('① $1$\n② $2$');
  });
  it('LaTeX 명령어 \\neq 등은 보호한다(줄바꿈으로 깨지지 않음)', () => {
    expect(normalizeMathText('$a \\neq b$')).toContain('\\neq');
  });
  it('빈 입력은 빈 문자열', () => {
    expect(normalizeMathText('')).toBe('');
    expect(normalizeMathText(null)).toBe('');
  });
});
