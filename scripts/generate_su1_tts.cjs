// scripts/generate_su1_tts.cjs
// 수1(수학I: 지수/로그/지수·로그함수/삼각함수/수열) AVS 해설 TTS 대량 생성기.
//
// 수학상 생성기(generate_gemini_math_sang_tts.cjs)와의 차이:
//  - 힌트 소스 = 프로덕션 Supabase mentos-assets/math_hints/{safePath} (로컬 캐시: scripts/.su1_hint_cache)
//    (수1 힌트는 로컬 public/math_hints 에 없음 — 프로덕션이 SSOT)
//  - ID 범위 = 001~020 제한 없이 힌트 폴더의 전체 NNN.json
//  - 나레이션 빌더 = 수1 힌트 4종 스키마 지원
//      A) steps[] + phase 'P'/'C'/'B'/'S'(/'A')  (지수/로그/삼각성질 계열)
//      B) steps[] + label 'P(구하는 것)'/'P:' + formula_raw  (기하/그래프 계열)
//      C) overlay V3: steps[] + caption + formula_lines[{formula_text}]  (삼각함수그래프2단계 등)
//      D) top-level P/C/B/S(/A)  (구 PCBS — 로그함수2단계 등)
//    A/B/D 는 PCBS만 낭독(A=정답 제외, 수학상과 동일 규약).
//  - latexToSpeech 에 수1 빈출 기호(사인/코사인/탄젠트/파이/세타/시그마/로그) 발음 추가
//
// 사용법:
//   node scripts/generate_su1_tts.cjs <stageKey|all> [--force] [--dry-run] [--limit N]
//   stageKey 목록은 인자 없이 실행하면 출력.
// 기본 동작은 갭 채움(원격 math-tts 에 NNN.mp3 있으면 스킵). --force 는 전체 재생성.

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

dotenv.config();

const GEMINI_API_KEYS = [
  process.env.VITE_GEMINI_API_KEY,
  process.env.VITE_GEMINI_API_KEY_2,
].filter(Boolean);

let currentKeyIndex = 0;
function getCurrentKey() { return GEMINI_API_KEYS[currentKeyIndex]; }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TTS_BUCKET = 'math-tts';
const HINT_BUCKET = 'mentos-assets';
const LOCAL_OUTPUT_DIR = path.join('public', 'audio', 'math_hints');
const HINT_CACHE_DIR = path.join('scripts', '.su1_hint_cache');
const MANIFEST_PATH = path.join('scripts', 'tts_manifest.json');
const TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const TTS_VOICE = 'Aoede';

// 수1 스테이지: hintDir = mentos-assets/math_hints/ 하위 폴더(getSafePath(단원) 결과),
// ttsDir = math-tts 버킷 폴더(src/data/tts_map.json 과 일치해야 함).
// 제외: 지수로그함수4단계(프로덕션 힌트 0개), 삼각함수그래프4단계(앱이 stepless '삼각함수그래프'로 정규화).
// 주의: 여러가지수열3단계는 tts_map 의 'exp_s3'(지수3단계와 충돌) 버그를 'seq_misc_s3'로 교정한 매핑.
const STAGES = {
  exp2:     { ko: '지수2단계',              hintDir: 'exp_step2',          ttsDir: 'exp_s2' },
  exp3:     { ko: '지수3단계',              hintDir: 'exp_step3',          ttsDir: 'exp_s3' },
  exp4:     { ko: '지수4단계',              hintDir: 'exp_step4',          ttsDir: 'exp_s4' },
  explog4:  { ko: '지수로그4단계',          hintDir: 'explog_step4',       ttsDir: 'exp_log_s4' },
  expf2:    { ko: '지수함수2단계',          hintDir: 'exp_func_step2',     ttsDir: 'exp_func_s2' },
  expf3:    { ko: '지수함수3단계',          hintDir: 'exp_func_step3',     ttsDir: 'exp_func_s3' },
  expf4:    { ko: '지수함수4단계',          hintDir: 'exp_func_step4',     ttsDir: 'exp_func_s4' },
  log2:     { ko: '로그2단계',              hintDir: 'log_step2',          ttsDir: 'log_s2' },
  log3:     { ko: '로그3단계',              hintDir: 'log_step3',          ttsDir: 'log_s3' },
  log4:     { ko: '로그4단계',              hintDir: 'log_step4',          ttsDir: 'log_s4' },
  logf2:    { ko: '로그함수2단계',          hintDir: 'log_func_step2',     ttsDir: 'log_func_s2' },
  logf3:    { ko: '로그함수3단계',          hintDir: 'log_func_step3',     ttsDir: 'log_func_s3' },
  logf4:    { ko: '로그함수4단계',          hintDir: 'log_func_step4',     ttsDir: 'log_func_s4' },
  trig3:    { ko: '삼각함수3단계',          hintDir: 'trig_step3',         ttsDir: 'trig_s3' },
  tgraph:   { ko: '삼각함수그래프',         hintDir: 'trig_graph',         ttsDir: 'trig_graph' },
  tgraph2:  { ko: '삼각함수그래프2단계',    hintDir: 'trig_graph_step2',   ttsDir: 'trig_graph_s2' },
  tgraph3:  { ko: '삼각함수그래프3단계',    hintDir: 'trig_graph_step3',   ttsDir: 'trig_graph_s3' },
  tprop2:   { ko: '삼각함수성질2단계',      hintDir: 'trig_prop_step2',    ttsDir: 'trig_prop_s2' },
  tprop3:   { ko: '삼각함수성질3단계',      hintDir: 'trig_func_step3',    ttsDir: 'trig_prop_s3' },
  tutil2:   { ko: '삼각함수활용2단계',      hintDir: 'trig_util_step2',    ttsDir: 'trig_util_s2' },
  tutil3:   { ko: '삼각함수활용3단계',      hintDir: 'trig_util_step3',    ttsDir: 'trig_util_s3' },
  tutil4:   { ko: '삼각함수활용 4단계(68)', hintDir: 'trig_util_step4',    ttsDir: 'trig_util_s46u8' },
  apgp2:    { ko: '등차등비2단계',          hintDir: 'seq_apgp_step2',     ttsDir: 'seq_apgp_s2' },
  apgp3:    { ko: '등차등비3단계',          hintDir: 'seq_apgp_step3',     ttsDir: 'seq_apgp_s3' },
  apgp4:    { ko: '등차등비수열4단계',      hintDir: 'seq_apgp_step4',     ttsDir: 'seq_apgp_s4' },
  sigma2:   { ko: '시그마용법2단계',        hintDir: 'sigma_step2',        ttsDir: 'sigma_s2' },
  seqmisc3: { ko: '여러가지수열3단계',      hintDir: 'seq_misc_step3',     ttsDir: 'seq_misc_s3' },
  seqsum4:  { ko: '수열의합4단계',          hintDir: 'seq_sum_step4',      ttsDir: 'seq_sum_s4' },
  inddef2:  { ko: '귀납적정의2단계',        hintDir: 'induction_def_step2', ttsDir: 'induction_def_s2' },
  ind3:     { ko: '수학적귀납법3단계',      hintDir: 'induction_step3',    ttsDir: 'induction_s3' },
  ind4:     { ko: '수학적귀납법4단계',      hintDir: 'induction_step4',    ttsDir: 'induction_s4' },
};

if (GEMINI_API_KEYS.length === 0) {
  console.error('❌ Error: No Gemini API keys are defined');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials are not defined in .env');
  process.exit(1);
}
if (!fs.existsSync(LOCAL_OUTPUT_DIR)) fs.mkdirSync(LOCAL_OUTPUT_DIR, { recursive: true });

function recordManifest(remotePath, bytes) {
  let current = {};
  try {
    if (fs.existsSync(MANIFEST_PATH)) current = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')) || {};
  } catch (e) {
    current = {};
  }
  const next = {
    ...current,
    [remotePath]: {
      engine: 'gemini',
      model: TTS_MODEL,
      voice: TTS_VOICE,
      bytes,
      generatedAt: new Date().toISOString(),
    },
  };
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(next, null, 2));
  } catch (e) {
    console.warn(`⚠️ Could not write manifest: ${e.message}`);
  }
}

// ---------- LaTeX → 한국어 발음 (수1 빈출 기호 포함) ----------
function latexToSpeech(text) {
  if (!text) return '';
  return text
    // JSON 이스케이프로 먹힌 LaTeX 명령 복원: 원본 힌트가 \times 를 "\times"로 저장하면
    // JSON.parse 가 \t(탭)+"imes" 로 해석함. \n+eq, \f+rac, \r+ightarrow, \b+eta 동일.
    .replace(/\t(?=imes|an(?![a-z])|heta|ext|riangle|o(?![a-z])|frac)/g, '\\t')
    .replace(/\n(?=eq\b|e\b)/g, '\\n')
    .replace(/\f(?=rac)/g, '\\f')
    .replace(/\r(?=ightarrow)/g, '\\r')
    .replace(/[\u0008](?=eta\b|oxed)/g, '\\b')
    .replace(/\\begin\{[^}]*\}/g, ' ')
    .replace(/\\end\{[^}]*\}/g, ' ')
    .replace(/\\\\/g, ', ')
    .replace(/\\ /g, ' ')
    .replace(/&/g, ', ')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\boxed\{([^}]*)\}/g, '$1')
    .replace(/\\math(?:bf|rm|it)\{([^}]*)\}/g, '$1')
    .replace(/\\(?:d|t)?frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\[([^\]]*)\]\{([^}]*)\}/g, '$1제곱근 $2')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1')
    .replace(/\\overline\{([^}]*)\}/g, '$1')
    .replace(/\\pm/g, '플러스 마이너스')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq?(?![a-zA-Z])/g, ' 이하')
    .replace(/\\geq?(?![a-zA-Z])/g, ' 이상')
    .replace(/\\neq?(?![a-zA-Z])/g, ' 같지 않음')
    .replace(/\\cdots?/g, ' 쩜쩜쩜 ')
    .replace(/\\cdot/g, ' 곱하기 ')
    .replace(/\\sin/g, '사인')
    .replace(/\\cos/g, '코사인')
    .replace(/\\tan/g, '탄젠트')
    .replace(/\\log/g, '로그')
    .replace(/\\ln/g, '자연로그')
    .replace(/\\sum/g, '시그마')
    .replace(/\\pi/g, '파이')
    .replace(/\\theta/g, '세타')
    .replace(/\\alpha/g, '알파')
    .replace(/\\beta/g, '베타')
    .replace(/\\infty/g, '무한대')
    .replace(/\\(?:to|rightarrow|Rightarrow)(?![a-zA-Z])/g, ', ')
    .replace(/\\triangle/g, '삼각형 ')
    .replace(/\\angle/g, '각 ')
    .replace(/\\circ(?![a-zA-Z])/g, '도')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$]/g, '')
    .replace(/\^\{?(\d+)\}?/g, '의 $1승')
    .replace(/\^/g, '')
    .replace(/_/g, ' ')
    .replace(/\*\*|##+|`/g, '')
    // 원본 데이터에서 백슬래시가 아예 소실된 LaTeX 잔재 토큰 정리 (예: "360^circ le alpha")
    .replace(/(?<=\d\s?)circ\b/g, '도')
    .replace(/\bimes\b/g, ' 곱하기 ')
    .replace(/\ble\b/g, ' 이하 ')
    .replace(/\bge\b/g, ' 이상 ')
    .replace(/\balpha\b/g, '알파')
    .replace(/\btheta\b/g, '세타')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------- 나레이션 빌더 (4종 스키마) ----------
const PCBS_SCRIPT = (p, c, b, s) => {
  let script = '';
  if (p) script += `이 문제에서 구하는 것은, ${p}.\n`;
  if (c) script += `주어진 조건을 분석하면, ${c}.\n`;
  if (b) script += `여기서 꼭 알아야 하는 핵심 개념은, ${b}.\n`;
  if (s) script += `풀이 과정을 핵심 구조와 연관지어 분석해보면, ${s}.\n`;
  script += '나머지 세부 식 전개는 화면의 칠판 내용을 보면서 차근차근 직접 마무리해보세요.';
  return script.trim();
};

function buildNarration(data) {
  const steps = Array.isArray(data.overlay_steps) ? data.overlay_steps
    : Array.isArray(data.steps) ? data.steps : null;

  // A) steps[] + phase P/C/B/S
  if (steps && steps.some(st => st && typeof st.phase === 'string' && /^[PCBSA]$/.test(st.phase))) {
    const byPhase = {};
    for (const st of steps) {
      if (st && /^[PCBS]$/.test(st.phase || '') && !byPhase[st.phase]) {
        byPhase[st.phase] = latexToSpeech(st.content || st.text || '');
      }
    }
    if (byPhase.P || byPhase.C || byPhase.B || byPhase.S) {
      return PCBS_SCRIPT(byPhase.P, byPhase.C, byPhase.B, byPhase.S);
    }
  }

  // B) steps[] + label 'P(...)' 또는 'P:' (기하/그래프 구 스키마)
  if (steps && steps.some(st => st && /^[PCBSA]\s*[(:]/.test((st.label || '').trim().toUpperCase()))) {
    const byLabel = {};
    for (const st of steps) {
      const m = (st.label || '').trim().toUpperCase().match(/^([PCBS])\s*[(:]/);
      if (m && !byLabel[m[1]]) {
        byLabel[m[1]] = latexToSpeech(st.formula_raw || st.latex || st.text || st.content || '');
      }
    }
    if (byLabel.P || byLabel.C || byLabel.B || byLabel.S) {
      return PCBS_SCRIPT(byLabel.P, byLabel.C, byLabel.B, byLabel.S);
    }
  }

  // C) overlay V3: caption + formula_lines[{formula_text}] (raw LaTeX 는 낭독 제외)
  if (steps && steps.some(st => st && (st.caption || Array.isArray(st.formula_lines)))) {
    const parts = [];
    for (const st of steps) {
      if (!st || typeof st !== 'object') continue;
      const line = [];
      if (typeof st.caption === 'string' && st.caption.trim()) line.push(latexToSpeech(st.caption));
      if (Array.isArray(st.formula_lines)) {
        for (const fl of st.formula_lines) {
          if (fl && typeof fl.formula_text === 'string' && fl.formula_text.trim()) {
            line.push(latexToSpeech(fl.formula_text));
          }
        }
      }
      if (line.length) parts.push(line.join(', '));
    }
    if (parts.length) {
      return `${parts.join('.\n')}.\n나머지 세부 식 전개는 화면의 칠판 내용을 보면서 차근차근 직접 마무리해보세요.`;
    }
  }

  // D) top-level P/C/B/S (구 PCBS)
  const p = data.P ? latexToSpeech(data.P) : '';
  const c = data.C ? latexToSpeech(data.C) : '';
  const b = data.B ? latexToSpeech(data.B) : '';
  const s = data.S ? latexToSpeech(data.S) : '';
  if (p || c || b || s) return PCBS_SCRIPT(p, c, b, s);

  // G) 제너릭 폴백: 레거시 변형(steps[{label,latex}] / {goal,conditions,concept,latex} /
  //    {description}+{latex} / 별도 hints[] 배열)을 스텝 순회로 흡수.
  const genericSteps = steps || (Array.isArray(data.hints) ? data.hints : null);
  if (genericSteps) {
    const parts = [];
    for (const st of genericSteps) {
      if (!st || typeof st !== 'object') continue;
      const line = [];
      for (const field of ['text', 'description', 'goal', 'conditions', 'concept', 'content', 'formula_raw', 'latex']) {
        if (typeof st[field] === 'string' && st[field].trim()) line.push(latexToSpeech(st[field]));
      }
      if (line.length) parts.push(line.join(', '));
    }
    const body = parts.join('.\n').trim();
    if (body) {
      return `${body}.\n나머지 세부 식 전개는 화면의 칠판 내용을 보면서 차근차근 직접 마무리해보세요.`;
    }
  }

  return '';
}

// ---------- Supabase storage helpers ----------
async function listAll(bucket, prefix) {
  const out = [];
  let offset = 0;
  for (;;) {
    // 일시적 DNS/네트워크 장애(fetch failed/ENOTFOUND)에 3회 재시도
    let res;
    for (let attempt = 1; ; attempt++) {
      try {
        res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
        });
        break;
      } catch (err) {
        if (attempt >= 3) throw err;
        console.warn(`⚠️ storage list 네트워크 오류 (${attempt}/3) — 10s 후 재시도: ${err.message}`);
        await new Promise(r => setTimeout(r, 10000));
      }
    }
    if (!res.ok) throw new Error(`storage list failed (${bucket}/${prefix}): ${res.status}`);
    const files = await res.json().catch(() => []);
    out.push(...files);
    if (files.length < 1000) break;
    offset += 1000;
  }
  return out;
}

async function listHintIds(hintDir) {
  const files = await listAll(HINT_BUCKET, `math_hints/${hintDir}/`);
  return files
    .map(f => (f.name || '').match(/^(\d{3})\.json$/))
    .filter(Boolean)
    .map(m => m[1])
    .sort();
}

async function listAudioIds(ttsDir) {
  const files = await listAll(TTS_BUCKET, `${ttsDir}/`);
  return new Set(
    files
      .map(f => (f.name || '').match(/^(\d{3})\.mp3$/))
      .filter(Boolean)
      .map(m => m[1])
  );
}

// 프로덕션 힌트 JSON 로드 (로컬 캐시 우선)
async function fetchHint(hintDir, pid) {
  const cacheDir = path.join(HINT_CACHE_DIR, hintDir);
  const cachePath = path.join(cacheDir, `${pid}.json`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 50) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  const url = `${SUPABASE_URL}/storage/v1/object/public/${HINT_BUCKET}/math_hints/${hintDir}/${pid}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`hint fetch failed: ${hintDir}/${pid} (${res.status})`);
  const text = await res.text();
  const data = JSON.parse(text);
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, text);
  return data;
}

async function uploadToSupabase(buffer, remotePath, retries = 3) {
  const url = `${SUPABASE_URL}/storage/v1/object/${TTS_BUCKET}/${remotePath}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'audio/mpeg',
          'x-upsert': 'true',
        },
        body: buffer,
      });
      if (!res.ok) throw new Error(`Supabase upload failed: ${res.status} - ${await res.text()}`);
      return;
    } catch (err) {
      console.warn(`⚠️ Supabase upload attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ---------- Gemini TTS (키 로테이션 + 180s abort + quota 시 즉시 실패) ----------
async function generateGeminiTTS(text, retries = 3) {
  currentKeyIndex = 0;
  const promptText = `너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. 절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘:

${text}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const currentKey = getCurrentKey();
      if (!currentKey) throw new Error('No Gemini API keys available');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      let response;
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${currentKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } },
            },
          }),
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errMsg = errorJson?.error?.message || `Gemini API HTTP ${response.status}`;
        if (response.status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(errMsg)) {
          console.warn(`\n⚠️ API Key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length} exhausted! Error: ${errMsg}`);
          if (currentKeyIndex < GEMINI_API_KEYS.length - 1) {
            currentKeyIndex++;
            console.log(`🔄 Rotating to API Key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}`);
            attempt = 0;
            continue;
          }
          console.error('❌ All Gemini API keys in the pool are exhausted!');
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const audioPart = data.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      if (!audioPart?.inlineData?.data) throw new Error('No audio data returned in Gemini response JSON');
      return Buffer.from(audioPart.inlineData.data, 'base64');
    } catch (err) {
      console.warn(`⚠️ Gemini API attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries || err.name === 'AbortError' || /quota|RESOURCE_EXHAUSTED|limit|exceeded|depleted|credit/i.test(err.message)) {
        throw err;
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// ---------- 스테이지 처리 ----------
async function processStage(key, opts) {
  const { force = false, dryRun = false, limit = Infinity } = opts;
  const { ko, hintDir, ttsDir } = STAGES[key];
  console.log(`\n======================================================`);
  console.log(`🔷 [${key}] ${ko}: math_hints/${hintDir} → ${TTS_BUCKET}/${ttsDir}`);
  console.log(`======================================================`);

  const hintIds = await listHintIds(hintDir);
  const audioIds = await listAudioIds(ttsDir);
  const targets = hintIds.filter(pid => force || !audioIds.has(pid)).slice(0, limit);
  console.log(`📁 힌트 ${hintIds.length}개 | ☁️ 기존 오디오 ${audioIds.size}개 | 🎯 생성 대상 ${targets.length}개`);

  let successCount = 0;
  let failCount = 0;
  // key2(선불키)는 수분 내 회복되는 버스트 제한(429 후 200) 패턴을 보임 →
  // quota 오류 시 즉시 중단하지 않고 90초 쿨다운 후 재시도(연속 최대 6회, 성공 시 리셋).
  // 일일 quota가 진짜 소진된 날도 최대 9분 내 clean abort 되므로 hang 없음.
  const MAX_QUOTA_COOLDOWNS = 6;
  const QUOTA_COOLDOWN_MS = 90000;
  let quotaCooldowns = 0;

  for (const pid of targets) {
    const remotePath = `${ttsDir}/${pid}.mp3`;
    if (dryRun) {
      console.log(`📝 [dry-run] would generate ${remotePath}`);
      successCount++;
      continue;
    }

    let data;
    try {
      data = await fetchHint(hintDir, pid);
    } catch (err) {
      console.warn(`⚠️ Hint load failed for ${hintDir}/${pid}: ${err.message} (skipping)`);
      failCount++;
      continue;
    }

    const narrationText = buildNarration(data);
    if (!narrationText) {
      console.warn(`⚠️ No narration text generated for ${hintDir}/${pid} (schema 미지원/빈 힌트)`);
      failCount++;
      continue;
    }
    // 인코딩 손상(mojibake '??' 다발) 소스는 깨진 음성을 만들므로 생성하지 않고 보고만.
    const mojibakeHits = (narrationText.match(/\?\?/g) || []).length;
    if (mojibakeHits >= 2) {
      console.warn(`🧨 Source-damaged (mojibake x${mojibakeHits}) — skipping ${hintDir}/${pid}; 원본 힌트 복구 필요`);
      failCount++;
      continue;
    }

    console.log(`\n--- ${ko}/${pid} ---`);
    console.log(`Script: "${narrationText.substring(0, 100)}..."`);

    let success = false;
    let attempt = 0;
    const MAX_ATTEMPTS = 2;
    while (!success && attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        const rawAudioBuffer = await generateGeminiTTS(narrationText);
        console.log(`✅ Generated raw Gemini PCM (${(rawAudioBuffer.length / 1024).toFixed(1)} KB)`);

        const tempPcmPath = path.resolve(LOCAL_OUTPUT_DIR, `temp_su1_${ttsDir}_${pid}.pcm`);
        const tempMp3Path = path.resolve(LOCAL_OUTPUT_DIR, `temp_su1_${ttsDir}_${pid}.mp3`);
        fs.writeFileSync(tempPcmPath, rawAudioBuffer);
        try {
          execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tempPcmPath}" -codec:a libmp3lame -qscale:a 2 "${tempMp3Path}"`, { stdio: 'pipe' });
        } catch (err) {
          const stderr = err.stderr ? err.stderr.toString() : '';
          throw new Error(`ffmpeg conversion failed: ${err.message}\nStderr: ${stderr}`);
        }
        const mp3Buffer = fs.readFileSync(tempMp3Path);
        try { fs.unlinkSync(tempPcmPath); fs.unlinkSync(tempMp3Path); } catch (e) {}

        if (mp3Buffer.length < 10240) {
          throw new Error(`Generated MP3 file is suspiciously small: ${mp3Buffer.length} bytes`);
        }
        console.log(`✅ Converted to MP3 via ffmpeg (${(mp3Buffer.length / 1024).toFixed(1)} KB)`);

        const localFilePath = path.join(LOCAL_OUTPUT_DIR, `su1_${ttsDir}_${pid}.mp3`);
        fs.writeFileSync(localFilePath, mp3Buffer);

        await uploadToSupabase(mp3Buffer, remotePath);
        console.log(`☁️ Uploaded: ${TTS_BUCKET}/${remotePath}`);
        recordManifest(remotePath, mp3Buffer.length);

        successCount++;
        success = true;
        quotaCooldowns = 0; // 성공하면 쿨다운 카운터 리셋 (버스트 회복 확인됨)
        await new Promise(r => setTimeout(r, 6500)); // ≤10 RPM 페이싱
      } catch (err) {
        const msg = (err && err.message) || String(err);
        const fatal = err.name === 'AbortError' || /quota|RESOURCE_EXHAUSTED|exhausted|depleted|credit|abort|\b429\b|limit|exceeded/i.test(msg);
        console.error(`❌ Failed ${ttsDir}/${pid} (attempt ${attempt}/${MAX_ATTEMPTS}): ${msg.slice(0, 400)}`);
        if (fatal) {
          if (quotaCooldowns < MAX_QUOTA_COOLDOWNS) {
            quotaCooldowns++;
            console.warn(`⏳ Quota/burst cooldown ${quotaCooldowns}/${MAX_QUOTA_COOLDOWNS} — ${QUOTA_COOLDOWN_MS / 1000}s 대기 후 같은 클립 재시도`);
            attempt--; // 쿨다운 재시도는 시도 횟수를 소모하지 않음
            await new Promise(r => setTimeout(r, QUOTA_COOLDOWN_MS));
            continue;
          }
          console.error('🛑 Quota/credits exhausted (cooldown 한도 초과) — stopping run.');
          failCount++;
          return { successCount, failCount, aborted: true };
        }
        if (attempt < MAX_ATTEMPTS) {
          console.log(`⏳ Transient error — retrying ${pid} in 10s...`);
          await new Promise(r => setTimeout(r, 10000));
        } else {
          console.warn(`⚠️ Giving up on ${pid} after ${MAX_ATTEMPTS} attempts.`);
          failCount++;
        }
      }
    }
  }

  console.log(`\n🎉 Completed ${ko}: Success ${successCount}, Failures ${failCount}`);
  return { successCount, failCount, aborted: false };
}

async function main() {
  const args = process.argv.slice(2);
  const stageArg = args[0];
  const force = args.includes('--force');
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) || Infinity : Infinity;

  const keys = stageArg === 'all' ? Object.keys(STAGES) : [stageArg];
  if (!stageArg || (stageArg !== 'all' && !STAGES[stageArg])) {
    console.error('Usage: node scripts/generate_su1_tts.cjs <stageKey|all> [--force] [--dry-run] [--limit N]');
    console.error(`Valid keys: all, ${Object.keys(STAGES).join(', ')}`);
    process.exit(1);
  }

  let totalSuccess = 0;
  let totalFail = 0;
  for (const key of keys) {
    let result;
    try {
      result = await processStage(key, { force, dryRun, limit });
    } catch (err) {
      // 스테이지 단위 예외(예: DNS 장애로 listing 실패)는 크래시 대신 clean abort —
      // 갭 채움은 멱등이라 다음 launchd 슬롯에서 그대로 이어진다.
      console.error(`\n🛑 Stage "${key}" 처리 오류(네트워크 추정) — run 중단: ${err.message}`);
      break;
    }
    totalSuccess += result.successCount;
    totalFail += result.failCount;
    if (result.aborted) {
      console.error(`\n🛑 Run aborted at stage "${key}" — 남은 스테이지는 다음 quota 리셋 후 재실행하면 이어서 채워집니다.`);
      break;
    }
  }
  console.log(`\n========== 수1 TTS 합계: 성공 ${totalSuccess}, 실패 ${totalFail} ==========`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

module.exports = { STAGES, buildNarration, latexToSpeech };
