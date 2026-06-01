// Shared Gemini TTS call with API-key pool rotation + retry. Returns raw PCM Buffer.
const { MODEL, buildPrompt, SPEECH_CONFIG } = require('./ttsConfig.cjs');

function makeKeyPool(extraKeys = []) {
  const keys = [process.env.VITE_GEMINI_API_KEY, ...extraKeys].filter(Boolean);
  if (keys.length === 0) throw new Error('No Gemini API keys (set VITE_GEMINI_API_KEY)');
  return { keys, i: 0 };
}

async function generatePCM(text, pool, retries = 3) {
  const promptText = buildPrompt(text);
  for (let attempt = 1; attempt <= retries; attempt++) {
    const key = pool.keys[pool.i];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseModalities: ['AUDIO'], speechConfig: SPEECH_CONFIG },
          }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const msg = j?.error?.message || `Gemini HTTP ${res.status}`;
        if (res.status === 429 || /quota|QUOTA|RESOURCE_EXHAUSTED/.test(msg)) {
          if (pool.i < pool.keys.length - 1) {
            pool.i++;
            attempt = 0;
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
        }
        throw new Error(msg);
      }
      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part?.inlineData?.data) throw new Error('No audio data in Gemini response');
      return Buffer.from(part.inlineData.data, 'base64');
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

module.exports = { makeKeyPool, generatePCM };
