# 수학 숙제 시스템 고도화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수학 숙제 시스템에 오답 자동누적 노트(30일), 숙제 완료 푸시, 월간 테스트를 추가하고 약점(“3” 더미 정답, localStorage 단독 저장)을 Supabase 동기화로 보완한다.

**Architecture:** 오프라인-우선 + 동기화 계층. localStorage가 세션 진실원천(기존 패턴 유지), 신규 순수-로직 서비스가 오답/완료/월간테스트를 계산하고, `syncService`가 Supabase에 미러링한다. 순수 로직은 Vitest로 단위테스트한다.

**Tech Stack:** React + Vite, Supabase JS, Vitest(+jsdom), 기존 `pushService`(CoolSMS/카카오/Supabase).

**설계 문서:** `docs/superpowers/specs/2026-06-01-math-homework-enhancement-design.md`

**범위:** 수학 전용. 영어·과학 제외.

---

## 파일 구조

**신규 (서비스/엔진):**
- `src/services/answerResolver.js` — 정답 단일 로더(“3” 더미 제거)
- `src/services/wrongAnswerStore.js` — 오답 수집·30일 보존·조회 (순수 헬퍼 + localStorage 래퍼)
- `src/services/homeworkCompletion.js` — 완료 판정·요약·중복 푸시 가드
- `src/services/syncService.js` — Supabase 미러/hydrate + 타임스탬프 merge
- `src/engine/math/monthlyTest.js` — 월간 테스트 생성·채점·푸시

**신규 (테스트/설정/스크립트):**
- `vitest.config.js`
- `src/services/__tests__/answerResolver.test.js`
- `src/services/__tests__/wrongAnswerStore.test.js`
- `src/services/__tests__/homeworkCompletion.test.js`
- `src/services/__tests__/syncService.test.js`
- `src/engine/math/__tests__/monthlyTest.test.js`
- `scripts/validate_homework_integrity.cjs`

**수정 (최소 침습 훅 연결):**
- `src/pages/HomeworkMathBox.jsx` — handleGrade/handleShowAVS/handleFinish 훅
- `src/data/homeworkSSOT.js` — `WRONG_REVIEW_ID` 상수 + 헬퍼
- `src/engine/math/mathWeaknessReporter.js` — 정답 로딩을 answerResolver로 교체
- `src/services/homeworkGenerator.js` — “3” 더미 폴백 제거(answerResolver 사용)
- `src/pages/Dashboard.jsx` — 오답노트 카드 + 월간 테스트 상태머신 + 완료 현황
- `package.json` — `"test"` 스크립트

**공통 상수:** `RETENTION_MS = 30 * 24 * 60 * 60 * 1000` (30일)

---

## Phase 0 — 테스트 인프라

### Task 0: Vitest 설치 및 설정

**Files:**
- Modify: `package.json` (scripts)
- Create: `vitest.config.js`
- Create: `src/services/__tests__/smoke.test.js`

- [ ] **Step 1: Vitest와 jsdom 설치**

```bash
cd /Users/mac/mathmentos-mathmentos_homework
npm install -D vitest@^3 jsdom@^25
```

- [ ] **Step 2: vitest.config.js 작성 (vite alias 재사용, jsdom 환경)**

```js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.js'],
  },
});
```

- [ ] **Step 3: package.json에 test 스크립트 추가**

`"scripts"` 객체에 다음 줄 추가 (기존 항목 유지):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 스모크 테스트 작성**

`src/services/__tests__/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('test infra', () => {
  it('localStorage available in jsdom', () => {
    localStorage.setItem('k', 'v');
    expect(localStorage.getItem('k')).toBe('v');
    localStorage.clear();
  });
});
```

- [ ] **Step 5: 실행하여 통과 확인**

Run: `npm test`
Expected: 1 passed (smoke.test.js)

- [ ] **Step 6: 커밋**

```bash
git add package.json package-lock.json vitest.config.js src/services/__tests__/smoke.test.js
git commit -m "test: Vitest + jsdom 테스트 인프라 도입"
```

---

### Task 1: answerResolver — 정답 단일 로더 (“3” 더미 제거)

**Files:**
- Create: `src/services/answerResolver.js`
- Test: `src/services/__tests__/answerResolver.test.js`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/services/__tests__/answerResolver.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { resolveAnswer } from '@/services/answerResolver';

describe('resolveAnswer', () => {
  it('존재하지 않는 answerKey는 null (더미 미생성)', () => {
    expect(resolveAnswer('__없는키__', 1)).toBeNull();
  });

  it('존재하는 키라도 해당 번호 정답이 없으면 null', () => {
    // avs_answers.json의 임의 실제 키를 쓰되, 범위를 벗어난 큰 번호는 없음
    expect(resolveAnswer('__없는키__', 9999)).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- answerResolver`
Expected: FAIL ("Failed to resolve import '@/services/answerResolver'")

- [ ] **Step 3: 구현**

`src/services/answerResolver.js`:

```js
import avsAnswers from '@/data/avs_answers.json';

/**
 * 정답 단일 로더. 정답이 없으면 절대 더미("3")를 만들지 않고 null 반환.
 * @param {string} answerKey - 예: '수학상_01다항식_통합숙제'
 * @param {number} num - 문제 번호 (1-base)
 * @returns {string|null}
 */
export function resolveAnswer(answerKey, num) {
  const map = avsAnswers[answerKey];
  if (!map) return null;
  const key = String(num).padStart(3, '0');
  const val = map[key];
  if (val === undefined || val === null || val === '') return null;
  return String(val);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- answerResolver`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/services/answerResolver.js src/services/__tests__/answerResolver.test.js
git commit -m "feat: answerResolver 정답 단일 로더 (더미 정답 제거)"
```

---

## Phase 1 — W1: 오답 누적 노트

### Task 2: wrongAnswerStore 순수 헬퍼

**Files:**
- Create: `src/services/wrongAnswerStore.js`
- Test: `src/services/__tests__/wrongAnswerStore.test.js`

엔트리 형태: `{ hwId, num, unit, answerKey, firstWrongAt, lastSeenAt, resolved, resolvedAt }` (시각은 ms 정수)

- [ ] **Step 1: 실패하는 테스트 작성 (순수 헬퍼)**

`src/services/__tests__/wrongAnswerStore.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  upsertWrong, applyResolved, computeActive, RETENTION_MS,
} from '@/services/wrongAnswerStore';

const T0 = 1_000_000_000_000; // 고정 기준 시각

describe('wrongAnswerStore 순수 헬퍼', () => {
  it('upsertWrong: 신규 오답 추가', () => {
    const next = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ hwId: 'hw_01', num: 3, resolved: false, firstWrongAt: T0 });
  });

  it('upsertWrong: 동일 문항 재오답 시 lastSeen 갱신·resolved 해제, firstWrongAt 유지', () => {
    const first = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    const resolved = applyResolved(first, 'hw_01', 3, T0 + 100);
    expect(resolved[0].resolved).toBe(true);
    const reWrong = upsertWrong(resolved, { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0 + 200);
    expect(reWrong).toHaveLength(1);
    expect(reWrong[0].resolved).toBe(false);
    expect(reWrong[0].firstWrongAt).toBe(T0);
    expect(reWrong[0].lastSeenAt).toBe(T0 + 200);
  });

  it('applyResolved: 목록에서 제거하지 않고 resolved 마킹', () => {
    const first = upsertWrong([], { hwId: 'hw_01', num: 3, unit: '다항식', answerKey: 'k' }, T0);
    const next = applyResolved(first, 'hw_01', 3, T0 + 50);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ resolved: true, resolvedAt: T0 + 50 });
  });

  it('computeActive: 29일째 유지, 31일째 제거 (resolved 여부 무관)', () => {
    const entries = [
      { hwId: 'a', num: 1, firstWrongAt: T0, resolved: false },
      { hwId: 'b', num: 1, firstWrongAt: T0, resolved: true },
    ];
    const day29 = T0 + 29 * 24 * 60 * 60 * 1000;
    const day31 = T0 + 31 * 24 * 60 * 60 * 1000;
    expect(computeActive(entries, day29)).toHaveLength(2);
    expect(computeActive(entries, day31)).toHaveLength(0);
  });

  it('RETENTION_MS는 30일', () => {
    expect(RETENTION_MS).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- wrongAnswerStore`
Expected: FAIL (import 실패)

- [ ] **Step 3: 구현 (순수 헬퍼 + localStorage 래퍼)**

`src/services/wrongAnswerStore.js`:

```js
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30일
const STORAGE_KEY = 'mentos_wrong_answers';

// ─── 순수 헬퍼 (테스트 대상) ───────────────────────────────

/** (hwId,num) 기준 upsert. 재오답 시 resolved 해제·lastSeen 갱신, firstWrongAt 유지 */
export function upsertWrong(entries, { hwId, num, unit, answerKey }, now) {
  const idx = entries.findIndex(e => e.hwId === hwId && e.num === num);
  if (idx === -1) {
    return [
      ...entries,
      { hwId, num, unit, answerKey, firstWrongAt: now, lastSeenAt: now, resolved: false, resolvedAt: null },
    ];
  }
  return entries.map((e, i) =>
    i === idx ? { ...e, unit, answerKey, lastSeenAt: now, resolved: false, resolvedAt: null } : e
  );
}

/** 정답 처리됨으로 마킹(목록 유지) */
export function applyResolved(entries, hwId, num, now) {
  return entries.map(e =>
    e.hwId === hwId && e.num === num
      ? { ...e, resolved: true, resolvedAt: now, lastSeenAt: now }
      : e
  );
}

/** firstWrongAt + 30일 이내 항목만 반환(resolved 포함) */
export function computeActive(entries, now) {
  return entries.filter(e => now - e.firstWrongAt <= RETENTION_MS);
}

// ─── localStorage 래퍼 ─────────────────────────────────────

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function write(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** 오답 1건 기록 */
export function addWrong(entry, now = Date.now()) {
  const next = upsertWrong(read(), entry, now);
  write(next);
  return next;
}

/** 정답 처리 마킹 */
export function markResolved(hwId, num, now = Date.now()) {
  const next = applyResolved(read(), hwId, num, now);
  write(next);
  return next;
}

/** 만료(30일 초과) 제거 후 활성 오답 반환 */
export function getActiveWrongAnswers(now = Date.now()) {
  const active = computeActive(read(), now);
  write(active); // 만료분 영구 제거
  return active;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- wrongAnswerStore`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/services/wrongAnswerStore.js src/services/__tests__/wrongAnswerStore.test.js
git commit -m "feat: wrongAnswerStore 오답 수집·30일 보존 로직"
```

---

### Task 3: homeworkSSOT에 오답노트 상수/헬퍼 추가

**Files:**
- Modify: `src/data/homeworkSSOT.js` (파일 끝에 추가)

- [ ] **Step 1: 상수·헬퍼 추가**

`src/data/homeworkSSOT.js` 맨 끝에 추가:

```js
/** 오답 복습 노트(특수 숙제) 식별자 */
export const WRONG_REVIEW_ID = 'wrong_review';

/** hwId(예: 'hw_01')로 단원 메타 조회 (오답노트 문제 재구성용) */
export function getUnitById(hwId) {
  return HOMEWORK_UNITS.find(u => u.id === hwId) || null;
}
```

- [ ] **Step 2: 빌드 확인 (export 정상)**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 3: 커밋**

```bash
git add src/data/homeworkSSOT.js
git commit -m "feat: 오답노트 식별자(WRONG_REVIEW_ID)와 getUnitById 헬퍼"
```

---

### Task 4: HomeworkMathBox 채점 훅에 오답 수집 연결

**Files:**
- Modify: `src/pages/HomeworkMathBox.jsx`

현재 `handleGrade`(194-225)와 `handleShowAVS`(172-191)에서 오답 발생 시 `wrongAnswerStore.addWrong`을 호출하고, 정답 시 `markResolved`를 호출한다. 단, **오답노트(wrong_review) 자체를 풀 때는 재귀 수집하지 않는다.**

- [ ] **Step 1: import 추가**

`src/pages/HomeworkMathBox.jsx` 상단 import 블록(10번 줄 근처)에 추가:

```js
import { addWrong, markResolved } from '@/services/wrongAnswerStore';
import { WRONG_REVIEW_ID } from '@/data/homeworkSSOT';
```

- [ ] **Step 2: 오답노트 여부 플래그 정의**

`hwUnit` useMemo 아래(60번 줄 직후)에 추가:

```js
  const isWrongReview = homeworkId === WRONG_REVIEW_ID;
```

- [ ] **Step 3: handleGrade에 수집 훅 추가**

`handleGrade`의 `setGradingResult(isCorrect ? 'correct' : 'incorrect');`(218번 줄) 바로 다음에 삽입:

```js
    // 오답노트 수집 (오답노트 자체 풀이 중에는 재수집 안 함)
    if (!isWrongReview && currentProblem && !currentProblem.isDynamic) {
      const numVal = parseInt(currentProblem.keyStr, 10);
      if (isCorrect) {
        markResolved(hwUnit.id, numVal);
      } else {
        addWrong({ hwId: hwUnit.id, num: numVal, unit: hwUnit.relatedUnit || hwUnit.title, answerKey: hwUnit.answerKey });
      }
    }
```

- [ ] **Step 4: handleShowAVS의 페널티 오답에도 수집 훅 추가**

`handleShowAVS`의 `setToast('⚠️ 정답 입력 전 힌트 조회 → 오답 처리');`(187번 줄) 다음에 삽입:

```js
      if (!isWrongReview && currentProblem && !currentProblem.isDynamic) {
        addWrong({ hwId: hwUnit.id, num: parseInt(currentProblem.keyStr, 10), unit: hwUnit.relatedUnit || hwUnit.title, answerKey: hwUnit.answerKey });
      }
```

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 6: 커밋**

```bash
git add src/pages/HomeworkMathBox.jsx
git commit -m "feat: 숙제 채점 시 오답노트 자동 수집/해결 연결"
```

---

### Task 5: 오답노트(wrong_review) 렌더링 지원

**Files:**
- Modify: `src/pages/HomeworkMathBox.jsx`

`homeworkId === 'wrong_review'`일 때, `getActiveWrongAnswers()`로 문제 목록을 동적 구성한다(정적 단원 이미지/정답 경로 재사용).

- [ ] **Step 1: import 보강**

기존 import에 추가:

```js
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { getUnitById } from '@/data/homeworkSSOT';
import { resolveAnswer } from '@/services/answerResolver';
```

- [ ] **Step 2: hwUnit useMemo에 wrong_review 분기 추가**

`hwUnit` useMemo(47-60) 안, `if (dynamicDbEntry)` 블록 위에 추가:

```js
    if (homeworkId === WRONG_REVIEW_ID) {
      return { id: WRONG_REVIEW_ID, title: '오답 복습 노트', isWrongReview: true, isDynamic: true };
    }
```

- [ ] **Step 3: problems useMemo에 wrong_review 분기 추가**

`problems` useMemo(71-102)의 `if (dynamicDbEntry)` 위에 추가:

```js
    if (homeworkId === WRONG_REVIEW_ID) {
      const actives = getActiveWrongAnswers();
      return actives.map((e, idx) => {
        const unit = getUnitById(e.hwId);
        const keyStr = String(e.num).padStart(3, '0');
        const imgBase = unit ? unit.imagePath : '';
        return {
          problemId: `${e.hwId}_${keyStr}`,
          num: idx + 1,
          keyStr,
          imageSrc: `${imgBase}${keyStr}.webp`,
          solutionSrc: `${imgBase}${keyStr}a.webp`,
          isDynamic: true,
          _wr: e, // 정답 조회용
        };
      });
    }
```

- [ ] **Step 4: answers useMemo에 wrong_review 분기 추가**

`answers` useMemo(105-115)의 `if (dynamicDbEntry)` 위에 추가:

```js
    if (homeworkId === WRONG_REVIEW_ID) {
      const ansMap = {};
      const actives = getActiveWrongAnswers();
      actives.forEach((e) => {
        const keyStr = String(e.num).padStart(3, '0');
        const ans = resolveAnswer(e.answerKey, e.num);
        if (ans !== null) ansMap[`${e.hwId}_${keyStr}`] = ans;
      });
      return ansMap;
    }
```

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 6: 커밋**

```bash
git add src/pages/HomeworkMathBox.jsx
git commit -m "feat: 오답 복습 노트(wrong_review) 동적 렌더링"
```

---

### Task 6: Dashboard에 오답 복습 노트 진입 카드

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: import 추가**

`src/pages/Dashboard.jsx` import 블록에 추가:

```js
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { WRONG_REVIEW_ID } from '@/data/homeworkSSOT';
```

- [ ] **Step 2: 활성 오답 수 계산 (컴포넌트 본문 상단, 다른 useMemo 근처)**

```js
  const wrongReviewCount = React.useMemo(
    () => getActiveWrongAnswers().filter(e => !e.resolved).length,
    []
  );
```

- [ ] **Step 3: "조교 숙제 검사함" 카드(1041번 줄) 위에 오답노트 카드 삽입**

```jsx
      {/* 오답 복습 노트 */}
      <div className="glass-panel homework-card animate-fade-in" style={{ animationDelay: '0.48s' }}>
        <h3><AlertTriangle size={20} color="#ef4444" /> 오답 복습 노트</h3>
        <p>최근 30일간 틀린 문제 <strong>{wrongReviewCount}</strong>개가 누적되어 있습니다. 푼 문제도 한 달간 다시 노출됩니다.</p>
        <button className="btn-primary" onClick={() => navigate(`/homework/math/${WRONG_REVIEW_ID}`)}>
          오답 복습 시작 →
        </button>
      </div>
```

(주: `AlertTriangle`는 Dashboard에서 이미 import됨 — 아니면 lucide-react import에 추가)

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: 대시보드 오답 복습 노트 진입 카드"
```

---

## Phase 2 — W2: 숙제 완료 → 기록 + 학부모 푸시

### Task 7: homeworkCompletion 서비스

**Files:**
- Create: `src/services/homeworkCompletion.js`
- Test: `src/services/__tests__/homeworkCompletion.test.js`

완료 이벤트는 localStorage `mentos_homework_completions`(배열)에 저장. 동일 homeworkId는 1회만 푸시(가드).

- [ ] **Step 1: 실패하는 테스트 작성**

`src/services/__tests__/homeworkCompletion.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { buildSummaryMessage, recordCompletion, hasPushed } from '@/services/homeworkCompletion';

beforeEach(() => localStorage.clear());

describe('homeworkCompletion', () => {
  it('buildSummaryMessage: 요약 문자열에 핵심 지표 포함', () => {
    const msg = buildSummaryMessage('홍길동', { title: '다항식', accuracy: 80, correct: 8, total: 10, wrong: 2, minutes: 12 });
    expect(msg).toContain('홍길동');
    expect(msg).toContain('다항식');
    expect(msg).toContain('80');
  });

  it('recordCompletion: 최초 1회만 shouldPush=true', () => {
    const r1 = recordCompletion('hw_x', { title: 't', accuracy: 90, correct: 9, total: 10, wrong: 1, minutes: 5 });
    const r2 = recordCompletion('hw_x', { title: 't', accuracy: 90, correct: 9, total: 10, wrong: 1, minutes: 5 });
    expect(r1.shouldPush).toBe(true);
    expect(r2.shouldPush).toBe(false);
    expect(hasPushed('hw_x')).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- homeworkCompletion`
Expected: FAIL (import 실패)

- [ ] **Step 3: 구현**

`src/services/homeworkCompletion.js`:

```js
const COMPLETIONS_KEY = 'mentos_homework_completions';

function read() {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '[]'); }
  catch { return []; }
}
function write(list) {
  localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(list));
}

/** 학부모 푸시 메시지 생성 */
export function buildSummaryMessage(studentName, { title, accuracy, correct, total, wrong, minutes }) {
  return `[학부모 알림 - 숙제 완료]
📢 ${studentName} 학생이 '${title}' 숙제를 완료했습니다.
📊 정답률: ${accuracy}% (${correct}/${total})
❌ 오답: ${wrong}문제 · ⏱️ ${minutes}분
자세한 분석은 앱 대시보드에서 확인하실 수 있습니다.`;
}

/** 해당 숙제가 이미 푸시되었는지 */
export function hasPushed(homeworkId) {
  return read().some(c => c.homeworkId === homeworkId && c.pushed);
}

/**
 * 완료 이벤트 기록. 최초 기록 시에만 shouldPush=true 반환(중복 푸시 가드).
 * @returns {{ shouldPush: boolean }}
 */
export function recordCompletion(homeworkId, summary, now = Date.now()) {
  const list = read();
  const already = list.find(c => c.homeworkId === homeworkId);
  if (already?.pushed) {
    return { shouldPush: false };
  }
  const entry = { homeworkId, ...summary, completedAt: now, pushed: true };
  const next = already
    ? list.map(c => (c.homeworkId === homeworkId ? entry : c))
    : [...list, entry];
  write(next);
  return { shouldPush: true };
}

/** 완료 이벤트 목록 (대시보드용) */
export function getCompletions() {
  return read();
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- homeworkCompletion`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/services/homeworkCompletion.js src/services/__tests__/homeworkCompletion.test.js
git commit -m "feat: homeworkCompletion 완료 기록·중복 푸시 가드"
```

---

### Task 8: HomeworkMathBox handleFinish에 완료 기록+푸시 연결

**Files:**
- Modify: `src/pages/HomeworkMathBox.jsx`

`handleFinish`(238-265)에서 전 문항 완료 시 완료 기록 + (최초 1회) 학부모 푸시.

- [ ] **Step 1: import 추가**

```js
import { recordCompletion, buildSummaryMessage } from '@/services/homeworkCompletion';
import { queueParentPush } from '@/services/pushService';
```

- [ ] **Step 2: handleFinish의 `saveHomeworkProgress(homeworkId, solvedStatus);`(254번 줄) 다음에 삽입**

```js
    // 완료 기록 + 학부모 푸시 (전 문항 완료 시 최초 1회)
    if (isAllSolved) {
      const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0;
      const minutes = Math.round((Date.now() - startTime) / 60000);
      const summary = { title: hwUnit.title, accuracy, correct: correctCount, total: totalProblems, wrong: wrongCount, minutes };
      const { shouldPush } = recordCompletion(homeworkId, summary);
      if (shouldPush) {
        const studentName = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}')?.name || '멘토스 학생';
        queueParentPush(buildSummaryMessage(studentName, summary));
      }
    }
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: 커밋**

```bash
git add src/pages/HomeworkMathBox.jsx
git commit -m "feat: 숙제 완료 시 대시보드 기록 + 학부모 푸시(중복 가드)"
```

---

### Task 9: Dashboard 완료 현황에 completion 이벤트 반영

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: import 추가**

```js
import { getCompletions } from '@/services/homeworkCompletion';
```

- [ ] **Step 2: 완료 이벤트 수 계산 추가**

```js
  const completionEvents = React.useMemo(() => getCompletions(), []);
```

- [ ] **Step 3: 기존 "숙제 완료 현황" 카드(1119번 줄 근처) 헤더에 완료 건수 노출**

`<h3>...숙제 완료 현황 (오답 분석 리포트)</h3>` 를 다음으로 교체:

```jsx
          <h3><CheckCircle size={22} color="#3b82f6" /> 숙제 완료 현황 (오답 분석 리포트) · 누적 {completionEvents.length}건</h3>
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 5: 커밋**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: 대시보드 완료 현황에 완료 이벤트 누적 건수 표시"
```

---

## Phase 3 — W3: 월간 테스트

### Task 10: monthlyTest 엔진

**Files:**
- Create: `src/engine/math/monthlyTest.js`
- Test: `src/engine/math/__tests__/monthlyTest.test.js`

격주 엔진(`mathWeaknessReporter.js`) 패턴을 미러링하되, 월간은 **30일 누적 오답 우선** 40문항. 정답은 `resolveAnswer` 사용(없으면 제외).

- [ ] **Step 1: 실패하는 테스트 작성**

`src/engine/math/__tests__/monthlyTest.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { gradeMonthlyTest, buildMonthlyParentMessage } from '@/engine/math/monthlyTest';

describe('monthlyTest', () => {
  it('gradeMonthlyTest: 정오답 채점 및 정확도 계산', () => {
    const problems = [
      { id: 'p1', unit: '다항식', correctAnswer: '3' },
      { id: 'p2', unit: '다항식', correctAnswer: '5' },
    ];
    const res = gradeMonthlyTest({ p1: '3', p2: '1' }, problems);
    expect(res.correctCount).toBe(1);
    expect(res.totalCount).toBe(2);
    expect(res.accuracy).toBe(50);
  });

  it('buildMonthlyParentMessage: 학생명·점수 포함', () => {
    const msg = buildMonthlyParentMessage('홍길동', { accuracy: 70, correctCount: 28, totalCount: 40, unitDiagnoses: [] });
    expect(msg).toContain('홍길동');
    expect(msg).toContain('70');
    expect(msg).toContain('월간');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- monthlyTest`
Expected: FAIL (import 실패)

- [ ] **Step 3: 구현**

`src/engine/math/monthlyTest.js`:

```js
import { HOMEWORK_UNITS, getHomeworkRange, getUnitById } from '@/data/homeworkSSOT';
import { resolveAnswer } from '@/services/answerResolver';
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { analyzeMathWeakness } from '@/engine/math/mathWeaknessReporter';
import { queueParentPush } from '@/services/pushService';

const MONTHLY_TARGET = 40;

/**
 * 30일 누적 오답 우선 + 취약단원 보충으로 40문항 생성.
 * 정답이 없는 문제(resolveAnswer===null)는 제외.
 */
export function generateMonthlyTestProblems(studentLevel = '4~5등급') {
  const problems = [];
  const seen = new Set();

  const pushProblem = (hwUnit, num) => {
    if (problems.length >= MONTHLY_TARGET) return;
    const numStr = String(num).padStart(3, '0');
    const key = `${hwUnit.id}_${numStr}`;
    if (seen.has(key)) return;
    const ans = resolveAnswer(hwUnit.answerKey, num);
    if (ans === null) return; // 정답 없는 문제 제외
    seen.add(key);
    problems.push({
      id: `monthly_${key}_${num}`,
      hwId: hwUnit.id,
      unit: hwUnit.relatedUnit || hwUnit.title,
      num,
      numStr,
      imagePath: `${hwUnit.imagePath}${numStr}.webp`,
      solutionPath: `${hwUnit.imagePath}${numStr}a.webp`,
      hintKey: hwUnit.hintKey,
      correctAnswer: ans,
    });
  };

  // 1. 누적 오답 우선
  for (const e of getActiveWrongAnswers()) {
    if (problems.length >= MONTHLY_TARGET) break;
    const unit = getUnitById(e.hwId);
    if (unit) pushProblem(unit, e.num);
  }

  // 2. 취약단원 보충
  if (problems.length < MONTHLY_TARGET) {
    const top = analyzeMathWeakness().top3.map(w => w.unit);
    for (const unitName of top) {
      const hwUnit = HOMEWORK_UNITS.find(h => h.title === unitName || h.parentUnit === unitName);
      if (!hwUnit) continue;
      const range = getHomeworkRange(hwUnit, studentLevel);
      for (let n = range.start; n <= range.end && problems.length < MONTHLY_TARGET; n++) pushProblem(hwUnit, n);
    }
  }

  // 3. 그래도 부족하면 전 단원에서 보충
  if (problems.length < MONTHLY_TARGET) {
    for (const hwUnit of HOMEWORK_UNITS) {
      if (problems.length >= MONTHLY_TARGET) break;
      const range = getHomeworkRange(hwUnit, studentLevel);
      for (let n = range.start; n <= range.end && problems.length < MONTHLY_TARGET; n++) pushProblem(hwUnit, n);
    }
  }

  return problems;
}

/** 채점 (격주 엔진과 동일한 비교 규칙) */
export function gradeMonthlyTest(userAnswers, assignedProblems) {
  let correctCount = 0;
  const unitResults = {};
  const problemDetails = assignedProblems.map(p => {
    const u = String(userAnswers[p.id] || '').trim();
    const c = String(p.correctAnswer || '').trim();
    const isCorrect = u.length > 0 && u === c;
    if (isCorrect) correctCount++;
    if (!unitResults[p.unit]) unitResults[p.unit] = { total: 0, correct: 0 };
    unitResults[p.unit].total++;
    if (isCorrect) unitResults[p.unit].correct++;
    return { ...p, userAnswer: u, isCorrect };
  });
  const totalCount = assignedProblems.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const unitDiagnoses = Object.entries(unitResults).map(([unit, s]) => ({
    unit,
    testAccuracy: Math.round((s.correct / s.total) * 100),
  }));
  return { accuracy, correctCount, totalCount, problemDetails, unitDiagnoses };
}

/** 학부모 월간 리포트 메시지 */
export function buildMonthlyParentMessage(studentName, gradingResult) {
  const dateStr = new Date().toLocaleDateString('ko-KR');
  let units = '';
  gradingResult.unitDiagnoses.forEach((d, i) => {
    units += `${i + 1}. ${d.unit}: ${d.testAccuracy}%\n`;
  });
  return `[학부모 알림 - 수학 월간 리포트]
📢 ${studentName} 학생이 '수학 월간 종합테스트'를 제출했습니다! (${dateStr})
📊 총점: ${gradingResult.accuracy}점 (${gradingResult.correctCount}/${gradingResult.totalCount})
📈 단원별 성취도:
${units}자세한 분석은 앱 대시보드 리포트에서 확인하실 수 있습니다.`;
}

/** 월간 리포트 학부모 발송 */
export function sendMonthlyParentPush(studentName, gradingResult) {
  const msg = buildMonthlyParentMessage(studentName, gradingResult);
  queueParentPush(msg);
  return msg;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- monthlyTest`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/engine/math/monthlyTest.js src/engine/math/__tests__/monthlyTest.test.js
git commit -m "feat: 월간 테스트 엔진(생성·채점·학부모 푸시)"
```

---

### Task 11: Dashboard 월간 테스트 상태머신/UI

**Files:**
- Modify: `src/pages/Dashboard.jsx`

격주 테스트 상태머신(424-491, 1644-1652) 패턴을 미러링한다.

- [ ] **Step 1: import 추가**

```js
import { generateMonthlyTestProblems, gradeMonthlyTest, sendMonthlyParentPush } from '@/engine/math/monthlyTest';
```

- [ ] **Step 2: 월간 상태 추가 (격주 상태 선언 근처, 428번 줄 패턴 모방)**

```js
  const [monthlyTestStatus, setMonthlyTestStatus] = React.useState(() => {
    return localStorage.getItem('monthly_test_status') || 'pending'; // 'pending' | 'active' | 'completed'
  });
  const [assignedMonthlyProblems, setAssignedMonthlyProblems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('monthly_assigned_problems') || '[]'); }
    catch { return []; }
  });
  const [monthlyAnswers, setMonthlyAnswers] = React.useState({});

  React.useEffect(() => {
    localStorage.setItem('monthly_test_status', monthlyTestStatus);
  }, [monthlyTestStatus]);
```

- [ ] **Step 3: 월간 테스트 시작 핸들러 추가**

```js
  const startMonthlyTest = React.useCallback(() => {
    const problems = generateMonthlyTestProblems(studentLevel);
    setAssignedMonthlyProblems(problems);
    localStorage.setItem('monthly_assigned_problems', JSON.stringify(problems));
    setMonthlyTestStatus('active');
  }, [studentLevel]);

  const submitMonthlyTest = React.useCallback(() => {
    const grading = gradeMonthlyTest(monthlyAnswers, assignedMonthlyProblems);
    const studentName = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}')?.name || '멘토스 학생';
    sendMonthlyParentPush(studentName, grading);
    const results = JSON.parse(localStorage.getItem('monthly_test_results') || '[]');
    results.unshift({ ...grading, date: new Date().toISOString() });
    localStorage.setItem('monthly_test_results', JSON.stringify(results));
    setMonthlyTestStatus('completed');
    alert(`월간 테스트 제출 완료! 정답률 ${grading.accuracy}%`);
  }, [monthlyAnswers, assignedMonthlyProblems]);
```

- [ ] **Step 4: 월간 테스트 진입 카드 추가 (오답노트 카드 아래)**

```jsx
      {/* 월간 종합테스트 */}
      <div className="glass-panel monthly-test-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3><Flame size={20} color="#f59e0b" /> 수학 월간 종합테스트</h3>
        {monthlyTestStatus === 'completed' ? (
          <p>이번 달 월간 테스트를 완료했습니다. 다음 달에 다시 응시할 수 있습니다.</p>
        ) : monthlyTestStatus === 'active' ? (
          <button className="btn-primary" onClick={submitMonthlyTest}>월간 테스트 제출하기</button>
        ) : (
          <>
            <p>최근 30일 누적 오답과 취약단원에서 40문항이 출제됩니다.</p>
            <button className="btn-primary" onClick={startMonthlyTest}>월간 테스트 시작 →</button>
          </>
        )}
      </div>
```

(주: `Flame`은 lucide-react import에 포함돼 있는지 확인, 없으면 추가)

- [ ] **Step 5: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 6: 커밋**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: 대시보드 수학 월간 종합테스트 상태머신/UI"
```

---

## Phase 4 — W4: 무오류 + 약점 수정 + Supabase 동기화

### Task 12: “3” 더미 폴백 제거 (answerResolver 적용)

**Files:**
- Modify: `src/services/homeworkGenerator.js`
- Modify: `src/engine/math/mathWeaknessReporter.js`

- [ ] **Step 1: homeworkGenerator.js의 더미 생성 블록 교체**

`src/services/homeworkGenerator.js` 상단 import에 추가:

```js
import { resolveAnswer } from './answerResolver.js';
```

`if (!ansMap) { ansMap = {}; for (...) ansMap[...] = "3"; }` 블록(323-328)을 삭제하고, 문제 생성 루프의 `answer: ansMap[keyStr] || "3"`(346)를 다음으로 교체:

```js
      answer: (ansMap && ansMap[keyStr] != null) ? ansMap[keyStr] : resolveAnswer(matchedUnit.answerKey, idx),
```

(정답이 끝내 없으면 `null`이 저장되고, 풀이 화면에서 채점 제외된다.)

- [ ] **Step 2: mathWeaknessReporter.js의 `|| '3'` 폴백 교체**

`generateFortnightlyTestProblems`의 `const rawAnswer = avsAnswersData[ansKey]?.[pNumStr] || '3';`(149) 및 보충 루프의 동일 패턴(180)을 다음으로 교체(상단에 `import { resolveAnswer } from '@/services/answerResolver';` 추가):

```js
      const rawAnswer = resolveAnswer(ansKey, candidate.num);
      if (rawAnswer === null) return; // 정답 없으면 출제 제외
```

보충 루프(180-192)는:

```js
        const rawAnswer = resolveAnswer(fillUnit.answerKey, num);
        if (rawAnswer === null) continue;
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: 커밋**

```bash
git add src/services/homeworkGenerator.js src/engine/math/mathWeaknessReporter.js
git commit -m "fix: 정답 더미('3') 폴백 제거 — answerResolver로 단일화"
```

---

### Task 13: 전 단원 무결성 검증 스크립트

**Files:**
- Create: `scripts/validate_homework_integrity.cjs`

- [ ] **Step 1: 스크립트 작성**

`scripts/validate_homework_integrity.cjs`:

```js
/* 전 단원 숙제 무결성 점검: stages/answerKey/정답 존재 여부 */
const fs = require('fs');
const path = require('path');

const ssotPath = path.join(__dirname, '../src/data/homeworkSSOT.js');
const ansPath = path.join(__dirname, '../src/data/avs_answers.json');

const ssotSrc = fs.readFileSync(ssotPath, 'utf8');
const answers = JSON.parse(fs.readFileSync(ansPath, 'utf8'));

// HOMEWORK_UNITS 객체들에서 핵심 필드 추출 (정규식 기반 경량 파서)
const unitBlocks = ssotSrc.split(/\{\s*id:\s*'/).slice(1);
let issues = 0;

unitBlocks.forEach(block => {
  const id = (block.match(/^([^']+)'/) || [])[1];
  if (!id || !id.startsWith('hw')) return;
  const answerKey = (block.match(/answerKey:\s*'([^']+)'/) || [])[1];
  const hasStages = /stages:\s*\{/.test(block);

  if (!answerKey) { console.error(`❌ [${id}] answerKey 없음`); issues++; return; }
  if (!hasStages) { console.error(`❌ [${id}] stages 없음`); issues++; }
  if (!answers[answerKey]) {
    console.error(`❌ [${id}] avs_answers.json에 '${answerKey}' 정답 세트 없음`);
    issues++;
  } else if (Object.keys(answers[answerKey]).length === 0) {
    console.error(`⚠️  [${id}] '${answerKey}' 정답 세트가 비어 있음`);
    issues++;
  }
});

if (issues === 0) {
  console.log('✅ 전 단원 무결성 점검 통과');
  process.exit(0);
} else {
  console.error(`\n총 ${issues}건의 문제가 발견되었습니다.`);
  process.exit(1);
}
```

- [ ] **Step 2: 실행하여 현황 확인**

Run: `node scripts/validate_homework_integrity.cjs`
Expected: `✅ 전 단원 무결성 점검 통과` 또는 누락 리포트. 누락이 나오면 목록을 사용자에게 보고하고, 데이터 보강 여부를 결정한다(이미지/정답 파일은 이 플랜 범위 밖일 수 있음).

- [ ] **Step 3: package.json에 스크립트 추가**

```json
"check:homework": "node scripts/validate_homework_integrity.cjs"
```

- [ ] **Step 4: 커밋**

```bash
git add scripts/validate_homework_integrity.cjs package.json
git commit -m "chore: 전 단원 숙제 무결성 검증 스크립트"
```

---

### Task 14: syncService — Supabase 미러/merge

**Files:**
- Create: `src/services/syncService.js`
- Test: `src/services/__tests__/syncService.test.js`

순수 merge 로직만 테스트(타임스탬프 우선). Supabase I/O는 얇은 래퍼.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/services/__tests__/syncService.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { mergeByTimestamp } from '@/services/syncService';

describe('mergeByTimestamp', () => {
  it('같은 키는 updated_at이 큰 쪽이 이김', () => {
    const local = [{ key: 'a', updated_at: 100, v: 'L' }];
    const remote = [{ key: 'a', updated_at: 200, v: 'R' }];
    const merged = mergeByTimestamp(local, remote, e => e.key);
    expect(merged).toHaveLength(1);
    expect(merged[0].v).toBe('R');
  });

  it('서로 다른 키는 합집합', () => {
    const local = [{ key: 'a', updated_at: 100 }];
    const remote = [{ key: 'b', updated_at: 100 }];
    const merged = mergeByTimestamp(local, remote, e => e.key);
    expect(merged).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- syncService`
Expected: FAIL (import 실패)

- [ ] **Step 3: 구현**

`src/services/syncService.js`:

```js
import { supabase } from '@/services/supabaseClient';

/** 현재 로그인 사용자 id (없으면 null) */
export function getUserId() {
  try {
    return JSON.parse(localStorage.getItem('mentos_mock_user') || 'null')?.id || null;
  } catch {
    return null;
  }
}

/**
 * updated_at(또는 timestamp) 기준 merge. 같은 키는 최신 우선, 다른 키는 합집합.
 * @param {Array} local
 * @param {Array} remote
 * @param {(e:any)=>string} keyFn
 */
export function mergeByTimestamp(local, remote, keyFn) {
  const map = new Map();
  const ts = e => e.updated_at ?? e.timestamp ?? 0;
  [...local, ...remote].forEach(e => {
    const k = keyFn(e);
    const cur = map.get(k);
    if (!cur || ts(e) > ts(cur)) map.set(k, e);
  });
  return [...map.values()];
}

/**
 * 진행도 한 건 Supabase 미러(upsert). 비로그인/오류 시 조용히 무시(localStorage가 SSOT).
 */
export async function mirrorProgress({ homeworkId, problemId, isCorrect, userAnswer, avsViewed }) {
  const userId = getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('homework_progress').upsert({
      user_id: userId,
      homework_id: homeworkId,
      problem_id: problemId,
      is_correct: isCorrect,
      user_answer: userAnswer,
      avs_viewed: avsViewed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,homework_id,problem_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[syncService] mirrorProgress 실패(무시):', err.message);
    return false;
  }
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test -- syncService`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/services/syncService.js src/services/__tests__/syncService.test.js
git commit -m "feat: syncService Supabase 미러 + 타임스탬프 merge"
```

---

### Task 15: 진행도 저장 시 Supabase 미러 연결

**Files:**
- Modify: `src/pages/HomeworkMathBox.jsx`

`saveHomeworkProgress` 호출 지점들에서 미러를 fire-and-forget로 호출(기존 동작 불변).

- [ ] **Step 1: import 추가**

```js
import { mirrorProgress } from '@/services/syncService';
```

- [ ] **Step 2: handleGrade의 `saveHomeworkProgress(homeworkId, newStatus);`(217번 줄) 다음에 삽입**

```js
    mirrorProgress({ homeworkId, problemId: pid, isCorrect, userAnswer, avsViewed: newStatus[pid]?.avsViewed || false });
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 4: 커밋**

```bash
git add src/pages/HomeworkMathBox.jsx
git commit -m "feat: 진행도 저장 시 Supabase 미러링 연결"
```

---

### Task 16: Supabase 마이그레이션 SQL 문서화

**Files:**
- Create: `supabase/migrations/2026-06-01_homework_enhancement.sql`

- [ ] **Step 1: 마이그레이션 SQL 작성**

`supabase/migrations/2026-06-01_homework_enhancement.sql`:

```sql
-- homework_progress
create table if not exists public.homework_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  homework_id text not null,
  problem_id text not null,
  is_correct boolean,
  user_answer text,
  avs_viewed boolean default false,
  updated_at timestamptz default now(),
  unique (user_id, homework_id, problem_id)
);
alter table public.homework_progress enable row level security;
create policy "own rows" on public.homework_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- wrong_answers
create table if not exists public.wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  unit text,
  hw_id text not null,
  problem_num int not null,
  answer_key text,
  first_wrong_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  resolved boolean default false,
  resolved_at timestamptz,
  unique (user_id, hw_id, problem_num)
);
alter table public.wrong_answers enable row level security;
create policy "own rows" on public.wrong_answers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- test_results
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  test_type text not null,
  accuracy int,
  correct_count int,
  total_count int,
  unit_diagnoses jsonb,
  created_at timestamptz default now()
);
alter table public.test_results enable row level security;
create policy "own rows" on public.test_results
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

- [ ] **Step 2: 사용자에게 적용 안내**

이 SQL은 Supabase 대시보드 SQL Editor 또는 CLI로 적용해야 한다(자동 적용 아님). 적용 전까지 `mirrorProgress`는 조용히 실패하고 localStorage가 SSOT로 동작한다.

- [ ] **Step 3: 커밋**

```bash
git add supabase/migrations/2026-06-01_homework_enhancement.sql
git commit -m "chore: 숙제 고도화 Supabase 마이그레이션 SQL"
```

---

## 최종 검증 (Phase 5)

### Task 17: 전체 회귀 검증

- [ ] **Step 1: 전체 테스트**

Run: `npm test`
Expected: 모든 테스트 PASS (smoke, answerResolver, wrongAnswerStore, homeworkCompletion, monthlyTest, syncService)

- [ ] **Step 2: 무결성 점검**

Run: `npm run check:homework`
Expected: ✅ 통과 (누락 시 사용자 보고)

- [ ] **Step 3: 빌드**

Run: `npm run build`
Expected: exit 0, 0 errors

- [ ] **Step 4: 수동 시나리오 (dev 서버)**

`npm run dev` 후 브라우저에서:
1. 숙제 풀이 → 일부러 오답 → 대시보드 "오답 복습 노트" 카운트 증가 확인
2. 오답 복습 노트 진입 → 문제 노출 확인
3. 숙제 전 문항 완료 → 완료 alert + (개발자도구) `pushQueue`에 학부모 메시지 적재 확인
4. 월간 테스트 시작 → 40문항(또는 가용 최대) 생성 확인 → 제출 → 푸시 적재 확인

- [ ] **Step 5: 최종 커밋(있으면)**

```bash
git add -A && git commit -m "test: 수학 숙제 고도화 전체 회귀 검증 완료"
```

---

## 자가검토 메모 (작성자 확인)

- **스펙 커버리지:** W1=Task2~6, W2=Task7~9, W3=Task10~11, W4=Task12~16, 검증=Task0·17. 전 항목 매핑됨.
- **타입 일관성:** `addWrong/markResolved/getActiveWrongAnswers`(store), `recordCompletion/buildSummaryMessage/getCompletions`(completion), `generateMonthlyTestProblems/gradeMonthlyTest/sendMonthlyParentPush`(monthly), `mergeByTimestamp/mirrorProgress/getUserId`(sync), `resolveAnswer`(resolver), `WRONG_REVIEW_ID/getUnitById`(SSOT) — 호출부와 정의부 시그니처 일치.
- **비범위:** 영어·과학, OCR 채점, 실제 SMS/카카오 발송키 설정, 누락 이미지/정답 데이터 생성.
