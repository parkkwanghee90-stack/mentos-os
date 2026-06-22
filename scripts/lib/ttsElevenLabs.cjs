'use strict';

const API = 'https://api.elevenlabs.io/v1';
const MODEL_DEFAULT = 'eleven_multilingual_v2';

function cfg() {
  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const model = process.env.ELEVENLABS_MODEL || MODEL_DEFAULT;
  if (!key) throw new Error('ELEVENLABS_API_KEY 미설정(.env)');
  if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID 미설정(.env)');
  return { key, voiceId, model };
}

// 텍스트 → { buffer(mp3), chars }. 일시 5xx/네트워크는 재시도, 401/402/429는 즉시 throw.
async function synthesize(text, retries = 3) {
  const { key, voiceId, model } = cfg();
  const url = `${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
    } catch (err) {
      if (attempt > retries) throw err;
      await new Promise(r => setTimeout(r, 3000 * attempt));
      continue;
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const e = new Error(`ElevenLabs HTTP ${res.status}: ${errText.slice(0, 200)}`);
      e.status = res.status;
      if ([401, 402, 429].includes(res.status) || attempt > retries) throw e;
      await new Promise(r => setTimeout(r, 3000 * attempt));
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, chars: text.length };
  }
}

// 사용량 조회 → { used, limit }
async function getUsage() {
  const { key } = cfg();
  const res = await fetch(`${API}/user/subscription`, { headers: { 'xi-api-key': key } });
  if (!res.ok) throw new Error(`subscription HTTP ${res.status}`);
  const j = await res.json();
  return { used: j.character_count, limit: j.character_limit };
}

module.exports = { synthesize, getUsage };
