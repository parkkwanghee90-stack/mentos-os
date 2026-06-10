'use strict';

// Completion check for the auto-TTS job (gap-fill + legacy OpenAI overwrite).
// Prints exactly one of:
//   TTS_COMPLETE
//   TTS_INCOMPLETE gaps=<n> openai=<n>
// "Complete" = every required gap clip is present AND zero legacy-OpenAI clips remain
// in the overwrite-target stages. Used by auto_tts_quota.sh to decide the done-marker.
// No Gemini quota is consumed (only Supabase listing + header range-reads).

const fs = require('fs');
const { classifyRemoteClip } = require('./lib/tts_engine_classifier.cjs');

const envTxt = fs.readFileSync(__dirname + '/../.env', 'utf8');
const env = {};
for (const l of envTxt.split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const URL = env.VITE_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'math-tts';

// Gap clips that must exist after the run (42 quad gaps + the 2 task-(c) recoveries).
const range = (dir, lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => `${dir}/${String(lo + i).padStart(3, '0')}.mp3`);
const GAP_TARGETS = [
  ...range('quad_eq_s4', 4, 20),
  ...range('quad_func_s3', 16, 20),
  ...range('quad_func_s4', 1, 20),
  'complex_s3/015.mp3',
  'circle_s2/013.mp3',
  'point_s2/013.mp3',
];
// Stages whose legacy OpenAI clips must be overwritten (no OpenAI should remain).
const OVERWRITE_DIRS = ['cases_s4', 'circle_s2', 'circle_s4', 'line_s2', 'quad_ineq_s3', 'quad_ineq_s4', 'shape_move_s2', 'shape_move_s3', 'shape_move_s4'];

async function listDir(dir) {
  const r = await fetch(`${URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: `${dir}/`, limit: 200 }),
  });
  if (!r.ok) return [];
  const f = await r.json().catch(() => []);
  return (Array.isArray(f) ? f : []).filter((x) => x.name && x.name.endsWith('.mp3')).map((x) => `${dir}/${x.name}`);
}

async function pool(items, fn, n = 12) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k]);
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

(async () => {
  if (!URL || !KEY) {
    process.stdout.write('TTS_INCOMPLETE gaps=? openai=? (no supabase creds)');
    return;
  }
  // 1) Gap presence: collect all present clips across the relevant dirs once.
  const dirs = [...new Set([...GAP_TARGETS.map((p) => p.split('/')[0]), ...OVERWRITE_DIRS])];
  const listings = {};
  await pool(dirs, async (d) => { listings[d] = new Set(await listDir(d)); });
  const missingGaps = GAP_TARGETS.filter((p) => !listings[p.split('/')[0]].has(p));

  // 2) Remaining OpenAI in overwrite dirs.
  const overwriteClips = OVERWRITE_DIRS.flatMap((d) => [...listings[d]]);
  const engines = await pool(overwriteClips, async (p) => {
    try {
      return await classifyRemoteClip({ supabaseUrl: URL, key: KEY, bucket: BUCKET, remotePath: p });
    } catch (e) {
      return 'unknown';
    }
  });
  const openaiRemaining = engines.filter((e) => e === 'openai').length;

  if (missingGaps.length === 0 && openaiRemaining === 0) {
    process.stdout.write('TTS_COMPLETE');
  } else {
    process.stdout.write(`TTS_INCOMPLETE gaps=${missingGaps.length} openai=${openaiRemaining}`);
  }
})().catch((e) => process.stdout.write(`TTS_INCOMPLETE gaps=? openai=? (err ${e.message})`));
