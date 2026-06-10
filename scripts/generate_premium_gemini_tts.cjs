// Premium lecture TTS generator (slug SSOT).
// For each target lecture: pull its source JSON, re-upload it to premium_lectures/{slug}.json
// (migration to the clean slug), then synthesize the whole lecture in ONE Gemini call
// (timbre consistency) and silence-split into per-step MP3s. If the split count != step
// count (or the lecture is too long), fall back to per-step generation. Idempotent upload.
//
// Usage:
//   node scripts/generate_premium_gemini_tts.cjs                 # all GAP lectures from audit report
//   node scripts/generate_premium_gemini_tts.cjs --lecture line_eq   # one lecture by slug or modal id
//   node scripts/generate_premium_gemini_tts.cjs --limit 1       # first N targets
//   node scripts/generate_premium_gemini_tts.cjs --per-step      # skip single-call, force per-step
//   node scripts/generate_premium_gemini_tts.cjs --force         # regenerate even if present
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();

const LECTURES = require('../src/lib/premiumLectures.json');
const { cleanNarration } = require('./lib/ttsConfig.cjs');
const { makeKeyPool, generatePCM } = require('./lib/geminiTts.cjs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/mentos-assets`;
const BUCKET = 'mentos-assets';
const LOCAL_DIR = path.join('public', 'audio', 'premium_lectures');
const JSON_DIR = path.join('public', 'premium_lectures');
const PAUSE_MARKER = '\n\n.\n\n'; // a clear spoken pause between steps for silence detection
const MAX_CHARS_SINGLE_CALL = 2800; // above this, force per-step (avoids long-call drift/timeouts)
const STEP_DELAY_MS = parseInt(process.env.TTS_STEP_DELAY_MS, 10) || 8500; // inter-call spacing (paid tier can lower this)
// Extra Gemini keys from env only (never hardcode secrets):
const POOL_EXTRA = [process.env.VITE_GEMINI_API_KEY_2, process.env.VITE_GEMINI_API_KEY_3].filter(Boolean);

if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing Supabase env'); process.exit(1); }
fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(JSON_DIR, { recursive: true });

async function fetchSource(sourceJson) {
  const res = await fetch(`${PUBLIC_PREFIX}/premium_lectures/${sourceJson}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function uploadBuffer(buffer, remotePath, contentType) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${remotePath}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload ${remotePath} -> ${res.status} ${await res.text()}`);
}

async function audioExists(slug, step) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/audio/premium_lectures/${slug}/step_${step}.mp3`);
  if (!res.ok) return false;
  const info = await res.json().catch(() => null);
  return !!(info && info.size > 10240);
}

function pcmToMp3(pcmBuffer, outMp3) {
  const tmp = outMp3 + '.pcm';
  fs.writeFileSync(tmp, pcmBuffer);
  try {
    execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tmp}" -codec:a libmp3lame -qscale:a 2 "${outMp3}"`, { stdio: 'pipe' });
  } finally { try { fs.unlinkSync(tmp); } catch (e) {} }
  return fs.readFileSync(outMp3);
}

// Decode PCM to wav, detect silence gaps, return { wav, segs } where segs are speech ranges.
function detectSegments(pcmBuffer, workDir) {
  const pcm = path.join(workDir, '_full.pcm');
  const wav = path.join(workDir, '_full.wav');
  fs.writeFileSync(pcm, pcmBuffer);
  execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${pcm}" "${wav}"`, { stdio: 'pipe' });
  try { fs.unlinkSync(pcm); } catch (e) {}
  const log = execSync(`ffmpeg -i "${wav}" -af silencedetect=noise=-40dB:d=0.6 -f null - 2>&1 || true`, { encoding: 'utf8' });
  const dur = parseFloat((execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${wav}"`, { encoding: 'utf8' }) || '0').trim()) || 0;
  const starts = [...log.matchAll(/silence_start:\s*(-?[\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const segs = [];
  let cur = 0;
  for (let i = 0; i < starts.length; i++) {
    const s = Math.max(0, starts[i]);
    if (s - cur > 0.3) segs.push({ start: cur, end: s });
    cur = ends[i] != null ? ends[i] : s;
  }
  if (dur - cur > 0.3) segs.push({ start: cur, end: dur });
  return { wav, segs };
}

async function generatePerStep(voiced, slug, dir, pool, force) {
  for (const step of voiced) {
    if (!force && (await audioExists(slug, step.step))) { console.log(`    step ${step.step}: skip (exists)`); continue; }
    const pcm = await generatePCM(cleanNarration(step.narration), pool);
    const mp3 = pcmToMp3(pcm, path.join(dir, `step_${step.step}.mp3`));
    await uploadBuffer(mp3, `audio/premium_lectures/${slug}/step_${step.step}.mp3`, 'audio/mpeg');
    console.log(`    step ${step.step}: uploaded (per-step)`);
    await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
  }
}

async function generateSingleCall(voiced, slug, dir, pool) {
  const joined = voiced.map((s) => cleanNarration(s.narration)).join(PAUSE_MARKER);
  if (joined.length > MAX_CHARS_SINGLE_CALL) { console.log('    too long for single-call'); return false; }

  const pcm = await generatePCM(joined, pool);
  const { wav, segs } = detectSegments(pcm, dir);
  if (segs.length !== voiced.length) {
    console.log(`    single-call split mismatch (${segs.length} segs vs ${voiced.length} steps) -> per-step fallback`);
    try { fs.unlinkSync(wav); } catch (e) {}
    return false;
  }
  for (let i = 0; i < voiced.length; i++) {
    const step = voiced[i];
    const out = path.join(dir, `step_${step.step}.mp3`);
    const { start, end } = segs[i];
    execSync(`ffmpeg -y -i "${wav}" -ss ${start.toFixed(2)} -to ${end.toFixed(2)} -codec:a libmp3lame -qscale:a 2 "${out}"`, { stdio: 'pipe' });
    await uploadBuffer(fs.readFileSync(out), `audio/premium_lectures/${slug}/step_${step.step}.mp3`, 'audio/mpeg');
    console.log(`    step ${step.step}: uploaded (single-call seg ${i + 1}/${voiced.length})`);
  }
  try { fs.unlinkSync(wav); } catch (e) {}
  return true;
}

async function main() {
  const argv = process.argv;
  const force = argv.includes('--force');
  const perStepOnly = argv.includes('--per-step');
  const lectArg = argv.indexOf('--lecture') !== -1 ? argv[argv.indexOf('--lecture') + 1] : null;
  const limit = argv.indexOf('--limit') !== -1 ? parseInt(argv[argv.indexOf('--limit') + 1], 10) : 0;

  // Build target list from SSOT (lectureId -> {slug, sourceJson}).
  let targets = Object.entries(LECTURES).map(([lectureId, v]) => ({ lectureId, ...v }));
  if (lectArg) targets = targets.filter((t) => t.slug === lectArg || t.lectureId === lectArg);
  if (limit > 0) targets = targets.slice(0, limit);

  const pool = makeKeyPool(POOL_EXTRA);
  console.log(`🎙️ Premium TTS generation: ${targets.length} target lecture(s).`);

  for (const t of targets) {
    console.log(`\n>>> ${t.lectureId} (${t.slug})`);
    const json = await fetchSource(t.sourceJson);
    if (!json || !Array.isArray(json.steps)) { console.log(`  no source JSON (${t.sourceJson}), skip`); continue; }

    // Migrate the lecture JSON to the clean slug path so the player can fetch it.
    const localJson = path.join(JSON_DIR, `${t.slug}.json`);
    fs.writeFileSync(localJson, JSON.stringify(json, null, 2));
    try {
      await uploadBuffer(Buffer.from(JSON.stringify(json)), `premium_lectures/${t.slug}.json`, 'application/json');
      console.log(`  migrated JSON -> premium_lectures/${t.slug}.json`);
    } catch (e) { console.error(`  ⚠️ JSON migrate failed: ${e.message}`); }

    const voiced = json.steps.filter((s) => s.narration);
    if (voiced.length === 0) { console.log('  no voiced steps'); continue; }

    // Idempotent: skip if all steps already present (unless --force).
    if (!force) {
      let allPresent = true;
      for (const s of voiced) { if (!(await audioExists(t.slug, s.step))) { allPresent = false; break; } }
      if (allPresent) { console.log('  all steps present, skip'); continue; }
    }

    const dir = path.join(LOCAL_DIR, t.slug);
    fs.mkdirSync(dir, { recursive: true });
    try {
      let done = false;
      if (!perStepOnly && !force) done = await generateSingleCall(voiced, t.slug, dir, pool);
      if (!done) await generatePerStep(voiced, t.slug, dir, pool, force);
    } catch (e) { console.error(`  ❌ ${t.lectureId}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
  }
  console.log('\n🎉 Done. Re-run scripts/audit_premium_tts.cjs to confirm coverage.');
}
main().catch((e) => { console.error(e); process.exit(1); });
