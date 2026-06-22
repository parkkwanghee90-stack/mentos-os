import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  process.env.ELEVENLABS_API_KEY = 'sk_test';
  process.env.ELEVENLABS_VOICE_ID = 'voice123';
  process.env.ELEVENLABS_MODEL = 'eleven_multilingual_v2';
  vi.resetModules();
});

describe('ttsElevenLabs.synthesize', () => {
  it('voiceId 엔드포인트로 POST하고 mp3 buffer+chars 반환', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    const m = await import('./ttsElevenLabs.cjs');
    const r = await m.synthesize('테스트 문장');
    const url = String(global.fetch.mock.calls[0][0]);
    expect(url).toContain('/text-to-speech/voice123');
    expect(r.chars).toBe('테스트 문장'.length);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.model_id).toBe('eleven_multilingual_v2');
    expect(global.fetch.mock.calls[0][1].headers['xi-api-key']).toBe('sk_test');
  });
  it('키 미설정 시 throw', async () => {
    delete process.env.ELEVENLABS_API_KEY;
    vi.resetModules();
    const m = await import('./ttsElevenLabs.cjs');
    await expect(m.synthesize('x')).rejects.toThrow();
  });
  it('429는 status를 가진 에러로 throw(재시도 무의미)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => 'quota' });
    const m = await import('./ttsElevenLabs.cjs');
    await expect(m.synthesize('x')).rejects.toMatchObject({ status: 429 });
  });
});
