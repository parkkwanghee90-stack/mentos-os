# ElevenLabs AVS TTS 구현 계획 (미적분/확통/수2 텍스트 보유분 음성화)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이미 AVS 텍스트가 있는 미적분/확통/수2 단원(~1,806개)을 ElevenLabs로 음성화해 기존 `math-tts` 경로에 올린다. 월 글자수 한도(13.1만) 내에서 배치·재개.

**Architecture:** 순수 모듈 3개(ElevenLabs 합성 SSOT / 미적분 수식 낭독 전처리 / 글자수 한도 로직) + 오케스트레이터 1개 + 폴더↔ttsDir 매핑 데이터. 나레이션 추출은 기존 `generate_su1_tts.cjs`의 `buildNarration`을 재사용한다. 기존 Gemini 트랙과 완전 독립.

**Tech Stack:** Node CJS(`scripts/`), ElevenLabs REST API(`text-to-speech`), Supabase Storage(`mentos-assets` 텍스트·`math-tts` 음성), vitest(`scripts/**/*.test.mjs`), ffmpeg 불필요(ElevenLabs가 mp3 직접 반환).

**스펙:** `docs/superpowers/specs/2026-06-23-elevenlabs-avs-tts-design.md`
**브랜치:** `feat/elevenlabs-avs-tts` (신규 — Task 0에서 생성)

---

## 사전 메모(구현자 필독)

- **`.env` 키(이미 설정됨)**: `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL`(=`eleven_multilingual_v2`). 하드코딩 금지, `.env`에서만 로드(미설정 시 fail-fast).
- **ElevenLabs 합성 API**: `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}?output_format=mp3_44100_128`, 헤더 `xi-api-key`, 바디 `{ text, model_id, voice_settings:{stability:0.5, similarity_boost:0.75} }`, 응답 = mp3 바이너리. 사용량: `GET /v1/user/subscription` → `{ character_count, character_limit }`.
- **나레이션 추출 재사용**: `scripts/generate_su1_tts.cjs`가 `module.exports = { STAGES, buildNarration, latexToSpeech }`. `buildNarration(data)`는 힌트 JSON(P/C/B/S·steps 4종 스키마)→낭독 문자열. **단 내부적으로 su1 `latexToSpeech`를 씀** → 미적분 기호 약함. 따라서 ElevenLabs 경로는 `buildNarration`을 직접 쓰지 않고, **JSON에서 낭독 대상 필드만 추출 후 신규 `latexToSpeechCalc`로 전처리**한다(Task 3에서 추출기 작성).
- **manifest**: `scripts/tts_manifest.json`(키=`{ttsDir}/{NNN}.mp3`). ElevenLabs 클립은 `{ engine:'elevenlabs', model, voiceId, bytes, chars, generatedAt }`로 기록(기존 gemini 항목과 구분).
- **저장 경로**: 기존과 동일 `math-tts/{ttsDir}/{NNN}.mp3`. 앱 연동 추가 코드 원칙적 불필요.
- **대상 = 텍스트 보유 ∧ TTS 미보유**: Task 2에서 실측 확정(스펙 기준 34폴더·~1,806개).
- **Supabase list/upload 패턴**: `generate_su1_tts.cjs:303 listAll`, `:368 uploadToSupabase` 참고(둘 다 미export → ElevenLabs 생성기는 자체 구현, 동일 패턴).

---

## Phase 0 — 셋업

### Task 0: 브랜치 생성 + 스펙 이동

**Files:** (git)

- [ ] **Step 1: 신규 브랜치 생성(현재 main 최신 기준)**

Run:
```bash
cd /Users/mac/mathmentos && git fetch origin && git checkout -b feat/elevenlabs-avs-tts origin/main
```
Expected: `Switched to a new branch 'feat/elevenlabs-avs-tts'`

- [ ] **Step 2: 스펙 파일을 새 브랜치로 가져오기**

Run:
```bash
cd /Users/mac/mathmentos && git checkout feat/tts-voice-unification -- docs/superpowers/specs/2026-06-23-elevenlabs-avs-tts-design.md && git add -f docs/superpowers/specs/2026-06-23-elevenlabs-avs-tts-design.md && git commit -m "docs: ElevenLabs AVS TTS spec (branch start)"
```
Expected: 커밋 생성.

- [ ] **Step 3: 키 인식 확인(코드 아님, 사전점검)**

Run:
```bash
cd /Users/mac/mathmentos && node -e "require('dotenv').config({override:true}); console.log(['ELEVENLABS_API_KEY','ELEVENLABS_VOICE_ID','ELEVENLABS_MODEL'].map(k=>k+':'+(process.env[k]?'set':'MISSING')).join(' '))"
```
Expected: 셋 다 `set`.

---

## Phase 1 — 순수 모듈 (할당량/글자 소모 없음)

### Task 1: 미적분 수식 낭독 전처리 `latexToSpeechCalc.cjs`

**Files:**
- Create: `scripts/lib/latexToSpeechCalc.cjs`
- Test: `scripts/lib/latexToSpeechCalc.test.mjs`

- [ ] **Step 1: 실패 테스트 작성**

`scripts/lib/latexToSpeechCalc.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import calc from './latexToSpeechCalc.cjs';

describe('latexToSpeechCalc 미적분 전처리', () => {
  it('정적분 구간을 한국어로 읽는다', () => {
    const out = calc.latexToSpeechCalc('\\displaystyle\\int_{1}^{2} x\\,dx');
    expect(out).toContain('1');
    expect(out).toContain('2');
    expect(out).toContain('적분');
    expect(out).not.toContain('\\int');
    expect(out).not.toContain('displaystyle');
  });
  it('분수 dfrac/frac을 ~분의~로', () => {
    expect(calc.latexToSpeechCalc('\\dfrac{3x+2}{x^2}')).toContain('분의');
  });
  it('ln과 lim을 한국어로', () => {
    expect(calc.latexToSpeechCalc('\\ln x')).toContain('자연로그');
    expect(calc.latexToSpeechCalc('\\lim_{x \\to 0} f(x)')).toContain('극한');
  });
  it('도함수 프라임을 읽는다', () => {
    expect(calc.latexToSpeechCalc("f'(x)")).toMatch(/프라임|도함수/);
  });
  it('LaTeX 명령 잔여가 없다', () => {
    const out = calc.latexToSpeechCalc('\\displaystyle\\int_0^1 \\dfrac{1}{x}\\,dx + \\ln 2');
    expect(out).not.toMatch(/\\[a-zA-Z]+/);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/latexToSpeechCalc.test.mjs`
Expected: FAIL ("Cannot find module './latexToSpeechCalc.cjs'").

- [ ] **Step 3: 구현**

`scripts/lib/latexToSpeechCalc.cjs` — su1 `latexToSpeech` 규칙을 베이스로 하되 미적분 기호를 **먼저** 처리(순서 중요: 적분 구간 → 분수 → 기타):
```js
'use strict';

// 미적분/확통/수2 AVS 텍스트의 LaTeX 수식을 한국어 구어 낭독으로 변환(순수 함수).
// su1 latexToSpeech를 베이스로 미적분 빈출 기호(적분/극한/자연로그/도함수)를 보강.
function latexToSpeechCalc(text) {
  if (!text) return '';
  let s = String(text);

  // 0) 렌더 지시어 제거
  s = s.replace(/\\displaystyle/g, ' ')
       .replace(/\\left/g, ' ').replace(/\\right/g, ' ')
       .replace(/\\!|\\,|\\;|\\:/g, ' ');

  // 1) 정적분: \int_{a}^{b} → "a부터 b까지 적분", \int → "적분"
  s = s.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, ' $1 부터 $2 까지 적분 ')
       .replace(/\\int_([^\s^]+)\^([^\s]+)/g, ' $1 부터 $2 까지 적분 ')
       .replace(/\\int/g, ' 적분 ');
  // dx/dt 등 미분소
  s = s.replace(/\bd([a-zA-Z])\b/g, ' 디$1 ');

  // 2) 극한: \lim_{x \to a} → "x가 a로 갈 때 극한"
  s = s.replace(/\\lim_\{([^}]*?)\\to([^}]*)\}/g, ' $1 가 $2 로 갈 때 극한 ')
       .replace(/\\lim/g, ' 극한 ')
       .replace(/\\to/g, ' 로 ');

  // 3) 분수: \dfrac/\tfrac/\frac{a}{b} → "b 분의 a"
  s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $2 분의 $1 ');

  // 4) 로그/함수
  s = s.replace(/\\ln/g, ' 자연로그 ')
       .replace(/\\log/g, ' 로그 ')
       .replace(/\\sin/g, ' 사인 ').replace(/\\cos/g, ' 코사인 ').replace(/\\tan/g, ' 탄젠트 ')
       .replace(/\\sum/g, ' 시그마 ').replace(/\\prod/g, ' 곱 ');

  // 5) 도함수 프라임: f''(x), f'(x)
  s = s.replace(/([a-zA-Z])''\s*\(/g, ' $1 이계도함수 (')
       .replace(/([a-zA-Z])'\s*\(/g, ' $1 프라임 (');

  // 6) 루트/지수/기타
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, ' 루트 $1 ')
       .replace(/\\pm/g, ' 플러스마이너스 ')
       .replace(/\\times/g, ' 곱하기 ').replace(/\\cdot/g, ' 곱하기 ').replace(/\\div/g, ' 나누기 ')
       .replace(/\\leq?\b/g, ' 이하 ').replace(/\\geq?\b/g, ' 이상 ').replace(/\\neq\b/g, ' 같지 않음 ')
       .replace(/\\pi/g, ' 파이 ').replace(/\\theta/g, ' 세타 ')
       .replace(/\\mathbf\{([^{}]*)\}/g, '$1').replace(/\\boxed\{([^{}]*)\}/g, '$1')
       .replace(/\\text\{([^{}]*)\}/g, '$1');

  // 7) 위첨자/아래첨자: x^{2} → "x 제곱"(2일 때) 또는 "x의 n승"
  s = s.replace(/\^\{?2\}?/g, ' 제곱 ')
       .replace(/\^\{([^{}]*)\}/g, ' 의 $1 승 ')
       .replace(/\^([0-9a-zA-Z])/g, ' 의 $1 승 ')
       .replace(/_\{([^{}]*)\}/g, ' $1 ')
       .replace(/_([0-9a-zA-Z])/g, ' $1 ');

  // 8) 잔여 기호 정리
  s = s.replace(/[\\${}]/g, ' ')
       .replace(/\s+/g, ' ')
       .trim();
  return s;
}

module.exports = { latexToSpeechCalc };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/latexToSpeechCalc.test.mjs`
Expected: PASS (5 tests). 실패 시 규칙 순서/정규식 보정(어셔션 약화 금지).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/latexToSpeechCalc.cjs scripts/lib/latexToSpeechCalc.test.mjs
git commit -m "feat(eleven): latexToSpeechCalc — 미적분 수식 낭독 전처리"
```

---

### Task 2: 글자수 한도/재개 순수 로직 `elevenlabsQuota.cjs`

**Files:**
- Create: `scripts/lib/elevenlabsQuota.cjs`
- Test: `scripts/lib/elevenlabsQuota.test.mjs`

- [ ] **Step 1: 실패 테스트**

`scripts/lib/elevenlabsQuota.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import q from './elevenlabsQuota.cjs';

describe('elevenlabsQuota', () => {
  it('done 제외한 남은 작업 반환', () => {
    const r = q.remaining([{ key: 'a/001.mp3' }, { key: 'a/002.mp3' }], { done: ['a/001.mp3'] });
    expect(r.map(x => x.key)).toEqual(['a/002.mp3']);
  });
  it('다음 클립이 한도를 넘기면 true', () => {
    expect(q.wouldExceed(130000, 1500, 131000)).toBe(true);
    expect(q.wouldExceed(100000, 1500, 131000)).toBe(false);
  });
  it('429/401/quota 에러를 한도소진으로 판정', () => {
    expect(q.isQuotaError({ status: 429 })).toBe(true);
    expect(q.isQuotaError({ status: 401 })).toBe(true);
    expect(q.isQuotaError({ message: 'quota_exceeded' })).toBe(true);
    expect(q.isQuotaError({ status: 500 })).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/elevenlabsQuota.test.mjs`
Expected: FAIL ("Cannot find module").

- [ ] **Step 3: 구현**

`scripts/lib/elevenlabsQuota.cjs`:
```js
'use strict';

// ElevenLabs 글자수 한도/재개 순수 로직 (I/O 없음).
function remaining(items, progress = { done: [] }) {
  const done = new Set((progress && progress.done) || []);
  return items.filter(it => !done.has(it.key));
}

function wouldExceed(usedChars, nextChars, limit) {
  return (usedChars + nextChars) > limit;
}

function isQuotaError(err) {
  if (!err) return false;
  if (err.status === 429 || err.status === 401 || err.status === 402) return true;
  const msg = String(err.message || '');
  return /quota|character_limit|unauthorized|payment/i.test(msg);
}

module.exports = { remaining, wouldExceed, isQuotaError };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/elevenlabsQuota.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/elevenlabsQuota.cjs scripts/lib/elevenlabsQuota.test.mjs
git commit -m "feat(eleven): elevenlabsQuota — 글자수 한도/재개 순수 로직"
```

---

### Task 3: ElevenLabs 합성 SSOT `ttsElevenLabs.cjs`

**Files:**
- Create: `scripts/lib/ttsElevenLabs.cjs`
- Test: `scripts/lib/ttsElevenLabs.test.mjs`

- [ ] **Step 1: 실패 테스트(fetch 모킹)**

`scripts/lib/ttsElevenLabs.test.mjs`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  process.env.ELEVENLABS_API_KEY = 'sk_test';
  process.env.ELEVENLABS_VOICE_ID = 'voice123';
  process.env.ELEVENLABS_MODEL = 'eleven_multilingual_v2';
  vi.resetModules();
});

describe('ttsElevenLabs.synthesize', () => {
  it('voiceId 엔드포인트로 POST하고 mp3 buffer+chars 반환', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    const m = await import('./ttsElevenLabs.cjs');
    const r = await m.synthesize('테스트 문장');
    const url = String(global.fetch.mock.calls[0][0]);
    expect(url).toContain('/text-to-speech/voice123');
    expect(r.chars).toBe('테스트 문장'.length);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.model_id).toBe('eleven_multilingual_v2');
  });
  it('키 미설정 시 throw', async () => {
    delete process.env.ELEVENLABS_API_KEY;
    vi.resetModules();
    const m = await import('./ttsElevenLabs.cjs');
    await expect(m.synthesize('x')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsElevenLabs.test.mjs`
Expected: FAIL ("Cannot find module").

- [ ] **Step 3: 구현**

`scripts/lib/ttsElevenLabs.cjs`:
```js
'use strict';

require('dotenv').config();

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

// 텍스트 → { buffer(mp3), chars }. 429/5xx 재시도.
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
      // 401/402/429 = 한도/결제 → 즉시 throw(재시도 무의미)
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
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsElevenLabs.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/ttsElevenLabs.cjs scripts/lib/ttsElevenLabs.test.mjs
git commit -m "feat(eleven): ttsElevenLabs — 합성 SSOT(synthesize/getUsage)"
```

---

### Task 4: 나레이션 추출기 `extractNarration.cjs`

힌트 JSON(P/C/B/S·steps 스키마)에서 낭독 대상 텍스트만 뽑아 `latexToSpeechCalc`로 전처리한다. (su1 `buildNarration`은 su1 latexToSpeech에 묶여 있어 재사용 대신 추출만 분리)

**Files:**
- Create: `scripts/lib/extractNarration.cjs`
- Test: `scripts/lib/extractNarration.test.mjs`

- [ ] **Step 1: 실패 테스트**

`scripts/lib/extractNarration.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import ex from './extractNarration.cjs';

describe('extractNarration', () => {
  it('P/C/B/S phase steps에서 낭독문 생성(A=정답 제외)', () => {
    const data = { steps: [
      { phase: 'P', content: '$\\int_0^1 x\\,dx$ 의 값' },
      { phase: 'C', content: '구간은 0부터 1' },
      { phase: 'B', content: '정적분 공식' },
      { phase: 'S', content: '$\\dfrac{1}{2}$' },
      { phase: 'A', content: '정답 노출 금지' },
    ]};
    const out = ex.extractNarration(data);
    expect(out).toContain('적분');
    expect(out).toContain('분의');
    expect(out).not.toContain('정답 노출 금지');
    expect(out).not.toMatch(/\\[a-zA-Z]+/);
  });
  it('낭독 텍스트가 없으면 빈 문자열', () => {
    expect(ex.extractNarration({})).toBe('');
    expect(ex.extractNarration({ steps: [] })).toBe('');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/extractNarration.test.mjs`
Expected: FAIL.

- [ ] **Step 3: 구현**

`scripts/lib/extractNarration.cjs`:
```js
'use strict';

const { latexToSpeechCalc } = require('./latexToSpeechCalc.cjs');

// 힌트 JSON에서 P/C/B/S 낭독문을 뽑아 한국어로 전처리. A(정답)는 제외.
// 지원 스키마: (A) steps[].phase 'P/C/B/S', (B) steps[].label 'P:/P(', (D) top-level P/C/B/S.
function pickPCBS(data) {
  const steps = Array.isArray(data.overlay_steps) ? data.overlay_steps
    : Array.isArray(data.steps) ? data.steps : null;
  const by = {};
  if (steps) {
    for (const st of steps) {
      if (!st || typeof st !== 'object') continue;
      let ph = null;
      if (/^[PCBS]$/.test(st.phase || '')) ph = st.phase;
      else {
        const m = (st.label || '').trim().toUpperCase().match(/^([PCBS])\s*[(:]/);
        if (m) ph = m[1];
      }
      if (ph && !by[ph]) by[ph] = st.content || st.text || st.formula_raw || st.latex || '';
    }
  }
  // D) top-level
  for (const ph of ['P', 'C', 'B', 'S']) {
    if (!by[ph] && typeof data[ph] === 'string') by[ph] = data[ph];
  }
  return by;
}

function extractNarration(data) {
  if (!data || typeof data !== 'object') return '';
  const by = pickPCBS(data);
  const order = ['P', 'C', 'B', 'S'];
  const parts = order
    .map(ph => by[ph])
    .filter(Boolean)
    .map(t => latexToSpeechCalc(t))
    .filter(t => t && t.trim().length > 0);
  return parts.join('. ').replace(/\s+/g, ' ').trim();
}

module.exports = { extractNarration, pickPCBS };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/extractNarration.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/extractNarration.cjs scripts/lib/extractNarration.test.mjs
git commit -m "feat(eleven): extractNarration — 힌트 JSON→한국어 낭독문(미적분 전처리)"
```

---

## Phase 2 — 대상 매핑 (Supabase 읽기, 글자소모 0)

### Task 5: 대상 폴더↔ttsDir 매핑 빌더 `build_elevenlabs_map.cjs`

텍스트 보유 ∧ TTS 미보유 폴더를 실측하고, 각 텍스트폴더(hintDir)에 대응할 `ttsDir`를 정한다. (대부분 hintDir 그대로 ttsDir로 써도 무방하나, 앱 라우팅 일치가 핵심 — 내용/pid로 검증)

**Files:**
- Create: `scripts/build_elevenlabs_map.cjs`
- Create(출력): `scripts/tts_elevenlabs_map.json`

- [ ] **Step 1: 빌더 작성**

`scripts/build_elevenlabs_map.cjs`:
```js
'use strict';
require('dotenv').config();
const fs = require('fs');

const U = process.env.VITE_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!U || !K) { console.error('Supabase 키 미설정'); process.exit(1); }

async function list(bucket, prefix) {
  const r = await fetch(`${U}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!r.ok) throw new Error(`list ${bucket}/${prefix}: ${r.status}`);
  return (await r.json()) || [];
}

(async () => {
  const hints = (await list('mentos-assets', 'math_hints/')).filter(x => x.id === null).map(x => x.name);
  // 미적분/확통/수2 텍스트 폴더(스펙 기준 패턴)
  const re = /^(calculus_|math2_)|deriv|integ|prob|normal_dist|random_var|^1_limit|func_limit/i;
  const textFolders = hints.filter(f => re.test(f));
  // math-tts 기존 폴더(이미 음성 있는 것)
  const ttsRoot = (await list('math-tts', '')).filter(x => x.id === null).map(x => x.name);
  const ttsSet = new Set(ttsRoot);

  const map = {};
  const skipped = [];
  for (const f of textFolders) {
    const items = await list('mentos-assets', `math_hints/${f}/`);
    const pids = items.filter(x => x.id !== null && /^\d{3}\.json$/.test(x.name || '')).map(x => x.name.replace('.json', ''));
    if (pids.length === 0) { skipped.push({ folder: f, reason: 'no-json' }); continue; }
    // ttsDir = hintDir 그대로(앱이 동일 이름 폴더를 재생하면 OK). 이미 음성 있으면 보류(중복).
    if (ttsSet.has(f)) { skipped.push({ folder: f, reason: 'tts-exists' }); continue; }
    map[f] = { ttsDir: f, pids };
  }
  fs.writeFileSync('scripts/tts_elevenlabs_map.json', JSON.stringify({
    note: 'hintDir→ttsDir(동일명) 매핑. 텍스트 보유∧TTS미보유만. pids=대상 클립.',
    counts: { mapped: Object.keys(map).length, skipped: skipped.length,
      totalClips: Object.values(map).reduce((a, m) => a + m.pids.length, 0) },
    map, skipped,
  }, null, 2));
  console.log('mapped folders:', Object.keys(map).length, '| skipped:', skipped.length,
    '| total clips:', Object.values(map).reduce((a, m) => a + m.pids.length, 0));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
```

- [ ] **Step 2: 실행 → 매핑 생성**

Run: `cd /Users/mac/mathmentos && node scripts/build_elevenlabs_map.cjs`
Expected: `mapped folders: N | skipped: M | total clips: ~1800` 출력, `scripts/tts_elevenlabs_map.json` 생성. (정확 수치는 실측값 — 강제하지 말 것)

- [ ] **Step 3: 매핑 1건 내용 검증(앱 ttsDir 일치 확인)**

Run:
```bash
cd /Users/mac/mathmentos && node -e "const m=require('./scripts/tts_elevenlabs_map.json'); console.log(m.counts); console.log('sample:', Object.entries(m.map).slice(0,3).map(([k,v])=>k+'→'+v.ttsDir+'('+v.pids.length+')').join(', '));"
```
Expected: counts 출력 + 샘플 매핑. ttsDir이 hintDir과 동일함 확인.

> **확인 필요(구현자 메모):** 앱이 이 ttsDir(예: `calculus_09_def_integral_homework`)에서 음성을 실제로 재생하는지 `src/hooks/useMathClassroomEngine.js`·`src/components/hints/HintPlayerRouter.jsx`에서 grep. 앱이 다른 ttsDir 이름을 기대하면 map의 ttsDir을 그 이름으로 교정(이게 잘못되면 음성이 안 들림). 불명확하면 BLOCKED 보고.

- [ ] **Step 4: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/build_elevenlabs_map.cjs
git add -f scripts/tts_elevenlabs_map.json
git commit -m "feat(eleven): 대상 매핑 빌더 + tts_elevenlabs_map.json(텍스트보유∧TTS미보유)"
```

---

## Phase 3 — 오케스트레이터 + 실생성

### Task 6: 생성 오케스트레이터 `generate_elevenlabs_avs.cjs`

**Files:**
- Create: `scripts/generate_elevenlabs_avs.cjs`

- [ ] **Step 1: 작성**

`scripts/generate_elevenlabs_avs.cjs`:
```js
'use strict';
require('dotenv').config();
const fs = require('fs');
const { synthesize, getUsage } = require('./lib/ttsElevenLabs.cjs');
const { extractNarration } = require('./lib/extractNarration.cjs');
const q = require('./lib/elevenlabsQuota.cjs');

const U = process.env.VITE_SUPABASE_URL;
const K = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TTS_BUCKET = 'math-tts';
const HINT_BUCKET = 'mentos-assets';
const MAP = 'scripts/tts_elevenlabs_map.json';
const PROGRESS = 'scripts/tts_elevenlabs_progress.json';
const MANIFEST = 'scripts/tts_manifest.json';
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const VOICE = process.env.ELEVENLABS_VOICE_ID;
// 안전 여유: 월 한도에서 이만큼 남기고 멈춤(다음 클립이 못 들어갈 위험 대비)
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
  // 작업 목록 평탄화: { key, hintDir, ttsDir, pid }
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
```

- [ ] **Step 2: 구문 확인**

Run: `cd /Users/mac/mathmentos && node --check scripts/generate_elevenlabs_avs.cjs && echo OK`
Expected: `OK`.

- [ ] **Step 3: dry plan(생성 0, 사용량/대상 확인)**

Run: `cd /Users/mac/mathmentos && node scripts/generate_elevenlabs_avs.cjs --plan`
Expected: `사용량 .../131000자 ... 남은 작업 ~1800/~1800` + `--plan: 생성 없이 종료`.

- [ ] **Step 4: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/generate_elevenlabs_avs.cjs
git commit -m "feat(eleven): 생성 오케스트레이터(전처리→합성→업로드→manifest, 글자한도 재개)"
```

---

### Task 7: 소규모 실생성 검증(3클립)

**Files:** (실행/검증)

- [ ] **Step 1: 한도 작게 잡아 3클립만 — 임시 limit 환경변수로 통제**

3클립만 만들기 위해 progress를 이용: 먼저 plan으로 첫 대상 3개 key 확인 후, 매핑을 3개로 줄인 임시 실행 대신 **오케스트레이터에 `--max N` 가드가 없으므로**, 안전하게 `ELEVEN_SAFETY`를 매우 크게 설정해 1~3개 직후 중단되게 하거나, 매핑 사본으로 3개만 남겨 실행. 권장: 임시 매핑 사본:
```bash
cd /Users/mac/mathmentos
node -e "const m=require('./scripts/tts_elevenlabs_map.json'); const k=Object.keys(m.map)[0]; const one={[k]:{ttsDir:m.map[k].ttsDir,pids:m.map[k].pids.slice(0,3)}}; require('fs').writeFileSync('/tmp/eleven_map3.json', JSON.stringify({map:one},null,2)); console.log('3클립 임시매핑:', k, one[k].pids);"
cp scripts/tts_elevenlabs_map.json /tmp/eleven_map_full.json
cp /tmp/eleven_map3.json scripts/tts_elevenlabs_map.json
```

- [ ] **Step 2: 실생성 3클립**

Run: `cd /Users/mac/mathmentos && node scripts/generate_elevenlabs_avs.cjs 2>&1 | tail -10`
Expected: `DONE .../001.mp3` 등 3줄 + `배치 완료. 이번 생성 3`.

- [ ] **Step 3: 매핑 원복 + 검증**

```bash
cd /Users/mac/mathmentos
cp /tmp/eleven_map_full.json scripts/tts_elevenlabs_map.json
node -e "const m=require('./scripts/tts_manifest.json'); const p=require('./scripts/tts_elevenlabs_progress.json'); for(const k of p.done) console.log(k, m[k]?.engine, m[k]?.voiceId, m[k]?.chars);"
```
Expected: 3개 키가 `elevenlabs / <voiceId> / <chars>`로 기록.

- [ ] **Step 4: 음성 1개 다운로드 청취(수식 낭독 품질 확인)**

```bash
cd /Users/mac/mathmentos
KEY=$(node -e "console.log(require('./scripts/tts_elevenlabs_progress.json').done[0])")
curl -s "$(node -e "require('dotenv').config();console.log(process.env.VITE_SUPABASE_URL)")/storage/v1/object/public/math-tts/$KEY" -o /tmp/eleven_check.mp3 && echo "→ /tmp/eleven_check.mp3 (open으로 청취)"
```
Expected: mp3 저장. 사용자가 청취해 수식 낭독 품질 확인(어색하면 Task 1 규칙 보강 후 해당 클립 재생성).

- [ ] **Step 5: 진행 커밋**

```bash
cd /Users/mac/mathmentos
git add -f scripts/tts_manifest.json scripts/tts_elevenlabs_progress.json
git commit -m "chore(eleven): 파일럿 3클립 생성 검증(elevenlabs manifest 기록)"
```

---

### Task 8: 월 배치 운영 + 회귀 가드

**Files:** (실행/검증) — 월 한도 내 반복.

- [ ] **Step 1: 회귀 가드(기존 Gemini 트랙 불변)**

Run:
```bash
cd /Users/mac/mathmentos
grep -rnE "gemini-2.5-flash-preview-tts" scripts/ src/ || echo "✓ 2.5 없음"
npm test 2>&1 | tail -5
npm run build 2>&1 | tail -3
```
Expected: 2.5 없음, 테스트 통과, 빌드 exit 0. (ElevenLabs 코드가 기존 트랙 미오염)

- [ ] **Step 2: 월 배치 실행(한도까지)**

Run: `cd /Users/mac/mathmentos && node scripts/generate_elevenlabs_avs.cjs 2>&1 | tail -15`
Expected: 한도 임박/소진까지 `DONE` 누적 후 중단. progress 저장. 다음 달(또는 한도 리셋) 재실행.

- [ ] **Step 3: 진행 커밋(매 배치)**

```bash
cd /Users/mac/mathmentos
git add -f scripts/tts_manifest.json scripts/tts_elevenlabs_progress.json
git commit -m "chore(eleven): 월 배치 — N클립 생성(누적 갱신)"
```

- [ ] **Step 4: 완료 게이트(전량 소진 시)**

Run:
```bash
cd /Users/mac/mathmentos
node -e "const m=require('./scripts/tts_elevenlabs_map.json'); const p=require('./scripts/tts_elevenlabs_progress.json'); const total=Object.values(m.map).reduce((a,x)=>a+x.pids.length,0); console.log('done', p.done.length, '/', total, '남은', total-p.done.length);"
```
Expected: `done == total`(전량 완료) 또는 남은 수 확인. 앱에서 미적분/확통/수2 단원 음성 재생 확인(과목 내 ElevenLabs 음색 일관).

---

## 자기 검토(작성자 체크)

- **스펙 커버리지:** §5 모듈3=Task1·2·3, 나레이션 추출(buildNarration 재사용 대안)=Task4, 매핑=Task5, 오케스트레이터=Task6, 검증=Task7, 월배치/회귀=Task8. §4 글자한도 분할=Task6 `wouldExceed`+Task8 반복. §3 음색정책(engine 구분)=Task6 recordManifest. §6 데이터흐름 일치. §7 에러처리(키 fail-fast=Task3, 한도 exit=Task6, 매핑보류=Task5 skipped). §8 테스트=각 Task TDD + Task8 회귀. §10 미해결(ttsDir 앱연동)=Task5 Step3 가드.
- **플레이스홀더:** 없음. 수치(~1,806)는 실측 의존이라 "강제 말 것" 명시.
- **타입/이름 일관성:** `synthesize→{buffer,chars}`, `getUsage→{used,limit}`, `extractNarration(data)→string`, `remaining/wouldExceed/isQuotaError`, map 스키마 `{ttsDir,pids}`, progress `{done:[]}`, manifest `{engine,model,voiceId,bytes,chars}` — Task 간 일관.

## 미해결/실데이터 의존(구현 중 확정)
- Task 5 Step3: 앱이 `calculus_*`/`math2_*` ttsDir에서 실제 음성 재생하는지(미연결 시 ttsDir 교정 또는 앱 매핑 보강). 잘못되면 음성 안 들림 → 반드시 확인.
- 평균 글자수 실측 → 월 처리량/소요 개월 정밀화.
- `prob_casesstep*` 등 기존 클립 중복분은 build 매핑의 `tts-exists` skip으로 자동 제외됨(확인).
