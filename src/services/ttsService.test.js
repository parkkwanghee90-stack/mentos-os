import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  global.fetch = vi.fn();
  import.meta.env.VITE_GEMINI_API_KEY = 'test-key';
  global.Audio = vi.fn(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(), set src(v) {}, get src() { return ''; },
    onended: null, onerror: null, currentTime: 0,
  }));
  global.URL.createObjectURL = vi.fn(() => 'blob:x');
  global.URL.revokeObjectURL = vi.fn();
});

describe('speakText 런타임', () => {
  it('Gemini 3.1 모델 엔드포인트로 호출한다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ inlineData: { data: btoa('x'), mimeType: 'audio/mp3' } }] } }] }),
    });
    const { speakText } = await import('./ttsService.js');
    await speakText('이차방정식을 풀어봅시다', { isReplay: true });
    const url = String(global.fetch.mock.calls[0][0]);
    expect(url).toContain('gemini-3.1-flash-tts-preview:generateContent');
  });

  it('OpenAI(api.openai.com / tts-1)를 절대 호출하지 않고, 실패 시 무음+onError', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) });
    const onError = vi.fn();
    const { speakText } = await import('./ttsService.js');
    await speakText('테스트', { isReplay: true, onError });
    const calledUrls = global.fetch.mock.calls.map(c => String(c[0]));
    expect(calledUrls.some(u => u.includes('openai') || u.includes('tts-1'))).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it('실패 시 브라우저 speechSynthesis.speak 로도 말하지 않는다(무음)', async () => {
    const speak = vi.fn();
    global.speechSynthesis = { speak, cancel: vi.fn() };
    global.SpeechSynthesisUtterance = vi.fn();
    global.fetch.mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) });
    const { speakText } = await import('./ttsService.js');
    await speakText('테스트', { isReplay: true });
    expect(speak).not.toHaveBeenCalled();
  });
});
