# 모의고사 오답 → 취약단원 → 숙제 연결 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모의고사(월간테스트)에서 틀린 문제를 오답스토어에 적재해 오답복습 노트(숙제)·모의고사 재출제·취약단원 진단에 자동 반영하되, 숙제 진도(`hw_progress`)는 오염시키지 않는다.

**Architecture:** `wrongAnswerStore`를 허브로 사용한다. 모의고사 채점(`gradeMonthlyTest`) 결과를 신규 `recordMonthlyTestWrongs`가 오답→`addWrong`, 정답→`markResolved`로 동기화한다. `analyzeMathWeakness`에 입력 C(오답스토어)를 추가하되 숙제에서 이미 센 `(hwId,num)`은 제외한다. `hw_progress`는 읽기만 한다.

**Tech Stack:** React, Vite, Vitest+jsdom, localStorage. 별칭 `@` = `src/`.

**Branch:** `feature/mock-exam-weakness-link` (이미 생성됨).

**Spec:** `docs/superpowers/specs/2026-06-01-mock-exam-weakness-homework-link-design.md`

---

## File Structure

| 파일 | 역할 | 변경 |
|------|------|------|
| `src/engine/math/monthlyTest.js` | 모의고사 생성·채점 | 문제객체에 `answerKey` 추가, 신규 `recordMonthlyTestWrongs` |
| `src/engine/math/mathWeaknessReporter.js` | 취약단원 분석 | `analyzeMathWeakness`에 입력 C(오답스토어)+중복제거 |
| `src/pages/Dashboard.jsx` | 월간테스트 UI/제출 | `submitMonthlyTest`에서 동기화 호출 1줄 |
| `src/engine/math/__tests__/monthlyTestSync.test.js` | 신규 테스트 | recordMonthlyTestWrongs + answerKey |
| `src/engine/math/__tests__/mathWeaknessReporter.test.js` | 신규 테스트 | 입력 C 동작 |

`wrongAnswerStore.js`(`addWrong(entry)`, `markResolved(hwId,num)`, `getActiveWrongAnswers()`)와 `getUnitById`는 기존 그대로 사용한다.

---

## Task 1: monthlyTest.js — answerKey 필드 + recordMonthlyTestWrongs

**Files:**
- Create: `src/engine/math/__tests__/monthlyTestSync.test.js`
- Modify: `src/engine/math/monthlyTest.js` (import L3, 문제객체 L25-35, 신규 함수)

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/engine/math/__tests__/monthlyTestSync.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { recordMonthlyTestWrongs, generateMonthlyTestProblems } from '@/engine/math/monthlyTest';
import { addWrong, getActiveWrongAnswers } from '@/services/wrongAnswerStore';

beforeEach(() => { localStorage.clear(); });

describe('recordMonthlyTestWrongs', () => {
  it('틀린 문제는 오답스토어에 추가된다', () => {
    const grading = { problemDetails: [
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: false },
    ] };
    recordMonthlyTestWrongs(grading);
    const active = getActiveWrongAnswers().filter(e => !e.resolved);
    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({ hwId: 'hw_01', num: 5, answerKey: '수학상_01다항식_통합숙제' });
  });

  it('맞힌 문제는 기존 오답을 resolved 처리한다', () => {
    addWrong({ hwId: 'hw_01', num: 7, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' });
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 7, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: true },
    ] });
    const entry = getActiveWrongAnswers().find(e => e.hwId === 'hw_01' && e.num === 7);
    expect(entry.resolved).toBe(true);
  });

  it('answerKey 없는 오답 항목은 skip한다', () => {
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 9, unit: '다항식의 연산', isCorrect: false },
    ] });
    expect(getActiveWrongAnswers()).toHaveLength(0);
  });

  it('숙제 진도(hw_progress)는 건드리지 않는다', () => {
    recordMonthlyTestWrongs({ problemDetails: [
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제', isCorrect: false },
    ] });
    expect(localStorage.getItem('hw_progress_hw_01')).toBeNull();
  });

  it('grading이 비정상이어도 throw하지 않는다', () => {
    expect(() => recordMonthlyTestWrongs(null)).not.toThrow();
    expect(() => recordMonthlyTestWrongs({})).not.toThrow();
  });
});

describe('generateMonthlyTestProblems', () => {
  it('생성된 문제는 answerKey 문자열을 가진다', () => {
    const problems = generateMonthlyTestProblems('4~5등급');
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.every(p => typeof p.answerKey === 'string' && p.answerKey.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run src/engine/math/__tests__/monthlyTestSync.test.js`
Expected: FAIL — `recordMonthlyTestWrongs is not a function` (및 answerKey 미정의로 generate 테스트 실패)

- [ ] **Step 3: import에 addWrong, markResolved 추가**

Modify `src/engine/math/monthlyTest.js` line 3:

```js
import { getActiveWrongAnswers, addWrong, markResolved } from '@/services/wrongAnswerStore';
```

- [ ] **Step 4: 문제객체에 answerKey 필드 추가**

Modify `src/engine/math/monthlyTest.js` — `pushProblem` 내 `problems.push({...})` (현재 L25-35). `correctAnswer: ans,` 다음 줄에 추가:

```js
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
      answerKey: hwUnit.answerKey,
    });
```

- [ ] **Step 5: recordMonthlyTestWrongs 함수 추가**

Modify `src/engine/math/monthlyTest.js` — `gradeMonthlyTest` 함수 닫는 `}` 직후(현재 L89 다음)에 추가:

```js
/**
 * 채점 결과를 오답스토어에 동기화.
 * 오답 → addWrong, 정답 → markResolved. hw_progress(숙제 진도)는 건드리지 않는다.
 */
export function recordMonthlyTestWrongs(grading) {
  if (!grading || !Array.isArray(grading.problemDetails)) return;
  try {
    grading.problemDetails.forEach(p => {
      if (!p || !p.hwId || p.num == null) return;
      if (p.isCorrect) {
        markResolved(p.hwId, p.num);
      } else if (p.answerKey) {
        addWrong({ hwId: p.hwId, num: p.num, unit: p.unit, answerKey: p.answerKey });
      }
    });
  } catch (err) {
    console.warn('[monthlyTest] 오답스토어 동기화 실패:', err.message);
  }
}
```

- [ ] **Step 6: 테스트 실행 → 통과 확인**

Run: `npx vitest run src/engine/math/__tests__/monthlyTestSync.test.js`
Expected: PASS (6 tests)

- [ ] **Step 7: 커밋**

```bash
git add src/engine/math/monthlyTest.js src/engine/math/__tests__/monthlyTestSync.test.js
git commit -m "feat: 모의고사 채점→오답스토어 동기화(recordMonthlyTestWrongs) + answerKey 필드"
```

---

## Task 2: mathWeaknessReporter.js — analyzeMathWeakness 입력 C

**Files:**
- Create: `src/engine/math/__tests__/mathWeaknessReporter.test.js`
- Modify: `src/engine/math/mathWeaknessReporter.js` (import, `analyzeMathWeakness` L13-89)

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/engine/math/__tests__/mathWeaknessReporter.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeMathWeakness } from '@/engine/math/mathWeaknessReporter';

beforeEach(() => { localStorage.clear(); });

function seedStore(entries) {
  const now = Date.now();
  localStorage.setItem('mentos_wrong_answers', JSON.stringify(
    entries.map(e => ({ resolved: false, resolvedAt: null, firstWrongAt: now, lastSeenAt: now, ...e }))
  ));
}

describe('analyzeMathWeakness 입력 C (오답스토어)', () => {
  it('모의고사 전용 오답(숙제 진도에 없음)이 취약단원에 반영된다', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w).toBeTruthy();
    expect(w.wrong).toBeGreaterThanOrEqual(1);
  });

  it('숙제+모의고사 동일 (hwId,num) 오답은 중복 계상하지 않는다', () => {
    localStorage.setItem('hw_progress_hw_01', JSON.stringify({ '005': { isCorrect: false } }));
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.wrong).toBe(1);
  });

  it('resolved(극복) 오답은 취약단원에 포함하지 않는다', () => {
    const now = Date.now();
    localStorage.setItem('mentos_wrong_answers', JSON.stringify([
      { hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제',
        resolved: true, resolvedAt: now, firstWrongAt: now, lastSeenAt: now },
    ]));
    const { allWeakness } = analyzeMathWeakness();
    expect(allWeakness.find(x => x.unit === '다항식의 연산')).toBeFalsy();
  });

  it('errorRate 분모가 정상이다 (오답 1건 = 시도 1건)', () => {
    seedStore([{ hwId: 'hw_01', num: 5, unit: '다항식의 연산', answerKey: '수학상_01다항식_통합숙제' }]);
    const { allWeakness } = analyzeMathWeakness();
    const w = allWeakness.find(x => x.unit === '다항식의 연산');
    expect(w.errorRate).toBe(100);
    expect(w.total).toBeGreaterThanOrEqual(w.wrong);
  });
});
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run src/engine/math/__tests__/mathWeaknessReporter.test.js`
Expected: FAIL — 첫 테스트에서 `w`가 undefined (입력 C 미구현이라 모의고사 전용 오답이 취약단원에 안 잡힘)

- [ ] **Step 3: import에 getActiveWrongAnswers 추가**

Modify `src/engine/math/mathWeaknessReporter.js` — line 8 다음(import 블록 끝)에 추가:

```js
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
```

- [ ] **Step 4: countedKeys 선언 + 소스 B에 키 적재**

Modify `src/engine/math/mathWeaknessReporter.js`:

(4a) `const unitStats = {};`(현재 L15) 다음 줄에 추가:

```js
  const countedKeys = new Set(); // 소스 B에서 센 (hwId:num) — 입력 C 중복 방지
```

(4b) 소스 B의 오답 분기(현재 L50-53 `} else { ... }`)를 다음으로 교체:

```js
      } else {
        unitStats[unit].wrongCount++;
        unitStats[unit].wrongIndices.push(parseInt(pid, 10));
        countedKeys.add(`${hw.id}:${parseInt(pid, 10)}`);
      }
```

- [ ] **Step 5: 입력 C(오답스토어 집계) 추가**

Modify `src/engine/math/mathWeaknessReporter.js` — 소스 B의 `HOMEWORK_UNITS.forEach(...)` 블록이 끝나는 `});`(현재 L56) 다음, `// C. 취약성 데이터 정렬...`(현재 L58) 앞에 삽입:

```js
  // C. 시험(모의고사) 오답 집계 — 오답스토어. 숙제에서 이미 센 (hwId,num)은 제외.
  try {
    for (const e of getActiveWrongAnswers()) {
      if (e.resolved) continue;
      const key = `${e.hwId}:${e.num}`;
      if (countedKeys.has(key)) continue;
      countedKeys.add(key);
      const unit = e.unit || '공통수학';
      if (!unitStats[unit]) {
        unitStats[unit] = { totalQuestions: 0, correctCount: 0, wrongCount: 0, wrongIndices: [] };
      }
      unitStats[unit].totalQuestions++;
      unitStats[unit].wrongCount++;
      unitStats[unit].wrongIndices.push(e.num);
    }
  } catch (err) {
    console.warn('[analyzeMathWeakness] 오답스토어 집계 실패:', err.message);
  }
```

- [ ] **Step 6: 테스트 실행 → 통과 확인**

Run: `npx vitest run src/engine/math/__tests__/mathWeaknessReporter.test.js`
Expected: PASS (4 tests)

- [ ] **Step 7: 커밋**

```bash
git add src/engine/math/mathWeaknessReporter.js src/engine/math/__tests__/mathWeaknessReporter.test.js
git commit -m "feat: 취약단원 분석에 오답스토어(입력 C) 반영 + (hwId,num) 중복제거"
```

---

## Task 3: Dashboard.jsx — submitMonthlyTest 배선

**Files:**
- Modify: `src/pages/Dashboard.jsx` (import L15, `submitMonthlyTest`)

> React 컴포넌트 배선은 단위테스트 대상이 아니다(로직은 Task 1에서 검증됨). 빌드 통과 + 전체 테스트로 검증한다.

- [ ] **Step 1: import에 recordMonthlyTestWrongs 추가**

Modify `src/pages/Dashboard.jsx` line 15:

```js
import { generateMonthlyTestProblems, gradeMonthlyTest, sendMonthlyParentPush, recordMonthlyTestWrongs } from '@/engine/math/monthlyTest';
```

- [ ] **Step 2: submitMonthlyTest에서 동기화 호출 추가**

Modify `src/pages/Dashboard.jsx` — `submitMonthlyTest`의 `const grading = gradeMonthlyTest(...)` 다음 줄에 추가:

```js
  const submitMonthlyTest = React.useCallback(() => {
    const grading = gradeMonthlyTest(monthlyAnswers, assignedMonthlyProblems);
    recordMonthlyTestWrongs(grading);
    const studentName = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}')?.name || '멘토스 학생';
    sendMonthlyParentPush(studentName, grading);
    const results = JSON.parse(localStorage.getItem('monthly_test_results') || '[]');
    results.unshift({ ...grading, date: new Date().toISOString() });
    localStorage.setItem('monthly_test_results', JSON.stringify(results));
    setMonthlyTestStatus('completed');
    alert(`월간 테스트 제출 완료! 정답률 ${grading.accuracy}%`);
  }, [monthlyAnswers, assignedMonthlyProblems]);
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: `✓ built` (exit 0)

- [ ] **Step 4: 커밋**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: 월간테스트 제출 시 오답스토어 동기화 호출"
```

---

## Task 4: 전체 검증 + PR

**Files:** 없음 (검증·문서)

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`
Expected: 기존 23 + 신규 10(monthlyTestSync 6, mathWeaknessReporter 4) = **33 passed**

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: `✓ built` (exit 0)

- [ ] **Step 3: 통합 동작 수동 점검(코드 추적)**

다음 흐름이 코드상 연결됨을 확인:
- `submitMonthlyTest` → `recordMonthlyTestWrongs` → `addWrong` → `mentos_wrong_answers`
- 오답복습 노트(`HomeworkMathBox` WRONG_REVIEW) → `getActiveWrongAnswers` 가 위 엔트리 노출
- `analyzeMathWeakness` 입력 C → 해당 단원 취약 반영

- [ ] **Step 4: 플랜 체크박스 갱신 후 커밋**

```bash
git add -f docs/superpowers/plans/2026-06-01-mock-exam-weakness-homework-link.md
git commit -m "docs: 모의고사-취약단원-숙제 연결 구현 플랜 체크오프"
```

- [ ] **Step 5: PR (사용자 확인 후 `/commit-push-pr`로 진행)**

푸시·PR·머지는 별도 `/commit-push-pr` 흐름으로. base `main`, head `feature/mock-exam-weakness-link`.

---

## Self-Review

- **Spec coverage:** 화살표①(채점→스토어)=Task1+3, 화살표②(취약단원 입력C)=Task2, 분리(hw_progress 불변)=Task1 회귀테스트, 에러처리=Task1/2 try-catch, 테스트 4종=Task1/2. 범위밖(격주 직접배선/배지/Supabase)=미포함. ✔ 누락 없음.
- **Placeholder scan:** 모든 코드 스텝에 실제 코드/명령/기대출력 포함. TBD 없음. ✔
- **Type consistency:** `recordMonthlyTestWrongs(grading)` 시그니처 Task1 정의=Task3 호출 일치. `addWrong({hwId,num,unit,answerKey})`=wrongAnswerStore 기존 시그니처 일치. `countedKeys` 키 형식 `${id}:${정수}`를 소스B(parseInt(pid))·입력C(e.num 정수) 동일 정규화. ✔
