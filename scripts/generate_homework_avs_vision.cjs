#!/usr/bin/env node
/**
 * 수학상 통합숙제 AVS 비전 생성기 (고차방정식 이후 5개 단원)
 *
 * 문제 이미지({NNN}.webp) + 해설 이미지({NNN}a.webp)를 Gemini 비전으로 분석하여
 * 문제별 PCBSA 단계별 힌트 JSON을 생성한다.
 *  - P/C/B: 이 문제 고유의 구하는 것 / 단서 / 핵심 개념
 *  - S: 해설 이미지의 풀이를 줄 단위 단계로 (HintPlayerRouter가 \n 분리로 단계 재생)
 *  - A/finalAnswer: 기존 JSON의 검증된 정답 보존, 비전 판독 답과 불일치 시 업로드 보류+리포트
 *
 * 출력: src/data/homework_avs/{hintKey}/{NNN}.json (로컬, git 추적)
 *       + Supabase math_hints/{safeKey}/{NNN}.json 업서트 (앱 서빙 경로)
 * 재개: scripts/homework_avs_manifest.json
 *
 * 사용: node scripts/generate_homework_avs_vision.cjs <unitKey|all> [--dry-run] [--limit N] [--force]
 *   unitKey: 09고차방정식 | 10일차부등식 | 11이차부등식 | 12경우의수 | 13행렬
 */
const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch {}
const { getSafePath } = require('../src/config/pathMapping');

// ── 설정 ──
const SUPABASE_URL = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co';
const BUCKET = 'mentos-assets';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
const MODEL = 'gemini-2.5-flash';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEYS = [
  process.env.VITE_GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY_2,
  process.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean);

const UNITS = {
  '09고차방정식': { hintKey: '수학상_09고차방정식_통합숙제', problemCount: 20 }, // 021·022는 유령 슬롯(원본 20문제)
  '10일차부등식': { hintKey: '수학상_10일차부등식_통합숙제', problemCount: 13 }, // 꼬리 2개는 유령 슬롯
  '11이차부등식': { hintKey: '수학상_11이차부등식_통합숙제', problemCount: 30 }, // 꼬리 2개는 유령 슬롯
  '12경우의수': { hintKey: '수학상_12경우의수_통합숙제', problemCount: 36 }, // 꼬리 2개는 유령 슬롯
  '13행렬': { hintKey: '수학상_13행렬_통합숙제', problemCount: 40 }, // 꼬리 2개는 유령 슬롯
};

const MANIFEST_PATH = path.join(__dirname, 'homework_avs_manifest.json');
const MISMATCH_PATH = path.join(__dirname, 'homework_avs_mismatch.json');
const pad = n => String(n).padStart(3, '0');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── CLI ──
const args = process.argv.slice(2);
const unitArg = args.find(a => !a.startsWith('--'));
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 0;
const pidsIdx = args.indexOf('--pids');
const PIDS = pidsIdx !== -1 ? new Set(args[pidsIdx + 1].split(',')) : null; // 특정 문제만 (예: --pids 003,015)
const USE_QA = args.includes('--qa'); // _qa_*.json의 지적사항을 프롬프트에 주입

if (!unitArg || (!UNITS[unitArg] && unitArg !== 'all')) {
  console.error(`사용법: node ${path.basename(__filename)} <${Object.keys(UNITS).join('|')}|all> [--dry-run] [--limit N] [--force]`);
  process.exit(1);
}
if (API_KEYS.length === 0) { console.error('VITE_GEMINI_API_KEY 미설정'); process.exit(1); }
if (!DRY_RUN && !SERVICE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY 미설정'); process.exit(1); }

// ── 프롬프트 ──
const buildPrompt = (unitTitle, knownAnswer) => `너는 한국 고등학교 수학(상) 전문 강사다. 첫 번째 이미지는 [문제], 두 번째 이미지는 선생님의 손글씨/판서 [해설]이다. 단원: ${unitTitle}. 검증된 정답: "${knownAnswer}".

해설 이미지의 풀이 과정을 충실히 따라가며, 학생이 단계별로 따라올 수 있는 PCBSA 해설을 만들어라.

규칙:
- 모든 수식은 반드시 $$...$$ 로 감싼 KaTeX로 쓴다 (인라인 $...$ 금지).
- 각 풀이 단계(S_steps의 원소)는 "왜 이렇게 하는지" 한 문장 + 그 단계의 수식 전개로 구성한다. 계산 나열만 하지 말 것.
- S_steps는 4~8개. 해설 이미지에 없는 풀이를 지어내지 말고, 이미지의 논리 전개를 따른다.
- 단계 문자열 내부에 줄바꿈(\\n)을 넣지 않는다 ($$...$$ 수식 안은 허용).
- 한국어로 쓴다.
- 학생에게 보여주는 최종 해설만 쓴다. "해설 이미지", "판서", "~로 보입니다", "~을 따르겠습니다" 같은 메타 발언·자기 검토 발언은 절대 금지. 해설과 문제 표기가 어긋나 보여도 검증된 정답("${knownAnswer}")에 도달하는 일관된 풀이로 매끄럽게 정리한다.

JSON만 출력:
{
  "P": "이 문제에서 구해야 하는 것 (1~2문장)",
  "C": "문제가 준 조건·단서 정리 (1~2문장, 필요시 수식)",
  "B": "이 문제를 푸는 데 쓰이는 핵심 개념·공식 (해설에서 실제 사용한 것만, KaTeX 포함)",
  "S_steps": ["단계1 ...", "단계2 ...", "..."],
  "answer": { "choice": "객관식 보기 번호 1~5 (객관식이 아니면 null)", "value": "해설이 도달한 최종 값" }
}`;

// ── Gemini 비전 호출 (키 로테이션 + 쿨다운) ──
let keyIdx = 0;
let consecutiveCooldowns = 0;

async function callVision(prompt, images) {
  for (let attempt = 0; attempt < API_KEYS.length * 2 + 4; attempt++) {
    const key = API_KEYS[keyIdx % API_KEYS.length];
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, ...images.map(b64 => ({ inline_data: { mime_type: 'image/webp', data: b64 } }))] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 2048 }, responseMimeType: 'application/json' },
        }),
      });
      if (res.status === 429 || res.status === 503) {
        keyIdx++;
        if (keyIdx % API_KEYS.length === 0) {
          consecutiveCooldowns++;
          if (consecutiveCooldowns > 6) throw new Error('QUOTA_EXHAUSTED');
          console.log(`  ⏳ 전체 키 제한 — 90초 대기 (${consecutiveCooldowns}/6)`);
          await sleep(90_000);
        }
        continue;
      }
      if (!res.ok) {
        const body = (await res.text()).slice(0, 300);
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
      consecutiveCooldowns = 0;
      const j = await res.json();
      const text = j.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
      return tolerantJsonParse(text);
    } catch (e) {
      if (e.message === 'QUOTA_EXHAUSTED') throw e;
      if (attempt >= API_KEYS.length * 2 + 3) throw e;
      await sleep(3000);
    }
  }
  throw new Error('UNREACHABLE');
}

// LaTeX(\pi, \sqrt 등)가 JSON에서 잘못 이스케이프된 응답을 복원해 파싱
function tolerantJsonParse(text) {
  try { return JSON.parse(text); }
  catch {
    const fixed = text
      .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\')
      .replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u'); // \underline 등 4자리 hex가 아닌 \u
    return JSON.parse(fixed);
  }
}

// ── 검증 ──
function balancedMath(s) {
  return ((s.match(/\$\$/g) || []).length % 2) === 0;
}

function hasControlChars(s) {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s);
}

function normalizeAnswer(v) {
  if (v == null) return '';
  let s = String(v).trim();
  const circled = { '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5' };
  s = s.replace(/[①②③④⑤]/g, m => circled[m]).replace(/번$/, '').trim();
  return s;
}

// 비전 answer가 문자열(구버전) 또는 {choice, value} 객체 — 비교 후보를 모두 수집
function answerCandidates(r) {
  const raw = r.answer;
  const list = (raw && typeof raw === 'object') ? [raw.choice, raw.value] : [raw];
  return list.map(normalizeAnswer).filter(s => s !== '' && s !== 'null');
}

const META_PHRASES = ['해설 이미지', '해설이미지', '판서', '로 보입니다', '따르겠습니다', '잘못 해석', '잘못된 것으'];

function validateResult(r) {
  const issues = [];
  for (const k of ['P', 'C', 'B']) {
    if (!r[k] || typeof r[k] !== 'string' || r[k].trim().length < 5) issues.push(`${k} 비어있음`);
  }
  if (!Array.isArray(r.S_steps) || r.S_steps.length < 3) issues.push('S_steps < 3');
  if (answerCandidates(r).length === 0) issues.push('answer 누락');
  const all = [r.P, r.C, r.B, ...(r.S_steps || [])].filter(Boolean).join('\n');
  if (!balancedMath(all)) issues.push('$$ 짝 안 맞음');
  if (hasControlChars(all)) issues.push('제어문자(이스케이프 손상) 감지');
  if (/\?\?/.test(all)) issues.push('모지바케(??) 감지');
  const meta = META_PHRASES.filter(p => all.includes(p));
  if (meta.length) issues.push(`메타 발언: ${meta.join(',')}`);
  const katexErr = katexErrors(all);
  if (katexErr) issues.push(`KaTeX 오류: ${katexErr}`);
  return issues;
}

// $$...$$ 수식을 KaTeX 파서로 검증 (katex 미설치 시 건너뜀)
let katex = null;
try { katex = require('katex'); } catch {}
function katexErrors(text) {
  if (!katex) return null;
  for (const m of text.matchAll(/\$\$(.+?)\$\$/gs)) {
    try { katex.renderToString(m[1], { throwOnError: true, displayMode: true }); }
    catch (e) { return e.message.slice(0, 120); }
  }
  return null;
}

// ── 텍스트 정리 ──
// 1) \times·\frac 등이 JSON 유효 이스케이프(\t,\f,\b,\r)로 오인 파싱된 제어문자를 LaTeX로 복원
// 2) 백틱 등 렌더러에 노출되는 마크다운 잔재 제거
function sanitizeText(s) {
  return String(s)
    .replace(/\u0009/g, '\\t')
    .replace(/\u000c/g, '\\f')
    .replace(/\u0008/g, '\\b')
    .replace(/\u000d/g, '\\r')
    .replace(/\n(eq|abla|otin)\b/g, (m, g) => '\\n' + g)
    .replace(/`/g, '')
    .trim();
}

// 비전 응답 필드 전체에 sanitize 적용 (검증 전에 복원해야 오탐 거부를 막음)
function sanitizeResult(r) {
  const out = { ...r };
  for (const k of ['P', 'C', 'B']) {
    if (Array.isArray(out[k])) out[k] = out[k].map(String).join('\n'); // 모델이 배열로 줄 때 문자열화
    if (typeof out[k] === 'string') out[k] = sanitizeText(out[k]);
  }
  if (Array.isArray(out.S_steps)) out.S_steps = out.S_steps.map(sanitizeText).filter(Boolean);
  return out;
}

// ── 정답 표기 (①~⑤번 또는 값) ──
function answerDisplay(finalAnswer) {
  const s = String(finalAnswer).trim();
  const circles = ['①', '②', '③', '④', '⑤'];
  if (/^[1-5]$/.test(s)) return `${circles[parseInt(s, 10) - 1]}번`;
  return s;
}

// ── Supabase 업로드 ──
async function uploadHint(safeKey, pid, json) {
  const objPath = `math_hints/${safeKey}/${pid}.json`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
      'cache-control': 'max-age=300',
    },
    body: JSON.stringify(json),
  });
  if (!res.ok) throw new Error(`upload ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

// ── 이미지 다운로드 ──
async function fetchImageB64(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`img ${r.status}: ${url}`);
  return Buffer.from(await r.arrayBuffer()).toString('base64');
}

// ── 매니페스트 ──
function loadJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

// ── 문제 1건 처리 ──
async function processProblem(unitName, unit, pid, manifest, mismatches) {
  const localDir = path.join(__dirname, '..', 'src', 'data', 'homework_avs', unit.hintKey);
  const localPath = path.join(localDir, `${pid}.json`);
  const existing = loadJson(localPath, null);
  if (!existing) { console.log(`  ⚠️ ${pid}: 기존 JSON 없음 — 건너뜀`); return 'skip'; }

  const safeFolder = getSafePath(unitName);
  const imgBase = `${PUBLIC_BASE}/math_crops/homework/math_sang/${safeFolder}`;
  const [probB64, solB64] = await Promise.all([
    fetchImageB64(`${imgBase}/${pid}.webp`),
    fetchImageB64(`${imgBase}/${pid}a.webp`),
  ]);

  // --qa: 적대적 QA(_qa_*.json)가 지적한 내용을 프롬프트에 주입해 재생성 품질 개선
  let qaFeedback = '';
  if (USE_QA) {
    const qa = loadJson(path.join(localDir, `_qa_${unit.hintKey}.json`), []);
    const hit = Array.isArray(qa) ? qa.find(x => x.pid === pid) : null;
    if (hit && Array.isArray(hit.issues) && hit.issues.length) {
      qaFeedback = `\n\n[검수 피드백 — 반드시 반영] 이전 해설이 검수에서 다음 지적을 받았다:\n- ${hit.issues.join('\n- ').slice(0, 1500)}\n지적된 논리 오류·누락을 바로잡되, 해설 이미지의 전체 흐름과 검증된 정답은 유지하라.`;
    }
  }
  const basePrompt = buildPrompt(unitName.replace(/^\d+/, ''), existing.finalAnswer) + qaFeedback;
  let r = sanitizeResult(await callVision(basePrompt, [probB64, solB64]));
  let issues = validateResult(r);
  if (issues.length) {
    console.log(`  ↻ ${pid}: 1차 검증 실패(${issues.join(', ')}) — 재시도`);
    const retryPrompt = `${basePrompt}\n\n[경고] 이전 시도가 다음 사유로 거부되었다: ${issues.join(', ')}. 메타 발언·자기 검토 문장 없이, 학생용 완결 해설만 다시 작성하라.`;
    r = sanitizeResult(await callVision(retryPrompt, [probB64, solB64]));
    issues = validateResult(r);
  }
  if (issues.length) { console.log(`  🚩 ${pid}: ${issues.join(', ')}`); return 'invalid'; }

  const candidates = answerCandidates(r);
  if (!candidates.includes(normalizeAnswer(existing.finalAnswer))) {
    mismatches.push({ unit: unit.hintKey, pid, stored: existing.finalAnswer, vision: candidates });
    console.log(`  ⚠️ ${pid}: 정답 불일치 (저장=${existing.finalAnswer}, 비전=${candidates.join('/')}) — 보류`);
    return 'mismatch';
  }

  const out = {
    title: existing.title,
    type: 'algebra',
    P: sanitizeText(r.P),
    C: sanitizeText(r.C),
    B: sanitizeText(r.B),
    S: r.S_steps.map(sanitizeText).filter(Boolean).join('\n'),
    S_objects: existing.S_objects || [{ type: 'image', src: `/math_crops/숙제/수학상/${unitName}/${pid}a.webp` }],
    A: `따라서 최종 정답은 $$\\mathbf{\\boxed{${answerDisplay(existing.finalAnswer)}}}$$ 입니다.`,
    finalAnswer: existing.finalAnswer,
    correctAnswer: existing.correctAnswer ?? existing.finalAnswer,
    pcbsa_completed: true,
    vision_generated: true,
    vision_model: MODEL,
  };

  if (DRY_RUN) {
    console.log(`  💡 ${pid} (dry-run): S ${r.S_steps.length}단계 | P: ${out.P.slice(0, 40)}...`);
    return 'dry';
  }

  fs.writeFileSync(localPath, JSON.stringify(out, null, 2));
  await uploadHint(getSafePath(unit.hintKey), pid, out);
  manifest[`${unit.hintKey}/${pid}`] = { at: new Date().toISOString(), model: MODEL };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`  ✅ ${pid}: S ${r.S_steps.length}단계 생성·업로드`);
  return 'ok';
}

// ── 메인 ──
(async () => {
  const targets = unitArg === 'all' ? Object.keys(UNITS) : [unitArg];
  const manifest = loadJson(MANIFEST_PATH, {});
  const mismatches = loadJson(MISMATCH_PATH, []);
  const stats = { ok: 0, mismatch: 0, invalid: 0, skip: 0, dry: 0 };
  let processed = 0;

  outer:
  for (const unitName of targets) {
    const unit = UNITS[unitName];
    console.log(`\n=== ${unitName} (${unit.problemCount}문제) ===`);
    for (let n = 1; n <= unit.problemCount; n++) {
      const pid = pad(n);
      if (PIDS && !PIDS.has(pid)) continue;
      if (!FORCE && manifest[`${unit.hintKey}/${pid}`]) continue;
      if (LIMIT && processed >= LIMIT) break outer;
      processed++;
      try {
        const result = await processProblem(unitName, unit, pid, manifest, mismatches);
        stats[result] = (stats[result] || 0) + 1;
      } catch (e) {
        if (e.message === 'QUOTA_EXHAUSTED') {
          console.log('\n🛑 쿼터 소진 — 중단 (매니페스트로 재개 가능)');
          break outer;
        }
        console.log(`  ❌ ${pid}: ${e.message.slice(0, 300)}`);
        stats.error = (stats.error || 0) + 1;
      }
      await sleep(4000);
    }
  }

  if (mismatches.length) fs.writeFileSync(MISMATCH_PATH, JSON.stringify(mismatches, null, 2));
  console.log(`\n결과: 성공 ${stats.ok} | 불일치 보류 ${stats.mismatch} | 검증 실패 ${stats.invalid} | 오류 ${stats.error || 0} | dry ${stats.dry}`);
})();
