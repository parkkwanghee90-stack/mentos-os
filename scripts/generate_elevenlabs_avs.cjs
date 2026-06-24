'use strict';
require('dotenv').config();
const fs = require('fs');
const { synthesize, getUsage } = require('./lib/ttsElevenLabs.cjs');
const { extractNarration } = require('./lib/extractNarration.cjs');
const q = require('./lib/elevenlabsQuota.cjs');

const U = process.env.VITE_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HINT_BUCKET = 'mentos-assets';
const TTS_BUCKET = 'math-tts';
const MAP = 'scripts/tts_elevenlabs_map.json';
const PROGRESS = 'scripts/tts_elevenlabs_progress.json';
const MANIFEST = 'scripts/tts_manifest.json';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const VOICE = process.env.ELEVENLABS_VOICE_ID;
const SAFETY = Number(process.env.ELEVEN_SAFETY || 2000);

if (!U || !K) { console.error('Supabase 키 미설정'); process.exit(1); }

async function fetchHint(hintDir, pid) {
  const url = `${U}/storage/v1/object/public/${HINT_BUCKET}/math_hints/${hintDir}/${pid}.json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`hint ${hintDir}/${pid}: ${r.status}`);
  return JSON.parse(await r.text());
}
async function upload(buffer, remotePath, retries = 3) {
  const url = `${U}/storage/v1/object/${TTS_BUCKET}/${remotePath}`;
  for (let a = 1; ; a++) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${K}`, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
      body: buffer,
    });
    if (r.ok) return;
    if (a > retries) throw new Error(`upload ${remotePath}: ${r.status}`);
    await new Promise(x => setTimeout(x, 3000 * a));
  }
}
function recordManifest(remotePath, bytes, chars) {
  let cur = {};
  try { cur = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) || {}; } catch {}
  cur[remotePath] = { engine: 'elevenlabs', model: MODEL, voiceId: VOICE, bytes, chars, generatedAt: new Date().toISOString() };
  fs.writeFileSync(MANIFEST, JSON.stringify(cur, null, 2));
}
function loadJson(p, d) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return d; } }

(async () => {
  const isPlan = process.argv.includes('--plan');
  const { map } = JSON.parse(fs.readFileSync(MAP, 'utf8'));
  // 작업 평탄화: { key, hintDir, ttsDir, pid }
  const items = [];
  for (const [hintDir, info] of Object.entries(map)) {
    for (const pid of info.pids) items.push({ key: `${info.ttsDir}/${pid}.mp3`, hintDir, ttsDir: info.ttsDir, pid });
  }
  const progress = loadJson(PROGRESS, { done: [] });
  const todo = q.remaining(items, progress);

  const usage = await getUsage();
  console.log(`사용량 ${usage.used}/${usage.limit}자 (남은 ${usage.limit - usage.used}) | 남은 작업 ${todo.length}/${items.length}`);
  if (isPlan) { console.log('--plan: 생성 없이 종료'); return; }

  let used = usage.used;
  let made = 0;
  for (const it of todo) {
    let data;
    try { data = await fetchHint(it.hintDir, it.pid); }
    catch (e) { console.log(`SKIP ${it.key}: ${e.message}`); continue; }
    const text = extractNarration(data);
    if (!text || text.length < 10) { console.log(`SKIP ${it.key}: 낭독텍스트 없음`); continue; }
    if (q.wouldExceed(used, text.length, usage.limit - SAFETY)) {
      console.log(`한도 임박 — 중단(used ${used}, 다음 ${text.length}자). 진행 저장 후 종료.`);
      break;
    }
    try {
      const { buffer, chars } = await synthesize(text);
      await upload(buffer, it.key);
      recordManifest(it.key, buffer.length, chars);
      used += chars;
      progress.done.push(it.key);
      made++;
      if (made % 10 === 0) fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
      console.log(`DONE ${it.key} (${chars}자, 누적 ${used})`);
    } catch (e) {
      fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
      if (q.isQuotaError(e)) { console.log(`한도/인증 소진(${e.status||e.message}) — 진행 저장 후 종료.`); break; }
      console.log(`ERR ${it.key}: ${e.message}`);
    }
  }
  fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
  console.log(`배치 완료. 이번 생성 ${made} | 누적 done ${progress.done.length}.`);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
