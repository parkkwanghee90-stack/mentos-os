import { describe, it, expect } from 'vitest';
import { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION } from './ttsVoice.js';

describe('ttsVoice 브라우저 미러', () => {
  it('canonical 모델/보이스를 노출한다', () => {
    expect(TTS_MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(TTS_VOICE).toBe('Aoede');
  });
  it('시스템 지침 문자열을 노출한다', () => {
    expect(typeof SYSTEM_INSTRUCTION).toBe('string');
    expect(SYSTEM_INSTRUCTION.length).toBeGreaterThan(10);
  });
});
