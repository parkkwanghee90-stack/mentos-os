import { describe, it, expect } from 'vitest';
import ttsVoice from './ttsVoice.cjs';

describe('ttsVoice SSOT', () => {
  it('canonical 모델/보이스를 노출한다', () => {
    expect(ttsVoice.TTS_MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(ttsVoice.TTS_VOICE).toBe('Aoede');
  });
  it('낭독 전용 시스템 지침을 노출한다', () => {
    expect(typeof ttsVoice.SYSTEM_INSTRUCTION).toBe('string');
    expect(ttsVoice.SYSTEM_INSTRUCTION.length).toBeGreaterThan(10);
  });
});
