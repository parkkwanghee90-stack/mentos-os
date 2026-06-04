import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { makeKeyPool, generatePCM } = require('./geminiTts.cjs');

function audioResponse() {
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ inlineData: { data: Buffer.from('hi').toString('base64') } }] } }],
    }),
  };
}
function quotaResponse() {
  return { ok: false, status: 429, json: async () => ({ error: { message: 'RESOURCE_EXHAUSTED' } }) };
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('geminiTts', () => {
  it('makeKeyPool throws with no keys', () => {
    const prev = process.env.VITE_GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;
    expect(() => makeKeyPool()).toThrow();
    if (prev !== undefined) process.env.VITE_GEMINI_API_KEY = prev;
  });

  it('returns a Buffer on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => audioResponse()));
    const pool = makeKeyPool(['KEY_A']);
    const buf = await generatePCM('hello', pool);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.toString()).toBe('hi');
  });

  it('rotates to the next key on 429 then succeeds', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => quotaResponse())
      .mockImplementationOnce(async () => audioResponse());
    vi.stubGlobal('fetch', fetchMock);
    const pool = makeKeyPool(['KEY_A', 'KEY_B']);
    const p = generatePCM('hello', pool);
    await vi.runAllTimersAsync();
    const buf = await p;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pool.i).toBe(1);
    expect(buf.toString()).toBe('hi');
  });
});
