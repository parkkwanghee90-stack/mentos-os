/**
 * Gemini 호출 헬퍼 (비전 + 텍스트). 기존 scripts/convert_quad_eq_func_crops_to_latex.cjs,
 * generate_gemini_math_sang_tts.cjs 의 호출 패턴을 재사용.
 *
 * 키: .env 의 VITE_GEMINI_API_KEY (콤마로 여러 개 두면 라운드로빈/백오프).
 * 사용 전: set -a; source .env; set +a
 */
const fs = require('fs');

const KEYS = (process.env.VITE_GEMINI_API_KEY || '').split(',').map(s => s.trim()).filter(Boolean);
let keyIdx = 0;
function nextKey() { const k = KEYS[keyIdx % KEYS.length]; keyIdx++; return k; }

const MODEL = process.env.EXAM_GEMINI_MODEL || 'gemini-2.5-flash';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function imgPart(filePath) {
  const ext = (filePath.split('.').pop() || 'png').toLowerCase();
  const mime = ext === 'pdf' ? 'application/pdf'
    : ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { inlineData: { mimeType: mime, data: Buffer.from(fs.readFileSync(filePath)).toString('base64') } };
}

/**
 * 멀티모달 호출. parts = [{text}, {inlineData}...].
 * 재시도(최대 5회): 429/5xx 는 백오프, 키 순환.
 */
async function callGemini(parts, { json = false, maxRetries = 5 } = {}) {
  if (!KEYS.length) throw new Error('VITE_GEMINI_API_KEY 없음 (.env 로드했는지 확인)');
  let lastErr;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const key = nextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
    try {
      const body = { contents: [{ parts }] };
      if (json) body.generationConfig = { responseMimeType: 'application/json' };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const t = await res.text();
        // 크레딧 소진/결제 문제(429)는 재시도해도 무의미 → 즉시 중단(재시도 X).
        if (/credits?\s+are\s+depleted|prepayment|billing|quota.*exceeded.*billing/i.test(t)) {
          throw new Error(`BILLING: Gemini 크레딧 소진/결제 필요 — AI Studio 에서 충전 후 재실행. (${res.status})`);
        }
        if (res.status === 429 || res.status >= 500) { lastErr = new Error(`HTTP ${res.status}: ${t.slice(0, 200)}`); await sleep(2000 * (attempt + 1)); continue; }
        throw new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`);
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('') || '';
      if (!text) throw new Error('빈 응답');
      return text.trim();
    } catch (e) { lastErr = e; await sleep(1500 * (attempt + 1)); }
  }
  throw lastErr || new Error('Gemini 호출 실패');
}

async function vision(imgPaths, prompt, opts = {}) {
  const parts = [{ text: prompt }, ...imgPaths.map(imgPart)];
  return callGemini(parts, opts);
}

async function text(prompt, opts = {}) {
  return callGemini([{ text: prompt }], opts);
}

// LaTeX 가 든 JSON 새니타이즈: 문자열 값 내부에서만 (1) 유효 이스케이프(\\ \" \/ \uXXXX)는 보존,
// 단독 백슬래시(\frac,\le…)는 \\ 로 이중화, (2) 실제 줄바꿈/탭 제어문자는 \n \t \r 로 이스케이프.
// 문자열 밖(구조)의 공백/개행은 그대로 둔다.
function fixLatexBackslashes(s) {
  let out = '', inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr && c === '\\') {
      const n = s[i + 1];
      if (n === '\\' || n === '"' || n === '/') { out += c + n; i++; continue; }
      if (n === 'u' && /^[0-9a-fA-F]{4}$/.test(s.slice(i + 2, i + 6))) { out += s.slice(i, i + 6); i += 5; continue; }
      out += '\\\\'; continue; // 단독 백슬래시 → 이중화
    }
    if (c === '"') { out += c; inStr = !inStr; continue; }
    if (inStr) {
      if (c === '\n') { out += '\\n'; continue; }
      if (c === '\r') { out += '\\r'; continue; }
      if (c === '\t') { out += '\\t'; continue; }
    }
    out += c;
  }
  return out;
}

// 응답에서 JSON 추출(코드펜스/잡텍스트/LaTeX 백슬래시 방어)
function parseJson(s) {
  let t = s.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  // 구조 경계로 잘라내기
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  const a2 = t.indexOf('['); const b2 = t.lastIndexOf(']');
  const start = (a2 !== -1 && (a === -1 || a2 < a)) ? a2 : a;
  const end = (b2 !== -1 && b2 > b) ? b2 : b;
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);
  try { return JSON.parse(t); } catch { /* LaTeX 보정 후 재시도 */ }
  try { return JSON.parse(fixLatexBackslashes(t)); } catch (e) {
    throw new Error('JSON 파싱 실패: ' + String(e.message) + ' :: ' + t.slice(0, 120));
  }
}

// JSON 응답 + 파싱을 재시도까지 묶는다(LLM 이 가끔 깨진 JSON 을 뱉으므로 재요청이 가장 확실).
async function textJson(prompt, { retries = 3 } = {}) {
  let last;
  for (let i = 0; i < retries; i++) {
    try { return parseJson(await text(prompt, { json: true })); }
    catch (e) { last = e; await sleep(1200 * (i + 1)); }
  }
  throw last;
}
async function visionJson(paths, prompt, { retries = 3 } = {}) {
  let last;
  for (let i = 0; i < retries; i++) {
    try { return parseJson(await vision(paths, prompt, { json: true })); }
    catch (e) { last = e; await sleep(1500 * (i + 1)); }
  }
  throw last;
}

module.exports = { vision, text, parseJson, textJson, visionJson, MODEL, KEYS_COUNT: KEYS.length };
