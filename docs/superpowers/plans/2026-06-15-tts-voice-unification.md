# TTS 음색 통일 구현 계획 (수학 상/하/수1/수2 → Gemini 3.1 + Aoede)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수학 상/하/수1/수2의 모든 TTS 음성을 단일 음색(`gemini-3.1-flash-tts-preview` + `Aoede`)으로 통일하고, 음색이 다시 갈라지지 못하도록 SSOT로 강제한다.

**Architecture:** (1) 모델/보이스를 단일 SSOT 모듈로 추출해 모든 생성기·런타임이 참조 → (2) manifest 기반 감사로 3.1로 확정되지 않은 클립만 식별 → (3) 일일 할당량(~100/일) 안에서 대기·재개하며 타깃 클립만 재생성. OpenAI/ChatGPT API는 전면 제거하고, 런타임 실패 시 무음+공지로만 degrade한다.

**Tech Stack:** Node CJS 스크립트(`scripts/`), React 19 + Vite(순수 JS), Supabase Storage(`mentos-assets`·`math-tts`), Gemini `generateContent` API, ffmpeg(libmp3lame), vitest(jsdom).

**스펙:** `docs/superpowers/specs/2026-06-15-tts-voice-unification-design.md`
**브랜치:** `feat/tts-voice-unification` (이미 생성됨)

---

## 파일 구조 (생성/수정 대상과 책임)

**신규 생성**
- `scripts/lib/ttsVoice.cjs` — Node 생성기용 SSOT. `TTS_MODEL`, `TTS_VOICE`, `SYSTEM_INSTRUCTION` 상수 export. 단일 진실 공급원.
- `scripts/lib/ttsVoice.test.mjs` — SSOT 상수 검증.
- `src/config/ttsVoice.js` — 브라우저 런타임용 미러(상수만, 시크릿 없음).
- `src/config/ttsVoice.test.js` — 미러 상수 검증 + Node SSOT와 값 일치 확인.
- `scripts/lib/ttsAudit.cjs` — 감사 순수 로직(분류 함수). 부수효과 없음 → 단위 테스트 대상.
- `scripts/lib/ttsAudit.test.mjs` — 분류 로직 단위 테스트.
- `scripts/audit_tts_voice.cjs` — 감사 CLI(인벤토리 수집 + `ttsAudit.cjs` 호출 + worklist/요약 출력).
- `scripts/lib/regenQuota.cjs` — 할당량 카운터/재개 순수 로직 → 단위 테스트 대상.
- `scripts/lib/regenQuota.test.mjs` — 할당량/재개 로직 단위 테스트.
- `scripts/regen_tts_from_worklist.cjs` — 재생성 오케스트레이터(worklist → 스테이지 그룹 → 기존 생성기 force-regen, 할당량 대기/재개).

**수정**
- `scripts/generate_su1_tts.cjs` — 로컬 `TTS_MODEL`/`TTS_VOICE` 상수를 SSOT import로 교체(동작 불변). force-regen 옵션 추가.
- `scripts/generate_gemini_math_sang_tts.cjs` — 동일(동작 불변) + force-regen 옵션.
- `scripts/generate_gemini_math_su1_tts.cjs` — 모델/보이스 SSOT 참조로 교체(동작 불변).
- `scripts/generate_gemini_gocha_tts.cjs` — 인라인 `gemini-2.5-flash-preview-tts` → SSOT 3.1로 교체. 상단에 deprecation 주석.
- `scripts/bulk_generate_tts.cjs` — 인라인 `gemini-2.5-flash-preview-tts` → SSOT 3.1로 교체. 상단에 deprecation 주석.
- `src/services/ttsService.js` — 런타임 Gemini 호출 2.5→3.1+Aoede(SSOT), OpenAI `tts-1` 블록 제거, `_browserFallback` 제거, 실패/할당량 시 `onError`만 호출(무음).
- `src/services/ttsService.test.js` — 신규(같은 폴더): 3.1 호출·OpenAI 미호출·실패 시 무음+onError 검증.
- `src/components/hints/GeometryHintPlayer.jsx` — `onError`에서 "음성 일시 사용 불가" 공지 상태 set.
- `src/pages/MentosMockExam.jsx` — 동일.
- `src/pages/NaesinCourse.jsx` — 동일.
- `src/components/WhiteFocusMode.jsx` — `speakText` 호출에 `onError` 추가 + 공지.
- `src/pages/LocalInspector.jsx` — dev 도구. `onError` 공지(콘솔/인라인) 추가.

---

## 사전 메모(구현자 필독)

- **manifest 키 공간**: `scripts/tts_manifest.json`의 키는 **`math-tts` 버킷의 remotePath**(`{ttsDir}/{NNN}.mp3`, 예: `complex_s3/015.mp3`)이며, 값은 `{engine, model, voice, bytes, generatedAt}`. 현재 985개 전부 `gemini-3.1-flash-tts-preview`/`Aoede`. **로컬 `public/audio/math_hints/hint_*.mp3` 파일명과는 키 공간이 다르다.**
- **provenance 규칙**: 2.5와 3.1은 동일 ffmpeg 재인코딩(libmp3lame VBR)을 거쳐 **바이트 헤더로 구분 불가**. 따라서 "3.1 확정"의 유일한 근거는 **manifest 존재 여부**다(`scripts/lib/tts_engine_classifier.cjs`는 gemini/openai만 구분).
- **idempotent**: 이미 3.1인 클립을 3.1로 다시 렌더해도 음색 동일(데이터 무해, 할당량만 소모). 따라서 suspect를 다소 과다 포함해도 안전.
- **할당량**: `gemini-3.1-flash-tts-preview` ≈ 100클립/일/프로젝트, 09:00 KST 리셋. 소진 시 **대기 후 재개**(다른 모델/제공자 대체 금지).
- **OpenAI/ChatGPT 전면 금지**: 배치·런타임 어디에도 `openai`/`api.openai.com`/`tts-1` 사용 금지.

---

## Phase 0 — 베이스라인

### Task 0: 브랜치·베이스라인 테스트 확인

**Files:** (없음 — 확인만)

- [ ] **Step 1: 브랜치 확인**

Run: `cd /Users/mac/mathmentos && git branch --show-current`
Expected: `feat/tts-voice-unification`

- [ ] **Step 2: 기존 테스트 통과(녹색 베이스라인) 확인**

Run: `cd /Users/mac/mathmentos && npm test 2>&1 | tail -20`
Expected: 모든 테스트 PASS(131+). 실패가 있으면 기록해 두고(기존 실패), 본 작업과 무관함을 명시.

---

## Phase 1 — 코드 SSOT (할당량 불필요)

### Task 1: Node SSOT 모듈 `scripts/lib/ttsVoice.cjs`

**Files:**
- Create: `scripts/lib/ttsVoice.cjs`
- Test: `scripts/lib/ttsVoice.test.mjs`

- [ ] **Step 1: 실패 테스트 작성**

`scripts/lib/ttsVoice.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import ttsVoice from './ttsVoice.cjs';

describe('ttsVoice SSOT', () => {
  it('canonical 모델/보이스를 노출한다', () => {
    expect(ttsVoice.TTS_MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(ttsVoice.TTS_VOICE).toBe('Aoede');
  });
  it('낭독 전용 시스템 지침을 노출한다', () => {
    expect(typeof ttsVoice.SYSTEM_INSTRUCTION).toBe('string');
    expect(ttsVoice.SYSTEM_INSTRUCTION.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsVoice.test.mjs`
Expected: FAIL ("Cannot find module './ttsVoice.cjs'").

- [ ] **Step 3: 모듈 구현**

`scripts/lib/ttsVoice.cjs`:
```js
'use strict';

// [SSOT] 모든 TTS 생성기의 단일 모델/보이스 공급원.
// 변경 금지 규칙: 음색 일관성을 위해 반드시 gemini-3.1-flash-tts-preview + Aoede.
// 다른 모델(2.5 등)은 같은 Aoede라도 음색이 달라 혼재되므로 금지.

const TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const TTS_VOICE = 'Aoede';

const SYSTEM_INSTRUCTION =
  '너는 수학 학습을 돕는 친절하고 활기찬 여자 대학생 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 자연스러운 한국어 구어로 낭독해줘. 절대로 인사말이나 해설, 추가 설명, 잡담을 덧붙이지 말고, 오직 주어진 텍스트 자체만 있는 그대로 읽어줘. 수식은 한국어 수학 읽기 표준에 맞춰 자연스럽게 읽어줘.';

module.exports = { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsVoice.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/ttsVoice.cjs scripts/lib/ttsVoice.test.mjs
git commit -m "feat(tts): add Node SSOT module for model/voice"
```

---

### Task 2: 브라우저 SSOT 미러 `src/config/ttsVoice.js`

**Files:**
- Create: `src/config/ttsVoice.js`
- Test: `src/config/ttsVoice.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`src/config/ttsVoice.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION } from './ttsVoice.js';

describe('ttsVoice 브라우저 미러', () => {
  it('canonical 모델/보이스를 노출한다', () => {
    expect(TTS_MODEL).toBe('gemini-3.1-flash-tts-preview');
    expect(TTS_VOICE).toBe('Aoede');
  });
  it('시스템 지침 문자열을 노출한다', () => {
    expect(typeof SYSTEM_INSTRUCTION).toBe('string');
    expect(SYSTEM_INSTRUCTION.length).toBeGreaterThan(10);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run src/config/ttsVoice.test.js`
Expected: FAIL ("Failed to resolve import './ttsVoice.js'").

- [ ] **Step 3: 모듈 구현**

`src/config/ttsVoice.js`:
```js
// [SSOT] 브라우저 런타임 TTS의 모델/보이스 미러.
// Node 측 SSOT(scripts/lib/ttsVoice.cjs)와 값이 항상 일치해야 한다.
export const TTS_MODEL = 'gemini-3.1-flash-tts-preview';
export const TTS_VOICE = 'Aoede';
export const SYSTEM_INSTRUCTION =
  '너는 수학 학습을 돕는 친절하고 활기찬 여자 대학생 선생님이야. 입력받은 한국어 수학 텍스트(수식 포함)를 자연스러운 한국어 구어로 낭독해줘. 절대로 인사말이나 해설, 추가 설명, 잡담을 덧붙이지 말고, 오직 주어진 텍스트 자체만 있는 그대로 읽어줘. 수식은 한국어 수학 읽기 표준에 맞춰 자연스럽게 읽어줘.';
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run src/config/ttsVoice.test.js`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add src/config/ttsVoice.js src/config/ttsVoice.test.js
git commit -m "feat(tts): add browser SSOT mirror for model/voice"
```

---

### Task 3: 정상 3.1 생성기들을 SSOT로 리포인트 (동작 불변)

대상: `generate_su1_tts.cjs`(상수 46-47), `generate_gemini_math_sang_tts.cjs`(상수 27-28), `generate_gemini_math_su1_tts.cjs`(인라인 문자열). 이미 3.1이므로 **출력은 동일**, 중복 상수만 SSOT로 일원화한다.

**Files:**
- Modify: `scripts/generate_su1_tts.cjs`
- Modify: `scripts/generate_gemini_math_sang_tts.cjs`
- Modify: `scripts/generate_gemini_math_su1_tts.cjs`

- [ ] **Step 1: `generate_su1_tts.cjs` 수정**

기존(46-47행 부근):
```js
const TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const TTS_VOICE = 'Aoede';
```
교체:
```js
const { TTS_MODEL, TTS_VOICE } = require('./lib/ttsVoice.cjs');
```
(파일 상단 `require` 블록 근처로 옮겨도 무방. `TTS_MODEL`/`TTS_VOICE` 사용처는 그대로 둔다.)

- [ ] **Step 2: `generate_gemini_math_sang_tts.cjs` 수정**

27-28행 부근의 로컬 `const TTS_MODEL = ...` / `const TTS_VOICE = ...`를 동일하게 SSOT import로 교체:
```js
const { TTS_MODEL, TTS_VOICE } = require('./lib/ttsVoice.cjs');
```

- [ ] **Step 3: `generate_gemini_math_su1_tts.cjs` 수정**

이 파일은 모델/보이스가 인라인 문자열이다. 파일 상단에 import 추가:
```js
const { TTS_MODEL, TTS_VOICE } = require('./lib/ttsVoice.cjs');
```
그리고 본문의 URL/voice 인라인을 SSOT로 교체:
- `.../models/gemini-3.1-flash-tts-preview:generateContent` → `.../models/${TTS_MODEL}:generateContent`
- `prebuiltVoiceConfig: { voiceName: "Aoede" }` → `prebuiltVoiceConfig: { voiceName: TTS_VOICE }`

Run(검색으로 잔여 인라인 확인): `cd /Users/mac/mathmentos && grep -nE "gemini-3.1-flash-tts-preview|voiceName: ?\"Aoede\"" scripts/generate_gemini_math_su1_tts.cjs`
Expected: 위 3개 파일에서 인라인 모델/보이스 문자열이 더 이상 남지 않음(템플릿 변수만).

- [ ] **Step 4: 구문 무결성 확인(실행하지 않고 파싱만)**

Run: `cd /Users/mac/mathmentos && for f in generate_su1_tts generate_gemini_math_sang_tts generate_gemini_math_su1_tts; do node --check scripts/$f.cjs && echo "OK $f"; done`
Expected: `OK ...` 3줄(구문 오류 없음).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/generate_su1_tts.cjs scripts/generate_gemini_math_sang_tts.cjs scripts/generate_gemini_math_su1_tts.cjs
git commit -m "refactor(tts): point 3.1 generators at SSOT module (no behavior change)"
```

---

### Task 4: 2.5 생성기들을 3.1 SSOT로 전환 + deprecation

대상: `generate_gemini_gocha_tts.cjs`(인라인 2.5, 94/110행), `bulk_generate_tts.cjs`(인라인 2.5, 120/129행).

**Files:**
- Modify: `scripts/generate_gemini_gocha_tts.cjs`
- Modify: `scripts/bulk_generate_tts.cjs`

- [ ] **Step 1: `generate_gemini_gocha_tts.cjs` 수정**

파일 상단에 import + deprecation 주석 추가:
```js
// [DEPRECATED] 신규 생성은 generate_gemini_math_sang_tts.cjs / generate_su1_tts.cjs 사용.
// 이 스크립트는 SSOT(gemini-3.1-flash-tts-preview + Aoede)로만 동작하도록 고정됨.
const { TTS_MODEL, TTS_VOICE } = require('./lib/ttsVoice.cjs');
```
본문 교체:
- `.../models/gemini-2.5-flash-preview-tts:generateContent` → `.../models/${TTS_MODEL}:generateContent`
- `voiceName: "Aoede"` → `voiceName: TTS_VOICE`

- [ ] **Step 2: `bulk_generate_tts.cjs` 수정**

동일 패턴: 상단 import + deprecation 주석, 본문 `gemini-2.5-flash-preview-tts` → `${TTS_MODEL}`, `voiceName: "Aoede"` → `voiceName: TTS_VOICE`.

- [ ] **Step 3: 2.5 잔여 참조 0 확인(가드)**

Run: `cd /Users/mac/mathmentos && grep -rn "gemini-2.5-flash-preview-tts" scripts/ src/`
Expected: **출력 없음**(exit 1). 남아 있으면 해당 파일도 교체.

- [ ] **Step 4: 구문 무결성 확인**

Run: `cd /Users/mac/mathmentos && node --check scripts/generate_gemini_gocha_tts.cjs && node --check scripts/bulk_generate_tts.cjs && echo OK`
Expected: `OK`.

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/generate_gemini_gocha_tts.cjs scripts/bulk_generate_tts.cjs
git commit -m "fix(tts): switch 2.5 generators to 3.1 SSOT + mark deprecated"
```

---

### Task 5: 런타임 `ttsService.js` — 3.1 전용, OpenAI/브라우저 폴백 제거, 실패 시 무음

**Files:**
- Modify: `src/services/ttsService.js`
- Test: `src/services/ttsService.test.js` (Create)

- [ ] **Step 1: 실패 테스트 작성**

`src/services/ttsService.test.js`:
```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// import.meta.env 모킹
vi.stubGlobal('import', undefined); // noop guard; vitest는 import.meta.env를 자체 제공
beforeEach(() => {
  vi.unstubAllGlobals();
  global.fetch = vi.fn();
  // Gemini 키 존재하도록
  import.meta.env.VITE_GEMINI_API_KEY = 'test-key';
  // Audio 모킹(jsdom)
  global.Audio = vi.fn(() => ({ play: vi.fn().mockResolvedValue(), pause: vi.fn(), set src(v){}, get src(){return ''}, onended:null, onerror:null, currentTime:0 }));
  global.URL.createObjectURL = vi.fn(() => 'blob:x');
  global.URL.revokeObjectURL = vi.fn();
});

describe('speakText 런타임', () => {
  it('Gemini 3.1 모델 엔드포인트로 호출한다', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{ content: { parts: [{ inlineData: { data: btoa('x'), mimeType: 'audio/mp3' } }] } }] }),
    });
    const { speakText } = await import('./ttsService.js');
    await speakText('이차방정식을 풀어봅시다', { isReplay: true });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('gemini-3.1-flash-tts-preview:generateContent');
  });

  it('OpenAI(api.openai.com / tts-1)를 절대 호출하지 않는다', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429, json: async () => ({ error: { message: 'quota' } }) });
    const onError = vi.fn();
    const { speakText } = await import('./ttsService.js');
    await speakText('테스트', { isReplay: true, onError });
    const calledUrls = global.fetch.mock.calls.map(c => String(c[0]));
    expect(calledUrls.some(u => u.includes('openai') || u.includes('tts-1'))).toBe(false);
    expect(onError).toHaveBeenCalled(); // 실패 시 무음 + onError
  });
});
```
(참고: vitest는 `import.meta.env`에 직접 할당 가능. 위 `vi.stubGlobal('import', ...)` 줄이 환경에서 문제가 되면 삭제하고 `import.meta.env.VITE_GEMINI_API_KEY` 할당만 유지.)

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run src/services/ttsService.test.js`
Expected: FAIL — 현재 코드는 2.5 엔드포인트를 호출하고, 실패 시 OpenAI로 폴백하므로 두 테스트 모두 실패.

- [ ] **Step 3: `ttsService.js` 수정**

3-1. 상단 import 추가:
```js
import { TTS_MODEL, TTS_VOICE, SYSTEM_INSTRUCTION } from '@/config/ttsVoice.js';
```
3-2. `speakText` 내부 Gemini fetch URL을 SSOT 모델로:
```js
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${geminiApiKey}`, {
```
3-3. systemInstruction/voiceName을 SSOT로:
```js
systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
```
```js
prebuiltVoiceConfig: { voiceName: TTS_VOICE }
```
3-4. **OpenAI 폴백 블록 전체 삭제**(현재 143-167행의 `if (!blob) { ... OpenAI ... }`). Gemini가 blob을 못 만들면 throw 하도록:
```js
      } catch (geminiError) {
        console.warn('[TTS] Gemini 3.1 실패:', geminiError.message);
        throw geminiError; // 폴백 없음 — catch에서 무음 처리
      }
    } else {
      throw new Error('Gemini API key 없음 — 음성 생성 불가');
    }

    // blob이 없으면 진행 불가
    if (!blob) throw new Error('오디오 생성 실패');
```
3-5. catch 블록에서 `_browserFallback` 제거, 무음 + onError만:
```js
  } catch (e) {
    console.error('[TTS] speakText 실패(무음 처리):', e);
    isAudioPlaying = false;
    onError?.(e);
  }
```
3-6. 더 이상 쓰지 않는 코드 정리(본 변경이 만든 orphan만): `_browserFallback` 함수, `API_KEY`/`BASE_URL`(OpenAI), `VOICE_MAP`의 OpenAI 보이스 의존. 단 `getVoiceForTeacher`는 `WhiteFocusMode`가 import하므로 **시그니처 유지**: 내부를 무해한 no-op 반환으로 단순화한다(보이스는 항상 Aoede이므로 인자는 무시):
```js
// 보이스는 항상 SSOT(Aoede). 호환을 위해 시그니처만 유지.
export const getVoiceForTeacher = () => TTS_VOICE;
```
`VOICE_MAP`과 OpenAI용 `API_KEY`/`BASE_URL`은 다른 참조가 없으면 삭제. (삭제 전 `grep -rn "VOICE_MAP\|getVoiceForTeacher\|filterTtsContent" src/`로 외부 참조 확인.)

- [ ] **Step 4: 통과 확인 + OpenAI 잔여 0 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run src/services/ttsService.test.js`
Expected: PASS (2 tests).

Run: `cd /Users/mac/mathmentos && grep -nEi "openai|api\.openai\.com|tts-1|_browserFallback|speechSynthesis" src/services/ttsService.js`
Expected: `stopSpeaking`의 `window.speechSynthesis?.cancel()`(정리용)만 남고, 폴백 음성 생성 경로는 없음. OpenAI/tts-1 0건.

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add src/services/ttsService.js src/services/ttsService.test.js
git commit -m "fix(tts): runtime uses 3.1+Aoede only, remove OpenAI/browser fallback (silent on fail)"
```

---

### Task 6: 컴포넌트 — 실패 시 "음성 일시 사용 불가" 공지

각 컴포넌트의 `onError` 콜백에 사용자 공지를 추가한다. 공통 패턴: 로컬 상태 `ttsError`(2초 후 자동 해제) + 인라인 텍스트.

**Files:**
- Modify: `src/components/hints/GeometryHintPlayer.jsx`
- Modify: `src/pages/MentosMockExam.jsx`
- Modify: `src/pages/NaesinCourse.jsx`
- Modify: `src/components/WhiteFocusMode.jsx`
- Modify: `src/pages/LocalInspector.jsx`

- [ ] **Step 1: `GeometryHintPlayer.jsx`**

상태 추가(컴포넌트 상단 useState 모음 근처):
```jsx
const [ttsUnavailable, setTtsUnavailable] = useState(false);
```
기존 `onError: () => setTtsPlaying(false)` (≈641행)를:
```jsx
onError: () => {
  setTtsPlaying(false);
  setTtsUnavailable(true);
  setTimeout(() => setTtsUnavailable(false), 2500);
},
```
버튼 근처(≈649행, `음성(Gemini)` 버튼 옆)에 공지 추가:
```jsx
{ttsUnavailable && (
  <span className="text-xs text-gray-400 ml-2">음성 일시 사용 불가</span>
)}
```

- [ ] **Step 2: `MentosMockExam.jsx`**

상태 추가:
```jsx
const [ttsUnavailable, setTtsUnavailable] = useState(false);
```
기존 `onError: () => setPlayingAudioId(null)` (≈655행)를:
```jsx
onError: () => {
  setPlayingAudioId(null);
  setTtsUnavailable(true);
  setTimeout(() => setTtsUnavailable(false), 2500);
},
```
"해설 음성 듣는 중..." 표시(≈1050행) 인접 위치에 공지 추가:
```jsx
{ttsUnavailable && <span className="text-xs text-gray-400">음성 일시 사용 불가</span>}
```

- [ ] **Step 3: `NaesinCourse.jsx`**

상태 추가:
```jsx
const [ttsUnavailable, setTtsUnavailable] = useState(false);
```
기존(≈53행)를:
```jsx
speakText(cleanForSpeech(narration), {
  onEnd: () => setSpeaking(false),
  onError: () => {
    setSpeaking(false);
    setTtsUnavailable(true);
    setTimeout(() => setTtsUnavailable(false), 2500);
  },
});
```
재생 버튼 인접에 `{ttsUnavailable && <span className="text-xs text-gray-400">음성 일시 사용 불가</span>}` 추가.

- [ ] **Step 4: `WhiteFocusMode.jsx`**

상태 추가:
```jsx
const [ttsUnavailable, setTtsUnavailable] = useState(false);
```
두 `speakText(text, { voice: getVoiceForTeacher(teacher), subject });` 호출(≈40,43행)에 `onError` 추가:
```jsx
speakText(text, {
  voice: getVoiceForTeacher(teacher),
  subject,
  onError: () => { setTtsUnavailable(true); setTimeout(() => setTtsUnavailable(false), 2500); },
});
```
"AI 음성 듣기" 영역(≈145행)에 `{ttsUnavailable && <span className="text-xs text-gray-400">음성 일시 사용 불가</span>}` 추가.

- [ ] **Step 5: `LocalInspector.jsx`** (dev 도구)

`await speakText(testText, { ... })`(≈241행)의 옵션에 `onError: (e) => console.warn('[Inspector] TTS 사용 불가:', e?.message)` 추가. (UI 공지는 선택 — dev 도구이므로 콘솔로 충분.)

- [ ] **Step 6: 빌드로 무결성 확인**

Run: `cd /Users/mac/mathmentos && npm run build 2>&1 | tail -15`
Expected: 빌드 성공(exit 0, 0 errors).

- [ ] **Step 7: 커밋**

```bash
cd /Users/mac/mathmentos
git add src/components/hints/GeometryHintPlayer.jsx src/pages/MentosMockExam.jsx src/pages/NaesinCourse.jsx src/components/WhiteFocusMode.jsx src/pages/LocalInspector.jsx
git commit -m "feat(tts): show '음성 일시 사용 불가' notice when runtime TTS fails"
```

---

### Task 7: Phase 1 통합 검증 게이트

**Files:** (없음 — 검증만)

- [ ] **Step 1: 음색 가드(2.5/OpenAI 0건)**

Run:
```bash
cd /Users/mac/mathmentos
echo "== 2.5 ==" ; grep -rn "gemini-2.5-flash-preview-tts" scripts/ src/ ; \
echo "== openai/tts-1 ==" ; grep -rnEi "api\.openai\.com|'tts-1'|\"tts-1\"" scripts/ src/services/ttsService.js
```
Expected: 두 검색 모두 **출력 없음**.

- [ ] **Step 2: 전체 테스트**

Run: `cd /Users/mac/mathmentos && npm test 2>&1 | tail -20`
Expected: 모든 테스트 PASS(Task 0 베이스라인 + 신규 테스트 포함).

- [ ] **Step 3: 빌드**

Run: `cd /Users/mac/mathmentos && npm run build 2>&1 | tail -5`
Expected: exit 0.

*(Phase 1은 여기서 PR 가능. Phase 2~3는 후속.)*

---

## Phase 2 — 감사 (할당량 불필요)

### Task 8: 감사 진단 모드 — 키 공간 실측

manifest 키(`{ttsDir}/{NNN}.mp3`)와 Supabase `math-tts` 실제 목록, 로컬 `public/audio/math_hints` 목록을 덤프해 **역매핑 규칙을 확정**한다. (스펙 §11의 미해결 항목 해소.)

**Files:**
- Create: `scripts/audit_tts_voice.cjs` (1차: 진단 모드)

- [ ] **Step 1: 진단 스크립트 작성**

`scripts/audit_tts_voice.cjs` (진단 모드 `--diagnose`):
```js
'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join('scripts', 'tts_manifest.json');
const LOCAL_DIR = path.join('public', 'audio', 'math_hints');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TTS_BUCKET = 'math-tts';

async function listBucket(prefix = '') {
  // Supabase Storage list API (재귀 1depth). 폴더별로 NNN.mp3 수집.
  const out = [];
  const url = `${SUPABASE_URL}/storage/v1/object/list/${TTS_BUCKET}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, sortBy: { column: 'name', order: 'asc' } }),
  });
  if (!res.ok) throw new Error(`list ${prefix} HTTP ${res.status}`);
  const items = await res.json();
  for (const it of items) {
    if (it.id === null || it.metadata == null) {
      // 폴더 → 재귀
      out.push(...await listBucket(prefix ? `${prefix}/${it.name}` : it.name));
    } else {
      out.push(prefix ? `${prefix}/${it.name}` : it.name);
    }
  }
  return out;
}

(async () => {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestKeys = Object.keys(manifest);
  const localFiles = fs.existsSync(LOCAL_DIR) ? fs.readdirSync(LOCAL_DIR).filter(f => f.endsWith('.mp3')) : [];
  const bucketKeys = await listBucket('');

  console.log('manifest keys:', manifestKeys.length);
  console.log('  sample:', manifestKeys.slice(0, 5));
  console.log('local files:', localFiles.length);
  console.log('  sample:', localFiles.slice(0, 5));
  console.log('math-tts bucket objects:', bucketKeys.length);
  console.log('  sample:', bucketKeys.slice(0, 5));
  // bucket ∖ manifest = suspect 후보(3.1로 기록 안 된 클립)
  const manifestSet = new Set(manifestKeys);
  const bucketSuspect = bucketKeys.filter(k => !manifestSet.has(k));
  console.log('bucket objects NOT in manifest (suspect 후보):', bucketSuspect.length);
  console.log('  sample:', bucketSuspect.slice(0, 20));
  fs.writeFileSync('scripts/tts_audit_diagnose.json',
    JSON.stringify({ manifestKeys, localFiles, bucketKeys, bucketSuspect }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: 진단 실행**

Run: `cd /Users/mac/mathmentos && node scripts/audit_tts_voice.cjs --diagnose 2>&1 | tail -40`
Expected: manifest/local/bucket 키 형식과 샘플, `bucket ∖ manifest` suspect 후보 수 출력. **이 출력으로 (a) 앱이 실제 서빙하는 버킷이 `math-tts`인지 `mentos-assets`인지, (b) 로컬 `hint_*` ↔ `{ttsDir}/{NNN}.mp3` 매핑 규칙을 확정**한다. 결과를 다음 Task의 매핑 테이블 근거로 사용.

- [ ] **Step 3: 진단 산출물 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/audit_tts_voice.cjs
git add -f scripts/tts_audit_diagnose.json
git commit -m "feat(tts): audit diagnose mode — dump manifest/local/bucket key spaces"
```

> **확정 사항(진단 결과로 채움):** ① 서빙 버킷 = ______, ② suspect 식별 기준 = `math-tts` 버킷에서 manifest에 3.1로 없는 객체 + 로컬 `hint_gocha_*`. ③ 로컬↔버킷 매핑 = ______. 이 세 값을 Task 9 분류 로직에 반영한다.

---

### Task 9: 감사 분류 로직 + worklist 산출

**Files:**
- Create: `scripts/lib/ttsAudit.cjs`
- Test: `scripts/lib/ttsAudit.test.mjs`
- Modify: `scripts/audit_tts_voice.cjs` (분류 모드 추가)

- [ ] **Step 1: 분류 순수 로직 실패 테스트**

`scripts/lib/ttsAudit.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import audit from './ttsAudit.cjs';

describe('classifyClips', () => {
  const manifest = {
    'complex_s3/015.mp3': { model: 'gemini-3.1-flash-tts-preview', voice: 'Aoede' },
  };
  it('manifest에 3.1로 있으면 confirmed', () => {
    const r = audit.classifyClips({ bucketKeys: ['complex_s3/015.mp3'], manifest, knownLegacy: [] });
    expect(r.confirmed).toContain('complex_s3/015.mp3');
    expect(r.suspect).toHaveLength(0);
  });
  it('manifest에 없으면 suspect', () => {
    const r = audit.classifyClips({ bucketKeys: ['higher_eq_s2/001.mp3'], manifest, knownLegacy: [] });
    expect(r.suspect).toContain('higher_eq_s2/001.mp3');
  });
  it('known-legacy(gocha) 패턴은 manifest에 있어도 suspect로 강제', () => {
    const m = { 'higher_eq_s2/001.mp3': { model: 'gemini-3.1-flash-tts-preview', voice: 'Aoede' } };
    const r = audit.classifyClips({ bucketKeys: ['higher_eq_s2/001.mp3'], manifest: m, knownLegacy: ['higher_eq_s2/001.mp3'] });
    expect(r.suspect).toContain('higher_eq_s2/001.mp3');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsAudit.test.mjs`
Expected: FAIL ("Cannot find module './ttsAudit.cjs'").

- [ ] **Step 3: 분류 로직 구현**

`scripts/lib/ttsAudit.cjs`:
```js
'use strict';

// 순수 분류: bucket 객체 키를 confirmed / suspect로 나눈다.
// 규칙: manifest에 3.1로 기록 + known-legacy 아님 → confirmed. 그 외 → suspect.
function classifyClips({ bucketKeys, manifest, knownLegacy = [] }) {
  const legacy = new Set(knownLegacy);
  const confirmed = [];
  const suspect = [];
  for (const key of bucketKeys) {
    const meta = manifest[key];
    const isThreeOne = meta && meta.model === 'gemini-3.1-flash-tts-preview' && meta.voice === 'Aoede';
    if (isThreeOne && !legacy.has(key)) confirmed.push(key);
    else suspect.push(key);
  }
  return { confirmed, suspect };
}

module.exports = { classifyClips };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/ttsAudit.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: `audit_tts_voice.cjs`에 분류 모드 추가**

진단 모드 아래에 기본(분류) 모드를 추가: `listBucket('')`로 bucket 키 수집 → `classifyClips({ bucketKeys, manifest, knownLegacy })` 호출. `knownLegacy`는 진단에서 확정한 gocha 등 레거시 패턴에 해당하는 bucket 키 목록(예: `higher_eq_s2/0NN.mp3` 중 gocha 산출분). suspect 각 항목에 재생성에 필요한 메타(`ttsDir`, `pid`)를 부착해 출력:
```js
const audit = require('./lib/ttsAudit.cjs');
// ... bucketKeys, manifest 준비 후
const knownLegacy = []; // 진단으로 확정한 레거시 키(없으면 빈 배열 — gocha가 manifest에 없으면 자동 suspect)
const { confirmed, suspect } = audit.classifyClips({ bucketKeys, manifest, knownLegacy });
const worklist = {
  generatedAtNote: '카운트는 실행 시점 기준',
  counts: { total: bucketKeys.length, confirmed: confirmed.length, suspect: suspect.length },
  suspect: suspect.map(key => {
    const [ttsDir, file] = key.split('/');
    return { key, ttsDir, pid: file.replace('.mp3', '') };
  }),
};
fs.writeFileSync('scripts/tts_regen_worklist.json', JSON.stringify(worklist, null, 2));
console.log('confirmed:', confirmed.length, 'suspect:', suspect.length);
```

- [ ] **Step 6: 감사 실행 → worklist 생성**

Run: `cd /Users/mac/mathmentos && node scripts/audit_tts_voice.cjs 2>&1 | tail -10`
Expected: `confirmed: N suspect: M` 출력 + `scripts/tts_regen_worklist.json` 생성. **여기서 실제 suspect 수 M이 확정**된다(스펙 §11 해소).

- [ ] **Step 7: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/ttsAudit.cjs scripts/lib/ttsAudit.test.mjs scripts/audit_tts_voice.cjs
git add -f scripts/tts_regen_worklist.json
git commit -m "feat(tts): manifest-based provenance audit → tts_regen_worklist.json"
```

---

## Phase 3 — 재생성 (할당량 제한, 대기·재개)

### Task 10: 할당량/재개 순수 로직 `regenQuota.cjs`

**Files:**
- Create: `scripts/lib/regenQuota.cjs`
- Test: `scripts/lib/regenQuota.test.mjs`

- [ ] **Step 1: 실패 테스트**

`scripts/lib/regenQuota.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import q from './regenQuota.cjs';

describe('할당량/재개 로직', () => {
  it('done에 포함된 항목은 제외하고 남은 작업만 반환', () => {
    const remaining = q.remainingWork(
      [{ key: 'a/001.mp3' }, { key: 'a/002.mp3' }],
      { done: ['a/001.mp3'] }
    );
    expect(remaining.map(r => r.key)).toEqual(['a/002.mp3']);
  });
  it('일일 한도만큼만 배치로 자른다', () => {
    const batch = q.takeBatch([{key:'1'},{key:'2'},{key:'3'}], 2);
    expect(batch).toHaveLength(2);
  });
  it('429/quota 에러를 할당량 소진으로 판정', () => {
    expect(q.isQuotaExhausted({ status: 429 })).toBe(true);
    expect(q.isQuotaExhausted({ message: 'RESOURCE_EXHAUSTED' })).toBe(true);
    expect(q.isQuotaExhausted({ status: 500 })).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/regenQuota.test.mjs`
Expected: FAIL ("Cannot find module './regenQuota.cjs'").

- [ ] **Step 3: 구현**

`scripts/lib/regenQuota.cjs`:
```js
'use strict';

function remainingWork(suspect, progress = { done: [] }) {
  const done = new Set(progress.done || []);
  return suspect.filter(item => !done.has(item.key));
}

function takeBatch(items, limit) {
  return items.slice(0, Math.max(0, limit));
}

function isQuotaExhausted(err) {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = String(err.message || '');
  return /RESOURCE_EXHAUSTED|quota|429/i.test(msg);
}

module.exports = { remainingWork, takeBatch, isQuotaExhausted };
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/mac/mathmentos && npx vitest run scripts/lib/regenQuota.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/lib/regenQuota.cjs scripts/lib/regenQuota.test.mjs
git commit -m "feat(tts): quota/resume pure helpers for regen runner"
```

---

### Task 11: 재생성 오케스트레이터 `regen_tts_from_worklist.cjs`

worklist의 suspect를 **스테이지(ttsDir)별로 그룹화**하고, 각 스테이지에 대해 기존 정상 생성기(`generate_su1_tts.cjs` / `generate_gemini_math_sang_tts.cjs`)를 **force-regen**으로 호출한다. 일일 한도에서 멈추고 진행상태(`scripts/tts_regen_progress.json`)를 저장해 재개한다. 할당량 소진 시 다른 모델 대체 없이 **종료(exit 0)** 후 다음 창에서 재개.

> **전제(Task 11 사전 단계):** 정상 생성기에 force-regen 진입점이 필요하다. 두 생성기 각각에 `--regen <ttsDir> <pid>`(또는 `--regen-keys a/001.mp3,a/002.mp3`) CLI 옵션을 추가하되, 내부 로직은 기존 `processStage`의 단일 클립 경로를 재사용한다(이미 3.1+SSOT). 스테이지↔생성기 매핑(어떤 ttsDir이 어느 생성기 소관인지)은 각 생성기의 `STAGES` 테이블 키로 결정한다.

**Files:**
- Modify: `scripts/generate_su1_tts.cjs` (`--regen-keys` 옵션)
- Modify: `scripts/generate_gemini_math_sang_tts.cjs` (`--regen-keys` 옵션)
- Create: `scripts/regen_tts_from_worklist.cjs`

- [ ] **Step 1: 생성기에 `--regen-keys` 옵션 추가**

각 생성기 `main()`에서 `process.argv`에 `--regen-keys` 가 있으면 콤마 구분 `ttsDir/pid` 목록만 처리하도록 분기. 각 키는 해당 생성기의 `STAGES`에 ttsDir이 존재할 때만 처리(없으면 무시하고 종료코드로 "내 소관 아님"=0). 단일 클립 처리에는 기존 `generateGeminiTTS`+ffmpeg+`uploadToSupabase`+`recordManifest`+로컬 저장 경로를 그대로 사용. 처리한 키는 stdout에 `REGEN_DONE <key>` 한 줄씩 출력(러너가 파싱). 할당량 소진 감지 시 `REGEN_QUOTA_EXHAUSTED`를 출력하고 exit 0.

Run(구문 확인): `cd /Users/mac/mathmentos && node --check scripts/generate_su1_tts.cjs && node --check scripts/generate_gemini_math_sang_tts.cjs && echo OK`
Expected: `OK`.

- [ ] **Step 2: 오케스트레이터 작성**

`scripts/regen_tts_from_worklist.cjs`:
```js
'use strict';
require('dotenv').config();
const fs = require('fs');
const { execFileSync } = require('child_process');
const q = require('./lib/regenQuota.cjs');

const WORKLIST = 'scripts/tts_regen_worklist.json';
const PROGRESS = 'scripts/tts_regen_progress.json';
const DAILY_LIMIT = Number(process.env.TTS_DAILY_LIMIT || 100);

// ttsDir → 담당 생성기(진단/STAGES 근거로 확정한 prefix 규칙)
function generatorFor(ttsDir) {
  // 예: su1 계열(exp_/log_/trig_/...) → generate_su1_tts.cjs, 그 외(상 계열) → sang
  if (/^(exp|log|trig|explog|sequence|limit)/.test(ttsDir)) return 'scripts/generate_su1_tts.cjs';
  return 'scripts/generate_gemini_math_sang_tts.cjs';
}

function loadProgress() {
  try { return JSON.parse(fs.readFileSync(PROGRESS, 'utf8')); } catch { return { done: [] }; }
}
function saveProgress(p) { fs.writeFileSync(PROGRESS, JSON.stringify(p, null, 2)); }

(async () => {
  const worklist = JSON.parse(fs.readFileSync(WORKLIST, 'utf8'));
  const progress = loadProgress();
  const remaining = q.remainingWork(worklist.suspect, progress);
  const batch = q.takeBatch(remaining, DAILY_LIMIT);
  console.log(`남은 작업 ${remaining.length} / 이번 배치 ${batch.length} (한도 ${DAILY_LIMIT})`);

  // 생성기별 그룹화
  const byGen = {};
  for (const item of batch) (byGen[generatorFor(item.ttsDir)] ||= []).push(item.key);

  for (const [gen, keys] of Object.entries(byGen)) {
    try {
      const out = execFileSync('node', [gen, '--regen-keys', keys.join(',')], { encoding: 'utf8' });
      process.stdout.write(out);
      for (const line of out.split('\n')) {
        const m = line.match(/^REGEN_DONE (.+)$/);
        if (m) progress.done.push(m[1].trim());
        if (/REGEN_QUOTA_EXHAUSTED/.test(line)) {
          saveProgress(progress);
          console.log('할당량 소진 — 진행 저장 후 종료. 다음 창(09:00 KST)에서 재실행하세요.');
          process.exit(0);
        }
      }
    } catch (err) {
      saveProgress(progress);
      if (q.isQuotaExhausted(err)) {
        console.log('할당량 소진(예외) — 진행 저장 후 종료.');
        process.exit(0);
      }
      throw err;
    }
  }
  saveProgress(progress);
  console.log(`배치 완료. 누적 done ${progress.done.length}.`);
})().catch(e => { console.error(e); process.exit(1); });
```
(`generatorFor`의 prefix 규칙은 Task 8 진단에서 확정한 실제 ttsDir 접두사로 보정한다.)

- [ ] **Step 3: 구문 확인**

Run: `cd /Users/mac/mathmentos && node --check scripts/regen_tts_from_worklist.cjs && echo OK`
Expected: `OK`.

- [ ] **Step 4: 커밋**

```bash
cd /Users/mac/mathmentos
git add scripts/generate_su1_tts.cjs scripts/generate_gemini_math_sang_tts.cjs scripts/regen_tts_from_worklist.cjs
git commit -m "feat(tts): regen orchestrator with quota wait/resume + generator --regen-keys"
```

---

### Task 12: 소규모 실재생성 검증(1배치, 적은 한도)

실제 API/업로드 경로가 동작하는지 **소량(예: 3클립)** 으로 검증한다(전체 할당량 소진 방지).

**Files:** (실행/검증)

- [ ] **Step 1: 한도 3으로 1배치 실행**

Run: `cd /Users/mac/mathmentos && TTS_DAILY_LIMIT=3 node scripts/regen_tts_from_worklist.cjs 2>&1 | tail -20`
Expected: `REGEN_DONE ...` 3줄, `배치 완료. 누적 done 3.` , `scripts/tts_regen_progress.json` 생성.

- [ ] **Step 2: manifest 갱신 확인(재생성분이 3.1로 기록)**

Run: `cd /Users/mac/mathmentos && node -e "const m=require('./scripts/tts_manifest.json');const p=require('./scripts/tts_regen_progress.json');for(const k of p.done){console.log(k, m[k]?.model, m[k]?.voice)}"`
Expected: 각 done 키가 `gemini-3.1-flash-tts-preview Aoede`로 기록됨.

- [ ] **Step 3: 감사 재실행 → suspect 감소 확인**

Run: `cd /Users/mac/mathmentos && node scripts/audit_tts_voice.cjs 2>&1 | tail -3`
Expected: `suspect:` 값이 Task 9 대비 정확히 3 감소.

- [ ] **Step 4: 진행상태 커밋**

```bash
cd /Users/mac/mathmentos
git add -f scripts/tts_regen_progress.json scripts/tts_manifest.json scripts/tts_regen_worklist.json
git commit -m "chore(tts): first regen batch (3 clips) verified 3.1+Aoede"
```

---

### Task 13: 전량 재생성(할당량 대기·재개) + 최종 게이트

**Files:** (실행/검증) — 매일 1회 실행을 suspect 0이 될 때까지 반복.

- [ ] **Step 1: 일일 배치 실행(할당량 한도)**

Run: `cd /Users/mac/mathmentos && node scripts/regen_tts_from_worklist.cjs 2>&1 | tail -20`
Expected: 최대 100클립 처리 후 `배치 완료` 또는 `할당량 소진 — 진행 저장 후 종료`. 후자면 **다음 09:00 KST 이후 동일 명령 재실행**(기존 launchd 자동수확 패턴으로 자동화 가능).

- [ ] **Step 2: suspect 0 도달까지 Step 1 반복**

매 실행 후:
Run: `cd /Users/mac/mathmentos && node scripts/audit_tts_voice.cjs 2>&1 | tail -2`
Expected: 반복하여 최종 `suspect: 0`.

- [ ] **Step 3: 최종 검증 게이트(증거 기반)**

Run:
```bash
cd /Users/mac/mathmentos
echo "== suspect 0 ==" ; node scripts/audit_tts_voice.cjs 2>&1 | tail -1
echo "== 2.5 0건 ==" ; grep -rn "gemini-2.5-flash-preview-tts" scripts/ src/ || echo "none"
echo "== openai 0건 ==" ; grep -rnEi "api\.openai\.com|'tts-1'|\"tts-1\"" scripts/ src/services/ttsService.js || echo "none"
echo "== test ==" ; npm test 2>&1 | tail -5
echo "== build ==" ; npm run build 2>&1 | tail -3
```
Expected: `suspect: 0`, 2.5/openai 모두 `none`, 테스트 PASS, build exit 0.

- [ ] **Step 4: 앱 수동 확인**

`npm run dev` 후, 재생성된 단원(예: 고차방정식2단계, gocha 출신 클립)에서 음성 재생 → 다른 단원(원래 3.1)과 **음색이 동일**한지 청취 확인. Gemini 키를 일시 제거하고 재생 시 "음성 일시 사용 불가" 공지 + 무음 확인.

- [ ] **Step 5: 최종 커밋 + PR**

```bash
cd /Users/mac/mathmentos
git add -f scripts/tts_manifest.json scripts/tts_regen_progress.json scripts/tts_regen_worklist.json
git add public/audio/math_hints
git commit -m "chore(tts): regenerate all suspect clips to 3.1+Aoede (suspect=0)"
git push -u origin feat/tts-voice-unification
gh pr create --fill --base main
```

---

## 자기 검토 결과(작성자 체크)

- **스펙 커버리지:** §5 SSOT(Task 1·2)·생성기 리포인트(Task 3·4)·런타임(Task 5)·공지(Task 6) / §6 데이터플로우(Task 8·9) / §7 3단계(Phase 1~3) / §8 에러처리(Task 5 무음, Task 11 할당량 대기/exit 0, orphanSource는 Task 9 분류에서 metadata 부재로 자연 분리) / §9 테스트(각 Task TDD + Task 7·13 게이트) / §3·§4 OpenAI 금지·대기·무음(Task 5·11·13 가드). 모든 스펙 요구가 태스크에 매핑됨.
- **플레이스홀더:** Task 8의 "확정 사항(______)"은 진단 실행으로 채우는 **실데이터 의존 값**으로, 진단 태스크가 그 값을 산출하도록 설계됨(미정 코드 아님).
- **타입/이름 일관성:** `classifyClips({bucketKeys, manifest, knownLegacy})`, `remainingWork/takeBatch/isQuotaExhausted`, worklist 스키마(`suspect[].{key,ttsDir,pid}`), progress 스키마(`{done:[]}`), 생성기 출력 토큰(`REGEN_DONE`/`REGEN_QUOTA_EXHAUSTED`)이 Task 9~13에서 일관 사용됨.

## 미해결/실데이터 의존(구현 중 확정)
- Task 8 진단으로 확정: 서빙 버킷(`math-tts` vs `mentos-assets`), 로컬↔버킷 역매핑, `generatorFor` 접두사 규칙, knownLegacy 키 목록, 실제 suspect 카운트.
- 만약 진단 결과 앱이 `math-tts`가 아닌 다른 버킷에서 서빙한다면, 감사 대상 버킷과 `uploadToSupabase` 타깃을 그 버킷으로 맞춘다(분류/러너 구조는 동일).
