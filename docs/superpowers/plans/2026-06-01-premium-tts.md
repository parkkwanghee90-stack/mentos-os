# Premium Lecture TTS — Coverage + Voice Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the premium-lecture audio path bug, unify baseId/path/TTS config into shared SSOT modules, audit Supabase coverage, fill gaps via per-lecture single-call Gemini synthesis, and replace the robotic Web Speech fallback.

**Architecture:** Runtime player and offline generator share one baseId→path resolution path (`getSafePath`-based, no `encodeURIComponent`) so upload and request paths can never diverge. Generation synthesizes a whole lecture in one Gemini call then silence-splits with a per-step fallback gate for voice consistency.

**Tech Stack:** Vite + React (ESM), Node `.cjs` scripts, Gemini 3.1 flash-tts-preview (`Aoede`), ffmpeg, Supabase Storage (`mentos-assets`), Vitest (new, for pure-function unit tests).

**Spec:** `docs/superpowers/specs/2026-06-01-premium-tts-design.md`

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `vitest.config.js` | Create | Vitest config (node env). |
| `src/lib/premiumLectureMap.js` | Create | `toBaseId(raw)` — lecture name/id variants → canonical baseId. Pure. |
| `src/lib/premiumLectureMap.test.js` | Create | Unit tests for `toBaseId`. |
| `src/lib/premiumAudioPath.js` | Create | `audioRelPath(baseId, step)` → unencoded relative path. Pure. |
| `src/lib/premiumAudioPath.test.js` | Create | Asserts no `%`-encoding + `getSafePath` resolves Korean→English. |
| `src/components/lectures/PremiumLecturePlayer.jsx` | Modify | Use the two modules; remove the two duplicated mapping chains; replace fallback. |
| `scripts/lib/ttsConfig.cjs` | Create | `MODEL`, `VOICE`, `buildPrompt()`, `SPEECH_CONFIG`, `cleanNarration()` SSOT. |
| `scripts/lib/ttsConfig.test.mjs` | Create | `cleanNarration` unit tests (vitest). |
| `scripts/lib/geminiTts.cjs` | Create | `generateTTS(text)` + API key pool rotation + retry. |
| `scripts/audit_premium_tts.cjs` | Create | List bucket, cross-ref lecture JSON steps, report gaps/orphans/mismatches. |
| `scripts/generate_premium_gemini_tts.cjs` | Rewrite | Per-lecture single-call synthesis → silence split → gate → idempotent upload. Pulls missing lecture JSONs from Supabase. |

**Order rationale:** Pure modules + tests first (cheap, lock interfaces), then runtime refactor (recovers existing audio at zero cost), then offline tooling, then the actual generation run.

---

## Task 1: Vitest setup

**Files:**
- Create: `vitest.config.js`
- Modify: `package.json` (devDependency + `test` script)
- Test: `src/lib/__smoke__.test.js` (temporary smoke test, deleted in Step 6)

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest@^2
```
Expected: adds `vitest` to devDependencies, exit 0.

- [ ] **Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.mjs'],
  },
});
```

- [ ] **Step 3: Add `test` script to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run"
```

- [ ] **Step 4: Write a smoke test**

Create `src/lib/__smoke__.test.js`:
```js
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Delete the smoke test and commit**

```bash
rm src/lib/__smoke__.test.js
git add package.json package-lock.json vitest.config.js
git commit -m "chore: add vitest for unit tests"
```

---

## Task 2: `premiumLectureMap.js` — canonical baseId (TDD)

This ports the **comprehensive** mapping chain currently inlined in
`PremiumLecturePlayer.jsx:63-136` into one pure function used by both JSON and audio
resolution. The current second (audio) chain at L162-177 is incomplete — that is the
duplication this removes.

**Files:**
- Create: `src/lib/premiumLectureMap.js`
- Test: `src/lib/premiumLectureMap.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/premiumLectureMap.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { toBaseId } from './premiumLectureMap';

describe('toBaseId', () => {
  it('maps 고차방정식 variants', () => {
    expect(toBaseId('고차방정식')).toBe('고차방정식');
    expect(toBaseId('09고차방정식 2단계')).toBe('고차방정식');
  });
  it('maps 미적분 sub-units before generic 정적분', () => {
    expect(toBaseId('미적분_정적분')).toBe('미적분_정적분');
    expect(toBaseId('미적분 삼각함수의 극한')).toBe('미적분_삼각함수극한');
  });
  it('maps 확통 units', () => {
    expect(toBaseId('원순열')).toBe('확통_순열');
    expect(toBaseId('이항정리')).toBe('확통_중복조합');
  });
  it('maps 수학2 정적분 to 부정적분과정적분', () => {
    expect(toBaseId('정적분')).toBe('부정적분과정적분');
  });
  it('returns input unchanged when no rule matches', () => {
    expect(toBaseId('unknown-xyz')).toBe('unknown-xyz');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- premiumLectureMap`
Expected: FAIL ("Cannot find module './premiumLectureMap'").

- [ ] **Step 3: Implement `premiumLectureMap.js`**

Create `src/lib/premiumLectureMap.js` — port the chain verbatim from the player's
fetch mapping (the complete one), wrapped as a pure function:
```js
// Canonical baseId resolution for premium lectures.
// Single source of truth shared by JSON fetch and audio path resolution.
// Ported from the (comprehensive) mapping previously inlined in PremiumLecturePlayer.

export function toBaseId(raw) {
  if (!raw) return raw;
  let baseId = raw;

  // --- 고등수학(상)/수학1 핵심 단원 (우선순위) ---
  if (baseId.includes('고차방정식')) baseId = '고차방정식';
  else if (baseId.includes('직선의방정식') || baseId.includes('직선의 방정식')) baseId = '직선의방정식';
  else if (baseId.includes('원의방정식') || baseId.includes('원의 방정식')) baseId = '원의방정식';
  else if (baseId.includes('도형의이동') || baseId.includes('도형의 이동')) baseId = '도형의이동';
  else if (baseId.includes('경우의수') || baseId.includes('경우의 수')) baseId = '경우의수';
  else if (baseId.includes('행렬')) baseId = '행렬';
  else if (baseId.includes('점과좌표') || baseId.includes('점과 좌표')) baseId = '점과좌표';
  else if (baseId.includes('일차부등식')) baseId = '일차부등식';
  else if (baseId.includes('이차부등식')) baseId = '이차부등식';
  else if (baseId.replace(/\s/g, '').includes('삼각함수그래프')) baseId = '삼각함수그래프';

  // --- 수열 ---
  else if (baseId.includes('여러가지수열') || baseId.includes('여러 가지 수열') || baseId.includes('여러 가지수열')) baseId = '여러가지수열';
  else if (baseId.includes('점화식')) baseId = '점화식';
  else if (baseId.includes('수학적귀납법') || baseId.includes('귀납법')) baseId = '수학적귀납법';
  else if (baseId.includes('등차')) baseId = '등차수열';
  else if (baseId.includes('등비')) baseId = '등비수열';
  else if (baseId.includes('수열의합') || baseId.includes('수열의 합') || baseId.includes('시그마')) baseId = '수열의합';

  // --- 미적분 (Grade 12) ---
  else if (baseId.includes('미적분') || baseId.includes('초월함수') || baseId.includes('여러가지 적분') || baseId.includes('여러 가지 적분')) {
    if (baseId.includes('수열의극한') || baseId.includes('수열의 극한')) baseId = '미적분_수열의극한';
    else if (baseId.includes('급수')) baseId = '미적분_급수';
    else if (baseId.includes('지수로그함수의극한') || baseId.includes('지수로그함수의 극한') || baseId.includes('여러가지함수미분')) baseId = '미적분_지수로그극한';
    else if (baseId.includes('삼각함수의극한') || baseId.includes('삼각함수의 극한')) baseId = '미적분_삼각함수극한';
    else if (baseId.includes('삼각함수') && (baseId.includes('공식') || baseId.includes('합성'))) baseId = '미적분_삼각함수공식';
    else if (baseId.includes('여러가지미분법') || baseId.includes('미분법')) baseId = '미적분_미분법';
    else if (baseId.includes('도함수활용') || baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '미적분_도함수활용';
    else if (baseId.includes('적분법') || baseId.includes('치환적분') || baseId.includes('부분적분')) baseId = '미적분_적분법';
    else if (baseId.includes('정적분활용') || baseId.includes('정적분의활용') || baseId.includes('정적분의 활용')) baseId = '미적분_정적분활용';
    else if (baseId.includes('정적분')) baseId = '미적분_정적분';
  }
  else if (baseId.includes('여러') && baseId.includes('적분법')) baseId = '미적분_적분법';
  else if (baseId.includes('초월함수') && baseId.includes('정적분')) baseId = '미적분_정적분';
  else if (baseId.includes('삼각함수') && baseId.includes('공식')) baseId = '미적분_삼각함수공식';

  // --- 수학2 ---
  else if (baseId.includes('함수의극한') || baseId.includes('함수의 극한') || baseId.includes('함수의극')) baseId = '함수의극한';
  else if (baseId.includes('함수의연속') || baseId.includes('함수의 연속')) baseId = '함수의연속';
  else if (baseId.includes('도함수의활용1') || baseId.includes('미분의활용1') || baseId.includes('접선')) baseId = '도함수의활용1';
  else if (baseId.includes('도함수의활용2') || baseId.includes('미분의활용2') || baseId.includes('그래프와방정식') || baseId.includes('그래프와 방정식')) baseId = '도함수의활용2';
  else if (baseId.includes('도함수의활용3') || baseId.includes('미분의활용3') || baseId.includes('속도와가속도') || baseId.includes('속도와 가속도')) baseId = '도함수의활용3';
  else if (baseId.includes('도함수의활용') || baseId.includes('도함수의 활용')) baseId = '도함수의활용1';
  else if (baseId.includes('미분계수') || baseId.includes('도함수')) baseId = '미분계수와도함수';
  else if (baseId.includes('정적분의활용') || baseId.includes('정적분의 활용') || baseId.includes('정적분활용')) baseId = '정적분의활용';
  else if (baseId.includes('부정적분')) baseId = '부정적분과정적분';
  else if (baseId.includes('정적분')) baseId = '부정적분과정적분';
  else if (baseId.includes('적분법')) baseId = '부정적분과정적분';

  // --- 기타 ---
  else if (baseId.includes('지수함수')) baseId = '지수함수';
  else if (baseId.includes('지수')) baseId = '지수';
  else if (baseId.includes('로그함수')) baseId = '로그함수';
  else if (baseId.includes('로그')) baseId = '로그';
  else if (baseId.includes('원순열') || baseId.includes('중복순열') || baseId.includes('순열')) baseId = '확통_순열';
  else if (baseId.includes('중복조합') || baseId.includes('이항정리')) baseId = '확통_중복조합';
  else if (baseId.includes('확률의뜻') || baseId.includes('확률의 뜻')) baseId = '확통_확률정의';
  else if (baseId.includes('조건부확률') || baseId.includes('독립시행')) baseId = '확통_조건부확률';
  else if (baseId.includes('이산확률') || baseId.includes('이항분포')) baseId = '확통_이산확률';
  else if (baseId.includes('연속확률') || baseId.includes('정규분포')) baseId = '확통_연속확률';
  else if (baseId.includes('통계적추정') || baseId.includes('표본평균') || baseId.includes('모평균')) baseId = '확통_통계적추정';
  else if (baseId.includes('순열')) baseId = '순열';
  else if (baseId.includes('조합')) baseId = '조합';
  else if (baseId.includes('삼각함수활용') || baseId.includes('삼각함수의 활용')) baseId = '삼각함수의 활용';
  else if (baseId.includes('삼각함수')) baseId = '삼각함수성질';
  else if (baseId.includes('극한') && !baseId.includes('수열')) baseId = '함수의 극한';
  else if (baseId.includes('연속')) baseId = '함수의 연속';

  return baseId;
}
```

> NOTE: This mirrors the existing fetch chain exactly so JSON resolution behavior is
> unchanged. The test set above is the contract; if any assertion fails, fix the chain
> ordering, not the test.

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- premiumLectureMap`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/premiumLectureMap.js src/lib/premiumLectureMap.test.js
git commit -m "feat: extract canonical premium lecture baseId mapping (SSOT)"
```

---

## Task 3: `premiumAudioPath.js` — the path-bug fix (Red-Green)

The bug: player did `encodeURIComponent(baseId)` before `resolveAsset`, so `getSafePath`
never mapped Korean→English. This helper returns the **unencoded** relative path; callers
pass it to `resolveAsset` (same as the working JSON fetch). The test proves end-to-end
resolution via `getSafePath`.

**Files:**
- Create: `src/lib/premiumAudioPath.js`
- Test: `src/lib/premiumAudioPath.test.js`

- [ ] **Step 1: Write failing tests (Red)**

Create `src/lib/premiumAudioPath.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { audioRelPath } from './premiumAudioPath';
import { getSafePath } from '@/config/pathMapping';

describe('audioRelPath', () => {
  it('returns an unencoded relative path (no %-encoding)', () => {
    const p = audioRelPath('고차방정식', 1);
    expect(p).toBe('/audio/premium_lectures/고차방정식/step_1.mp3');
    expect(p).not.toContain('%');
  });

  it('resolves via getSafePath to the English upload path (the bug fix)', () => {
    // This is the exact path the generator uploads to.
    const rel = audioRelPath('고차방정식', 1).replace(/^\//, '');
    expect(getSafePath(rel)).toBe('audio/premium_lectures/higher_order_eq/step_1.mp3');
  });

  it('matches prob_cases mapping for 경우의수', () => {
    const rel = audioRelPath('경우의수', 3).replace(/^\//, '');
    expect(getSafePath(rel)).toBe('audio/premium_lectures/prob_cases/step_3.mp3');
  });
});
```

> The `@/` alias resolves to `src/` (Vite config). If Vitest does not pick up the alias,
> add `resolve: { alias: { '@': '/src' } }` to `vitest.config.js` and re-run.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- premiumAudioPath`
Expected: FAIL ("Cannot find module './premiumAudioPath'").

- [ ] **Step 3: Implement `premiumAudioPath.js`**

Create `src/lib/premiumAudioPath.js`:
```js
// Builds the premium-lecture audio path WITHOUT encodeURIComponent so that
// resolveAsset/getSafePath can map Korean baseIds to their English storage paths.
// Caller passes the result to window.resolveAsset(), mirroring the JSON fetch.

export function audioRelPath(baseId, step) {
  return `/audio/premium_lectures/${baseId}/step_${step}.mp3`;
}
```

- [ ] **Step 4: Run to verify pass (Green)**

Run: `npm test -- premiumAudioPath`
Expected: PASS. If the alias assertion fails, apply the `vitest.config.js` alias note above, then re-run.

- [ ] **Step 5: Commit**

```bash
git add src/lib/premiumAudioPath.js src/lib/premiumAudioPath.test.js vitest.config.js
git commit -m "fix: premium audio path no longer pre-encodes baseId (path mismatch bug)"
```

---

## Task 4: Refactor `PremiumLecturePlayer.jsx` to use the modules

Replace BOTH inlined mapping chains (L63-136 fetch, L162-177 audio) with `toBaseId`, and
build the audio URL via `audioRelPath` + `resolveAsset` (no `encodeURIComponent`).

**Files:**
- Modify: `src/components/lectures/PremiumLecturePlayer.jsx`

- [ ] **Step 1: Add imports**

At the top of the file (after existing imports):
```jsx
import { toBaseId } from '@/lib/premiumLectureMap';
import { audioRelPath } from '@/lib/premiumAudioPath';
```

- [ ] **Step 2: Replace the JSON-fetch mapping block**

In `fetchLecture` (`useEffect` on `[lectureId]`), replace the entire `let baseId = lectureId; ... if/else chain ...` (lines ~59-136) down to just before `const fetchUrl = ...` with:
```jsx
const baseId = toBaseId(lectureId);
```
Leave the following line as-is:
```jsx
const fetchUrl = window.resolveAsset(`/premium_lectures/${baseId}.json`);
```

- [ ] **Step 3: Replace the audio playback mapping + path block**

In the playback `useEffect` (on `[currentStep, isPlaying, lectureData]`), replace the
second mapping chain (`let baseId = lectureData.id; ... if/else ...`, lines ~160-177) and
the `audioUrl` line with:
```jsx
const baseId = toBaseId(lectureData.id);
const stepNum = step.step;
const audioUrl = window.resolveAsset(audioRelPath(baseId, stepNum));
```

- [ ] **Step 4: Verify the build compiles**

Run: `npx vite build`
Expected: exit 0, no errors referencing PremiumLecturePlayer.

- [ ] **Step 5: Manual smoke (evidence)**

Run: `npm run dev`, open a premium lecture known to have audio (고차방정식 or 경우의수),
press play. Expected: real Gemini voice plays (NOT robotic), console shows the resolved
`audio/premium_lectures/higher_order_eq/...` style URL. Note the result in the commit body.

- [ ] **Step 6: Commit**

```bash
git add src/components/lectures/PremiumLecturePlayer.jsx
git commit -m "refactor: PremiumLecturePlayer uses shared baseId/audio-path modules"
```

---

## Task 5: Replace robotic Web Speech fallback with "준비 중" state

**Files:**
- Modify: `src/components/lectures/PremiumLecturePlayer.jsx`

- [ ] **Step 1: Add state**

Near the other `useState` hooks:
```jsx
const [audioUnavailable, setAudioUnavailable] = useState(false);
```

- [ ] **Step 2: Reset the flag when step/lecture changes**

At the start of the playback `useEffect` body (before building the audio), add:
```jsx
setAudioUnavailable(false);
```

- [ ] **Step 3: Replace the `audio.onerror` handler**

Replace the existing `audio.onerror = (e) => { ... playWebSpeechTTS ... }` with:
```jsx
audio.onerror = () => {
  console.warn('[PremiumTTS] audio missing', { baseId, step: stepNum });
  setIsPlaying(false);
  setAudioUnavailable(true);
};
```

- [ ] **Step 4: Remove the now-dead `playWebSpeechTTS` path**

Delete the `playWebSpeechTTS` function and the `else { playWebSpeechTTS(step.narration); }`
branch (since `USE_GEMINI_AUDIO` is always `true`). Keep `synthRef`/`stopAllAudio`'s
`synthRef.current.cancel()` guard (harmless cleanup).

- [ ] **Step 5: Render the indicator**

In the narration control box (next to the `<Volume2/>` row), add below the narration text:
```jsx
{audioUnavailable && (
  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: '#d97706', textAlign: 'center' }}>
    🔊 이 단계의 음성을 준비 중입니다. 다음 단계로 진행하실 수 있어요.
  </div>
)}
```

- [ ] **Step 6: Verify build**

Run: `npx vite build`
Expected: exit 0, no reference to `playWebSpeechTTS` remains (`grep -n playWebSpeechTTS src/components/lectures/PremiumLecturePlayer.jsx` → no output).

- [ ] **Step 7: Commit**

```bash
git add src/components/lectures/PremiumLecturePlayer.jsx
git commit -m "feat: replace robotic TTS fallback with audio-preparing state"
```

---

## Task 6: `scripts/lib/ttsConfig.cjs` — generation SSOT (TDD on cleanNarration)

**Files:**
- Create: `scripts/lib/ttsConfig.cjs`
- Test: `scripts/lib/ttsConfig.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/ttsConfig.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { cleanNarration, MODEL, VOICE } = require('./ttsConfig.cjs');

describe('ttsConfig', () => {
  it('fixes model and voice', () => {
    expect(MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(VOICE).toBe('Aoede');
  });
  it('converts fractions and roots to Korean reading', () => {
    expect(cleanNarration('$\\frac{1}{2}$')).toBe('2 분의 1');
    expect(cleanNarration('\\sqrt{3}')).toBe('루트 3');
  });
  it('strips color tags and collapses whitespace', () => {
    expect(cleanNarration('<blue>안녕</blue>   하세요')).toBe('안녕 하세요');
  });
  it('returns empty string for falsy input', () => {
    expect(cleanNarration('')).toBe('');
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- ttsConfig`
Expected: FAIL ("Cannot find module './ttsConfig.cjs'").

- [ ] **Step 3: Implement `ttsConfig.cjs`**

Create `scripts/lib/ttsConfig.cjs` (port `cleanNarration` from the current generator,
verbatim, plus shared constants):
```js
// SSOT for premium-lecture TTS generation: model, voice, prompt, speech config, text cleanup.
const MODEL = 'gemini-3.1-flash-tts-preview';
const VOICE = 'Aoede';

// Fixed delivery instruction — identical across all generation for timbre consistency.
const STYLE_INSTRUCTION =
  '너는 고등학생들의 수학 학습을 돕는 친절하고 활기찬 대학생 여자 선생님이야. ' +
  '입력받은 한국어 수학 텍스트(수식 포함)를 친절하고 자연스러운 구어체로 상냥하게 읽어줘. ' +
  '절대로 추가적인 인사말, 해설, 격려 등 잡담을 전혀 덧붙이지 말고, 오직 아래에 주어진 대본 텍스트 자체만 있는 그대로 읽어줘';

function buildPrompt(text) {
  return `${STYLE_INSTRUCTION}:\n\n${text}`;
}

const SPEECH_CONFIG = {
  voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
};

function cleanNarration(text) {
  if (!text) return '';
  return text
    .replace(/<\/?(blue|green|yellow|red)>/g, '')
    .replace(/\$([^$]*)\$/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1')
    .replace(/\\pm/g, '플러스 마이너스')
    .replace(/\\times/g, ' 곱하기 ')
    .replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq/g, ' 이하')
    .replace(/\\geq/g, ' 이상')
    .replace(/\\neq/g, ' 같지 않음')
    .replace(/\\cdot/g, ' 곱하기 ')
    .replace(/\\alpha/g, '알파')
    .replace(/\\beta/g, '베타')
    .replace(/_n\\mathrm\{P\}_r/g, 'n 피 알')
    .replace(/_n\\mathrm\{C\}_r/g, 'n 시 알')
    .replace(/\^/g, '')
    .replace(/\\quad/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { MODEL, VOICE, STYLE_INSTRUCTION, buildPrompt, SPEECH_CONFIG, cleanNarration };
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test -- ttsConfig`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/ttsConfig.cjs scripts/lib/ttsConfig.test.mjs
git commit -m "feat: shared premium TTS generation config (model/voice/prompt/cleanup)"
```

---

## Task 7: `scripts/lib/geminiTts.cjs` — shared Gemini call + key rotation

**Files:**
- Create: `scripts/lib/geminiTts.cjs`

- [ ] **Step 1: Implement the module**

Create `scripts/lib/geminiTts.cjs`:
```js
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
          if (pool.i < pool.keys.length - 1) { pool.i++; attempt = 0; continue; }
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
```

- [ ] **Step 2: Sanity-check it loads**

Run: `node -e "require('./scripts/lib/geminiTts.cjs'); console.log('ok')"`
Expected: prints `ok` (no syntax/require errors).

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/geminiTts.cjs
git commit -m "feat: shared Gemini TTS caller with key rotation and retry"
```

---

## Task 8: `scripts/audit_premium_tts.cjs` + first audit (evidence)

**Files:**
- Create: `scripts/audit_premium_tts.cjs`

- [ ] **Step 1: Implement the audit script**

Create `scripts/audit_premium_tts.cjs`:
```js
// Audits premium-lecture audio coverage on Supabase against lecture JSON step counts.
// Reports: per-lecture missing steps, orphan files at the prefix root, name mismatches.
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { getSafePath } = require('../src/config/pathMapping.js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/mentos-assets`;
const BUCKET = 'mentos-assets';

// Canonical lecture id list (mirrors LECTURE_INDEX in PremiumLectureModal.jsx).
const LECTURE_IDS = [
  '고차방정식','일차부등식','이차부등식','경우의수','행렬','점과좌표','직선의방정식','원의방정식','도형의이동',
  '지수','로그','지수함수','로그함수','삼각함수성질','삼각함수그래프','삼각함수의 활용','등차등비','시그마용법','수학적귀납법',
  '함수의극한','함수의연속','미분계수','도함수의활용','부정적분과정적분','정적분의활용',
  '미적분_수열의극한','미적분_급수','미적분_삼각함수극한','미적분_삼각함수공식','미적분_미분법','미적분_도함수활용','미적분_적분법','미적분_정적분','미적분_정적분활용',
  '순열','조합','이항정리','확률의 뜻','조건부확률','정규분포','통계적 추정',
];

async function listFolder(prefix) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list ${prefix} -> ${res.status}`);
  return res.json();
}

async function fetchLectureJSON(baseId) {
  const safe = getSafePath(`premium_lectures/${baseId}.json`);
  const res = await fetch(`${PUBLIC_PREFIX}/${safe}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function fileExists(safeAudioPath) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${safeAudioPath}`);
  if (!res.ok) return false;
  const info = await res.json().catch(() => null);
  return !!(info && info.size > 10240);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing SUPABASE_URL or SERVICE key'); process.exit(1); }

  // 1. Orphan files at the prefix root (uploaded without a lecture folder).
  const root = await listFolder('audio/premium_lectures/');
  const orphans = root.filter((x) => x.name && x.name.endsWith('.mp3')).map((x) => x.name);

  // 2. Per-lecture coverage.
  const report = [];
  for (const baseId of LECTURE_IDS) {
    const json = await fetchLectureJSON(baseId);
    if (!json || !Array.isArray(json.steps)) {
      report.push({ baseId, status: 'NO_JSON', missing: [], total: 0 });
      continue;
    }
    const safeFolder = getSafePath(`audio/premium_lectures/${baseId}`);
    const missing = [];
    for (const step of json.steps) {
      if (!step.narration) continue;
      const ok = await fileExists(`${safeFolder}/step_${step.step}.mp3`);
      if (!ok) missing.push(step.step);
    }
    report.push({
      baseId, safeFolder,
      status: missing.length === 0 ? 'COMPLETE' : 'GAP',
      missing, total: json.steps.filter((s) => s.narration).length,
    });
  }

  // 3. Print + save.
  console.log('\n=== Premium TTS Audit ===');
  console.log('Orphan root files:', orphans.length, orphans.slice(0, 20));
  for (const r of report) {
    console.log(`[${r.status}] ${r.baseId} -> ${r.safeFolder || '-'}  missing ${r.missing.length}/${r.total}`,
      r.missing.length ? `(${r.missing.join(',')})` : '');
  }
  const out = path.join('scripts', 'premium_tts_audit_report.json');
  fs.writeFileSync(out, JSON.stringify({ generatedFor: 'premium_lectures', orphans, report }, null, 2));
  console.log(`\nSaved ${out}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run the first audit (evidence)**

Run: `node scripts/audit_premium_tts.cjs`
Expected: a table of `[COMPLETE]/[GAP]/[NO_JSON]` per lecture, orphan count, and a saved
`scripts/premium_tts_audit_report.json`. Record the GAP/NO_JSON counts — these define the
generation workload for Task 10.

- [ ] **Step 3: Commit (script + report)**

```bash
git add scripts/audit_premium_tts.cjs
git add -f scripts/premium_tts_audit_report.json
git commit -m "feat: premium TTS coverage audit tool + baseline report"
```

> `scripts/premium_tts_audit_report.json` may be under an ignored path; `-f` ensures the
> baseline is captured. If `git status` shows it already tracked, drop the `-f`.

---

## Task 9: Rewrite `generate_premium_gemini_tts.cjs` (single-call synthesis + gate)

**Files:**
- Rewrite: `scripts/generate_premium_gemini_tts.cjs`

- [ ] **Step 1: Replace the file with the unified generator**

Overwrite `scripts/generate_premium_gemini_tts.cjs` with:
```js
// Premium lecture TTS generator.
// Strategy: synthesize a whole lecture in ONE Gemini call (timbre consistency),
// split by silence with ffmpeg; if the split count != step count (or lecture is too
// long), fall back to per-step generation. Idempotent upload to Supabase.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();

const { getSafePath } = require('../src/config/pathMapping.js');
const { cleanNarration } = require('./lib/ttsConfig.cjs');
const { makeKeyPool, generatePCM } = require('./lib/geminiTts.cjs');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/mentos-assets`;
const BUCKET = 'mentos-assets';
const LOCAL_DIR = path.join('public', 'audio', 'premium_lectures');
const JSON_DIR = path.join('public', 'premium_lectures');
const PAUSE_MARKER = '\n\n…\n\n'; // long pause between steps for silence detection
const MAX_CHARS_SINGLE_CALL = 3000; // above this, force per-step
const POOL_EXTRA = [process.env.VITE_GEMINI_API_KEY_2, process.env.VITE_GEMINI_API_KEY_3].filter(Boolean); // never hardcode keys

if (!SUPABASE_URL || !SERVICE_KEY) { console.error('Missing Supabase env'); process.exit(1); }
fs.mkdirSync(LOCAL_DIR, { recursive: true });
fs.mkdirSync(JSON_DIR, { recursive: true });

function pcmToMp3(pcmBuffer, outMp3) {
  const tmp = outMp3 + '.pcm';
  fs.writeFileSync(tmp, pcmBuffer);
  try {
    execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${tmp}" -codec:a libmp3lame -qscale:a 2 "${outMp3}"`, { stdio: 'pipe' });
  } finally { try { fs.unlinkSync(tmp); } catch (e) {} }
  return fs.readFileSync(outMp3);
}

// Write raw PCM to wav, run silencedetect, return array of {start,end} segment ranges.
function splitBySilence(pcmBuffer, expectedCount, workDir) {
  const wav = path.join(workDir, 'full.wav');
  const pcm = path.join(workDir, 'full.pcm');
  fs.writeFileSync(pcm, pcmBuffer);
  execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${pcm}" "${wav}"`, { stdio: 'pipe' });
  let log = '';
  try {
    execSync(`ffmpeg -i "${wav}" -af silencedetect=noise=-40dB:d=0.9 -f null - 2>&1`, { stdio: 'pipe' });
  } catch (e) { log = (e.stdout || '') + (e.stderr || ''); }
  // ffmpeg writes silencedetect to stderr; capture via a second call piped to file
  log = execSync(`ffmpeg -i "${wav}" -af silencedetect=noise=-40dB:d=0.9 -f null - 2>&1 || true`, { encoding: 'utf8' });
  const starts = [...log.matchAll(/silence_start:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...log.matchAll(/silence_end:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const dur = parseFloat((execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${wav}"`, { encoding: 'utf8' }) || '0').trim());
  // Build speech segments between silence gaps.
  const cuts = [];
  let prev = 0;
  for (let i = 0; i < starts.length; i++) {
    cuts.push({ start: prev, end: starts[i] });
    prev = ends[i] != null ? ends[i] : starts[i];
  }
  cuts.push({ start: prev, end: dur });
  const segs = cuts.filter((c) => c.end - c.start > 0.4);
  try { fs.unlinkSync(pcm); fs.unlinkSync(wav); } catch (e) {}
  return segs.length === expectedCount ? segs : null;
}

async function uploadMp3(buffer, safePath) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safePath}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'audio/mpeg', 'x-upsert': 'true' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`upload ${safePath} -> ${res.status} ${await res.text()}`);
}

async function remoteExists(safePath) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/info/public/${BUCKET}/${safePath}`);
  if (!res.ok) return false;
  const info = await res.json().catch(() => null);
  return !!(info && info.size > 10240);
}

async function ensureLectureJSON(baseId) {
  const local = path.join(JSON_DIR, `${baseId}.json`);
  if (fs.existsSync(local)) return JSON.parse(fs.readFileSync(local, 'utf8'));
  const safe = getSafePath(`premium_lectures/${baseId}.json`);
  const res = await fetch(`${PUBLIC_PREFIX}/${safe}`);
  if (!res.ok) return null;
  const json = await res.json();
  fs.writeFileSync(local, JSON.stringify(json, null, 2));
  console.log(`  ⬇️  pulled lecture JSON for ${baseId}`);
  return json;
}

async function generatePerStep(steps, baseId, pool, force) {
  const safeFolder = getSafePath(`audio/premium_lectures/${baseId}`);
  const dir = path.join(LOCAL_DIR, baseId);
  fs.mkdirSync(dir, { recursive: true });
  for (const step of steps) {
    if (!step.narration) continue;
    const safePath = `${safeFolder}/step_${step.step}.mp3`;
    if (!force && (await remoteExists(safePath))) { console.log(`    step ${step.step}: skip`); continue; }
    const pcm = await generatePCM(cleanNarration(step.narration), pool);
    const mp3 = pcmToMp3(pcm, path.join(dir, `step_${step.step}.mp3`));
    await uploadMp3(mp3, safePath);
    console.log(`    step ${step.step}: ✅ uploaded ${safePath}`);
    await new Promise((r) => setTimeout(r, 8500));
  }
}

async function generateSingleCall(steps, baseId, pool) {
  const voiced = steps.filter((s) => s.narration);
  const dir = path.join(LOCAL_DIR, baseId);
  fs.mkdirSync(dir, { recursive: true });
  const safeFolder = getSafePath(`audio/premium_lectures/${baseId}`);
  const joined = voiced.map((s) => cleanNarration(s.narration)).join(PAUSE_MARKER);
  if (joined.length > MAX_CHARS_SINGLE_CALL) return false;

  const pcm = await generatePCM(joined, pool);
  const segs = splitBySilence(pcm, voiced.length, dir);
  if (!segs) { console.log('    single-call split mismatch -> per-step fallback'); return false; }

  // Cut each segment out of the wav and upload.
  const wav = path.join(dir, 'full_keep.wav');
  fs.writeFileSync(path.join(dir, 'full_keep.pcm'), pcm);
  execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${path.join(dir, 'full_keep.pcm')}" "${wav}"`, { stdio: 'pipe' });
  for (let i = 0; i < voiced.length; i++) {
    const step = voiced[i];
    const out = path.join(dir, `step_${step.step}.mp3`);
    const { start, end } = segs[i];
    execSync(`ffmpeg -y -i "${wav}" -ss ${start.toFixed(2)} -to ${end.toFixed(2)} -codec:a libmp3lame -qscale:a 2 "${out}"`, { stdio: 'pipe' });
    await uploadMp3(fs.readFileSync(out), `${safeFolder}/step_${step.step}.mp3`);
    console.log(`    step ${step.step}: ✅ (single-call seg ${i + 1}/${voiced.length})`);
  }
  try { fs.unlinkSync(wav); fs.unlinkSync(path.join(dir, 'full_keep.pcm')); } catch (e) {}
  return true;
}

async function main() {
  const argv = process.argv;
  const force = argv.includes('--force');
  const perStepOnly = argv.includes('--per-step');
  const lectArg = argv.indexOf('--lecture') !== -1 ? argv[argv.indexOf('--lecture') + 1] : null;
  const limit = argv.indexOf('--limit') !== -1 ? parseInt(argv[argv.indexOf('--limit') + 1], 10) : 0;

  const report = JSON.parse(fs.readFileSync(path.join('scripts', 'premium_tts_audit_report.json'), 'utf8'));
  let targets = report.report.filter((r) => r.status === 'GAP' || (force && r.status === 'COMPLETE'));
  if (lectArg) targets = targets.filter((r) => r.baseId.includes(lectArg));
  if (limit > 0) targets = targets.slice(0, limit);

  console.log(`🎙️ Generating for ${targets.length} lecture(s).`);
  const pool = makeKeyPool(POOL_EXTRA);

  for (const t of targets) {
    console.log(`\n>>> ${t.baseId}`);
    const json = await ensureLectureJSON(t.baseId);
    if (!json || !Array.isArray(json.steps)) { console.log('  no JSON, skip'); continue; }
    try {
      let done = false;
      if (!perStepOnly && !force) done = await generateSingleCall(json.steps, t.baseId, pool);
      if (!done) await generatePerStep(json.steps, t.baseId, pool, force);
    } catch (e) { console.error(`  ❌ ${t.baseId}: ${e.message}`); }
    await new Promise((r) => setTimeout(r, 8500));
  }
  console.log('\n🎉 Done. Re-run the audit to confirm 0 gaps.');
}
main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Sanity-check it loads**

Run: `node -e "require('./scripts/generate_premium_gemini_tts.cjs')" --help 2>&1 | head -3` is not
applicable (it runs main). Instead verify syntax only:
Run: `node --check scripts/generate_premium_gemini_tts.cjs`
Expected: no output, exit 0.

- [ ] **Step 3: Single-lecture dry run (evidence)**

Pick one GAP lecture from the audit (e.g. `직선의방정식`).
Run: `node scripts/generate_premium_gemini_tts.cjs --lecture 직선의방정식 --limit 1`
Expected: pulls JSON, generates audio (single-call or per-step fallback logged), uploads,
`✅` lines. Then verify one file:
```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/audio/premium_lectures/line_eq/step_1.mp3"
```
Expected: `200`.

- [ ] **Step 4: Commit the generator**

```bash
git add scripts/generate_premium_gemini_tts.cjs
git commit -m "feat: rewrite premium TTS generator with single-call synthesis + gate"
```

---

## Task 10: Run full gap generation + re-audit to zero

**Files:** none (operational).

- [ ] **Step 1: Generate all gaps**

Run: `node scripts/generate_premium_gemini_tts.cjs`
Expected: iterates every GAP lecture; `✅` per step; ends with the done message. (This is
long — many lectures × steps with 8.5s spacing. Let it run; watch for repeated `❌` which
indicate quota exhaustion → rotate/refresh `VITE_GEMINI_API_KEY`.)

- [ ] **Step 2: Re-run the audit**

Run: `node scripts/audit_premium_tts.cjs`
Expected: GAP count = 0 for all lectures that had JSON. Any remaining `NO_JSON` lectures
are reported as "원본 누락" (cannot generate without source) — list them for the user.

- [ ] **Step 3: Commit refreshed report**

```bash
git add -f scripts/premium_tts_audit_report.json
git commit -m "chore: refresh premium TTS audit report (post-generation, 0 gaps)"
```

---

## Task 11: Final verification + PR

**Files:** none (verification).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests pass (premiumLectureMap, premiumAudioPath, ttsConfig).

- [ ] **Step 2: Build**

Run: `npx vite build`
Expected: exit 0, 0 errors.

- [ ] **Step 3: Runtime spot-check (evidence)**

Run `npm run dev`; open 2-3 previously-broken lectures (e.g. 직선의방정식, 미적분_정적분)
and confirm real voice plays, no robotic fallback, "준비 중" only on genuine NO_JSON cases.

- [ ] **Step 4: Confirm `.env` never committed**

Run: `git log --all --name-only | grep -c "^\.env$" || echo 0`
Expected: `0`.

- [ ] **Step 5: Push + PR**

```bash
git push -u origin feature/mathmentos_premium_tts
gh pr create --base main --title "Premium lecture TTS: coverage + voice consistency" \
  --body "Fixes audio path mismatch, unifies baseId/path/TTS config, adds coverage audit, fills gaps via single-call synthesis, removes robotic fallback. See docs/superpowers/specs/2026-06-01-premium-tts-design.md."
```

- [ ] **Step 6: Remind the user to rotate the Supabase service_role key** (exposed in chat).

---

## Self-Review Notes

- **Spec coverage:** §1.1 path bug → Tasks 3,4; §1.2 coverage/orphans → Task 8 audit, Task 10 fill; §1.3 drift → Task 9 single-call; §1.4 dup mapping → Task 2; §3 SSOT modules → Tasks 2,3,6,7; §5 single-call+gate → Task 9; §6 fallback → Task 5; §7 JSON restore → Task 9 `ensureLectureJSON`; §9 tests → Tasks 2,3,6,11.
- **Type consistency:** `toBaseId` (Tasks 2,4), `audioRelPath` (Tasks 3,4), `cleanNarration`/`MODEL`/`VOICE`/`buildPrompt`/`SPEECH_CONFIG` (Tasks 6,7,9), `makeKeyPool`/`generatePCM` (Tasks 7,9), `getSafePath` (existing, Tasks 3,8,9) — names consistent across tasks.
- **Known caveat:** `splitBySilence` thresholds (`-40dB`, `0.9s`) may need tuning per voice; the count-mismatch gate routes to per-step automatically, so correctness is preserved even if tuning is imperfect.
