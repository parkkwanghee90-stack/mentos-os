'use strict';

// Identify which TTS engine produced an existing clip in the Supabase `math-tts` bucket.
//
// Why this works (verified empirically against ffprobe on 2026-06-09):
//   - Gemini clips (bulk_generate_tts.cjs = Gemini 2.5, generate_gemini_*.cjs = Gemini 3.1)
//     are re-encoded by `ffmpeg -codec:a libmp3lame -qscale:a 2`, i.e. VBR. libmp3lame
//     ALWAYS writes a "Xing" (VBR) header in the first frame. Observed bitrate ~70-75 kbps.
//   - OpenAI clips (generate_tts.cjs, model tts-1-hd, voice nova) are stored as OpenAI's
//     RAW mp3 with no ffmpeg pass, so they carry NO Xing/Info header. Observed CBR 160/384 kbps.
//
// Therefore: first-frame header present => 'gemini'; absent => 'openai'.
// Note: regeneration is idempotent toward Gemini, so a rare misclassification only ever
// re-renders a clip as current Gemini 3.1 (no data loss) — never the reverse.

const DEFAULT_HEADER_BYTES = 8192;

async function classifyRemoteClip({ supabaseUrl, key, bucket, remotePath, headerBytes = DEFAULT_HEADER_BYTES }) {
  if (!supabaseUrl || !key) throw new Error('classifyRemoteClip: missing supabaseUrl/key');
  if (!bucket || !remotePath) throw new Error('classifyRemoteClip: missing bucket/remotePath');

  const url = `${supabaseUrl}/storage/v1/object/${bucket}/${remotePath}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, Range: `bytes=0-${headerBytes - 1}` },
    });
  } catch (err) {
    throw new Error(`classifyRemoteClip: fetch failed for ${remotePath}: ${err.message}`);
  }

  if (res.status === 404) return 'absent';
  if (![200, 206].includes(res.status)) {
    throw new Error(`classifyRemoteClip: HTTP ${res.status} for ${remotePath}`);
  }

  const head = Buffer.from(await res.arrayBuffer()).toString('latin1');
  if (head.length === 0) return 'absent';

  const hasVbrHeader = head.includes('Xing') || head.includes('Info');
  return hasVbrHeader ? 'gemini' : 'openai';
}

module.exports = { classifyRemoteClip, DEFAULT_HEADER_BYTES };
