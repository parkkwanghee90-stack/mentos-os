# 수1(대수) 수식 깨짐 + 단원 매핑 수정 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수학1(대수) 단원의 깨진 LaTeX(문제 본문 + AVS 해설)와 단원↔문제 매핑 오류를 audit-first 방식으로 검출·검토·수정하고, public/data·src/data를 동기화한다.

**Architecture:** 검출/수정 핵심 로직은 `src/lib/algebraFix/`의 순수 ESM 모듈로 작성하고 vitest로 단위 테스트(`src/**/*.test.js`)한다. `scripts/`의 얇은 ESM 러너가 실제 파일 IO를 담당한다. Audit(읽기전용)→사용자 리뷰 게이트→Fix(승인분만)→검증→동기화 순으로 진행하며, 매핑 이동과 모호한 LaTeX는 자동 적용하지 않고 승인 파일을 거친다.

**Tech Stack:** Node.js(ESM, `"type":"module"`), katex(앱과 동일 버전), vitest(jsdom), 기존 `npm run check:math-latex`.

**대상 파일(런타임 정본 = `public/data/`):**
- A(문제 본문): `public/data/math_problem_texts.json` (키: `단원/NNN.webp`, 값: `$…$` 포함 문자열)
- B(AVS 해설): `public/data/avs_answers.json` (값: `{문제번호: 답}`; `_v2` 키에 해설 텍스트, plaintext 깨짐 다수)
- C(매핑): `public/problems_index.json`, `public/data/avs_answers.json`, `public/data/answers_master.json`, 디스크 폴더 `public/concept_cards/`, `src/data/homeworkSSOT.js`
- 동기화 대상: `src/data/avs_answers.json`, `src/data/math_problem_texts.json`

---

## File Structure

신규/수정 파일과 책임:

| 파일 | 책임 |
|---|---|
| `src/lib/algebraFix/algebraUnits.js` (생성) | homeworkSSOT에서 대수(`subject==='수학1'`) 단원 루트 추출 + 단원키 정규화 |
| `src/lib/algebraFix/latexDetect.js` (생성) | 문자열 내 깨진 LaTeX 패턴(P1~P5) 검출 + 안전등급 판정 |
| `src/lib/algebraFix/latexFix.js` (생성) | AUTO 등급 변환만 적용 + katex 재렌더 검증/롤백 |
| `src/lib/algebraFix/mappingAudit.js` (생성) | 5개 소스 교차대조 → 매핑 불일치 리포트 데이터 생성 |
| `src/lib/algebraFix/__tests__/*.test.js` (생성) | 위 모듈 단위 테스트 |
| `scripts/audit_algebra.js` (생성) | 러너: 파일 로드 → 모듈 호출 → 매핑/LaTeX 리포트 MD 작성 |
| `scripts/fix_algebra_latex.js` (생성) | 러너: 승인된 LaTeX 수정 적용(백업) + diff 리포트 |
| `scripts/apply_mapping_fixes.js` (생성) | 러너: 승인 파일 기반 매핑 이동(키 rename/move) 적용 |
| `scripts/sync_algebra_sources.js` (생성) | 러너: public/data→src/data 대수 키 선별 동기화 |
| `docs/superpowers/specs/2026-06-02-mapping-audit.md` (러너 산출) | 매핑 audit 리포트 |
| `docs/superpowers/specs/2026-06-02-latex-audit.md` (러너 산출) | LaTeX audit 리포트 |
| `docs/superpowers/specs/2026-06-02-deploy-checklist.md` (생성) | Supabase 갱신 등 배포 체크리스트 |

---

## Phase 0 — 대수 단원 화이트리스트

### Task 1: 대수 단원 추출 + 단원키 정규화 모듈

**Files:**
- Create: `src/lib/algebraFix/algebraUnits.js`
- Test: `src/lib/algebraFix/__tests__/algebraUnits.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/algebraFix/__tests__/algebraUnits.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { getAlgebraUnitRoots, normalizeUnitKey, isAlgebraKey } from '../algebraUnits.js';

describe('algebraUnits', () => {
  it('대수(수학1) 단원 루트를 추출한다', () => {
    const roots = getAlgebraUnitRoots();
    expect(roots).toContain('삼각함수');
    expect(roots).toContain('지수');
    expect(roots).toContain('수열'); // 등차등비/수열의합
    expect(roots.length).toBeGreaterThanOrEqual(8);
  });

  it('단원키에서 루트와 단계를 정규화한다', () => {
    expect(normalizeUnitKey('삼각함수성질3단계')).toEqual({ root: '삼각함수성질', stage: '3' });
    expect(normalizeUnitKey('삼각함수활용 4단계(68)')).toEqual({ root: '삼각함수활용', stage: '4' });
    expect(normalizeUnitKey('삼각함수그래프')).toEqual({ root: '삼각함수그래프', stage: null });
  });

  it('대수 단원 키 여부를 판정한다', () => {
    expect(isAlgebraKey('삼각함수활용3단계')).toBe(true);
    expect(isAlgebraKey('(1)일차부등식 개념2단계(26) 1+1(쌍둥이)')).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/algebraUnits.test.js`
Expected: FAIL — `Cannot find module '../algebraUnits.js'`

- [ ] **Step 3: 모듈 구현**

`src/lib/algebraFix/algebraUnits.js`:
```js
import ssot from '../../data/homeworkSSOT.js';

// 대수(수학1) 단원 루트 키워드. homeworkSSOT relatedUnit + JSON 키 명칭 차이를 흡수하는 안정 토큰.
const ALGEBRA_ROOT_TOKENS = [
  '지수', '로그', '지수로그함수', '삼각함수', '삼각함수성질', '삼각함수그래프',
  '삼각함수활용', '등차등비', '수열', '수열의합', '귀납',
];

// homeworkSSOT에서 subject==='수학1'인 단원의 relatedUnit/title 기반 루트 집합
export function getAlgebraUnitRoots() {
  const list = Array.isArray(ssot) ? ssot : (ssot.default ?? []);
  const roots = new Set(ALGEBRA_ROOT_TOKENS);
  for (const u of list) {
    if (u && u.subject === '수학1' && u.relatedUnit) roots.add(u.relatedUnit);
  }
  return [...roots];
}

// '삼각함수성질3단계' → { root:'삼각함수성질', stage:'3' }
// '삼각함수활용 4단계(68)' → { root:'삼각함수활용', stage:'4' }
export function normalizeUnitKey(key) {
  const cleaned = String(key).replace(/\(\d+\)/g, '').trim(); // 접미 (68) 제거
  const m = cleaned.match(/^(.*?)\s*([2-4])단계\s*$/);
  if (m) return { root: m[1].trim(), stage: m[2] };
  return { root: cleaned, stage: null };
}

// 키가 대수 단원에 속하는지(루트 토큰 포함 여부)
export function isAlgebraKey(key) {
  const { root } = normalizeUnitKey(key);
  return ALGEBRA_ROOT_TOKENS.some((t) => root.includes(t));
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/algebraUnits.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/algebraFix/algebraUnits.js src/lib/algebraFix/__tests__/algebraUnits.test.js
git commit -m "feat(algebra-fix): 대수 단원 화이트리스트+단원키 정규화 모듈"
```

---

## Phase 1 — Audit 엔진 + 실행 + 리뷰 게이트

### Task 2: LaTeX 깨짐 검출 모듈

**Files:**
- Create: `src/lib/algebraFix/latexDetect.js`
- Test: `src/lib/algebraFix/__tests__/latexDetect.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/algebraFix/__tests__/latexDetect.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { detectIssues } from '../latexDetect.js';

describe('detectIssues', () => {
  it('P1: 줄 단위 $ 짝 불균형을 검출한다', () => {
    const issues = detectIssues('① $2\n② $\\sqrt{5}$');
    expect(issues.some((i) => i.code === 'P1')).toBe(true);
  });

  it('P3: $ 없는 plaintext 수식(frac/sqrt)을 검출한다', () => {
    const issues = detectIssues('정답은 frac34+fracsqrt22 입니다');
    const p3 = issues.find((i) => i.code === 'P3');
    expect(p3).toBeTruthy();
    expect(p3.grade).toBe('REVIEW'); // 토큰 경계 모호 → 수동
  });

  it('P5: $…$ 내부 KaTeX 파싱 실패를 검출한다', () => {
    const issues = detectIssues('$\\frac{1}{$'); // 미닫힌 중괄호
    expect(issues.some((i) => i.code === 'P5')).toBe(true);
  });

  it('정상 문자열은 빈 배열을 반환한다', () => {
    expect(detectIssues('값은 $x^2 + 1$ 이다.')).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/latexDetect.test.js`
Expected: FAIL — `Cannot find module '../latexDetect.js'`

- [ ] **Step 3: 모듈 구현**

`src/lib/algebraFix/latexDetect.js`:
```js
import katex from 'katex';

// $…$ 단위로 KaTeX 검증, + 정규식 패턴(P1,P3,P5) 검출. 각 finding에 안전등급 부여.
// P1: 줄 단위 $ 홀수(짝 불균형) — AUTO 후보(줄 끝 댕글링 보정 가능 시)
// P3: $ 밖 plaintext 수식 토큰(frac/sqrt/pi/^/_) — REVIEW(경계 모호)
// P5: $…$ 내부 KaTeX 파싱 실패 — REVIEW(의미 추론 필요)
const PLAINTEXT_MATH = /(?:\bfrac[0-9]|\bsqrt|\\?pi\b|[A-Za-z0-9]\^[0-9A-Za-z])/;

export function detectIssues(text) {
  if (!text || typeof text !== 'string') return [];
  const issues = [];

  // P1: 줄 단위 $ 개수 홀수
  text.split('\n').forEach((line, idx) => {
    const dollars = (line.match(/(?<!\\)\$/g) || []).length;
    if (dollars % 2 === 1) {
      issues.push({ code: 'P1', grade: 'AUTO', line: idx, snippet: line.trim() });
    }
  });

  // P3: $ 구간을 제거한 잔여 텍스트에서 plaintext 수식 토큰
  const outside = text.replace(/(?<!\\)\$[^$]*\$/g, ' ');
  if (PLAINTEXT_MATH.test(outside)) {
    issues.push({ code: 'P3', grade: 'REVIEW', snippet: outside.trim().slice(0, 120) });
  }

  // P5: $…$ 내부 KaTeX 검증
  const inline = /(?<!\\)\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  let m;
  while ((m = inline.exec(text)) !== null) {
    try {
      katex.renderToString(m[1], { throwOnError: true });
    } catch (e) {
      issues.push({ code: 'P5', grade: 'REVIEW', latex: m[1], error: e.message });
    }
  }
  return issues;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/latexDetect.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/algebraFix/latexDetect.js src/lib/algebraFix/__tests__/latexDetect.test.js
git commit -m "feat(algebra-fix): LaTeX 깨짐 검출 모듈(P1/P3/P5 + 안전등급)"
```

---

### Task 3: 단원↔문제 매핑 audit 모듈

**Files:**
- Create: `src/lib/algebraFix/mappingAudit.js`
- Test: `src/lib/algebraFix/__tests__/mappingAudit.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/algebraFix/__tests__/mappingAudit.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { auditMapping } from '../mappingAudit.js';

describe('auditMapping', () => {
  it('한 소스에만 있는 단원키를 KEY_PRESENCE 불일치로 검출한다', () => {
    const res = auditMapping({
      problemsIndex: { '삼각함수활용3단계': ['001', '002'] },
      avsAnswers: { '삼각함수성질3단계': {}, '삼각함수활용3단계': { '001': '4' } },
      answersMaster: { '삼각함수활용3단계': { '001': '4' } },
    });
    const issue = res.find((r) => r.type === 'KEY_PRESENCE' && r.key === '삼각함수성질3단계');
    expect(issue).toBeTruthy();
    expect(issue.presentIn).toEqual(['avsAnswers']);
    expect(issue.missingFrom).toContain('problemsIndex');
  });

  it('빈 껍데기 단원(값 0개)을 EMPTY_SHELL로 표시한다', () => {
    const res = auditMapping({
      problemsIndex: {},
      avsAnswers: { '삼각함수성질3단계': {} },
      answersMaster: {},
    });
    expect(res.some((r) => r.type === 'EMPTY_SHELL' && r.key === '삼각함수성질3단계')).toBe(true);
  });

  it('같은 루트인데 성질↔활용이 엇갈린 그룹을 ROOT_VARIANT로 묶는다', () => {
    const res = auditMapping({
      problemsIndex: { '삼각함수활용3단계': ['001'] },
      avsAnswers: { '삼각함수성질3단계': {} },
      answersMaster: {},
    });
    expect(res.some((r) => r.type === 'ROOT_VARIANT' && r.stage === '3')).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/mappingAudit.test.js`
Expected: FAIL — `Cannot find module '../mappingAudit.js'`

- [ ] **Step 3: 모듈 구현**

`src/lib/algebraFix/mappingAudit.js`:
```js
import { normalizeUnitKey, isAlgebraKey } from './algebraUnits.js';

function sizeOf(v) {
  if (!v) return 0;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'object') return Object.keys(v).length;
  return 0;
}

// sources: { diskFolders?:string[], problemsIndex, avsAnswers, answersMaster, ssotUnits? }
// 대수 키만 대상으로 불일치 리포트 배열 반환.
export function auditMapping(sources) {
  const { problemsIndex = {}, avsAnswers = {}, answersMaster = {}, diskFolders = [] } = sources;
  const SRC = { problemsIndex, avsAnswers, answersMaster };
  const issues = [];

  // 대수 단원키 합집합
  const allKeys = new Set();
  for (const obj of Object.values(SRC)) {
    Object.keys(obj).filter(isAlgebraKey).forEach((k) => allKeys.add(k));
  }
  diskFolders.filter(isAlgebraKey).forEach((k) => allKeys.add(k));

  // KEY_PRESENCE: 소스 간 존재 여부 차이
  for (const key of allKeys) {
    const presentIn = Object.entries(SRC).filter(([, o]) => key in o).map(([n]) => n);
    const missingFrom = Object.keys(SRC).filter((n) => !(key in SRC[n]));
    if (presentIn.length > 0 && missingFrom.length > 0) {
      issues.push({ type: 'KEY_PRESENCE', key, presentIn, missingFrom });
    }
  }

  // EMPTY_SHELL: 어떤 소스에서 값이 0개
  for (const key of allKeys) {
    for (const [name, obj] of Object.entries(SRC)) {
      if (key in obj && sizeOf(obj[key]) === 0) {
        issues.push({ type: 'EMPTY_SHELL', key, source: name });
      }
    }
  }

  // SIZE_MISMATCH: 같은 키의 소스 간 항목수 차이
  for (const key of allKeys) {
    const sizes = Object.fromEntries(
      Object.entries(SRC).filter(([, o]) => key in o).map(([n, o]) => [n, sizeOf(o[key])])
    );
    const vals = Object.values(sizes).filter((n) => n > 0);
    if (vals.length > 1 && new Set(vals).size > 1) {
      issues.push({ type: 'SIZE_MISMATCH', key, sizes });
    }
  }

  // ROOT_VARIANT: 동일 (정규화 stage) 내 성질↔활용 등 루트 변형 공존
  const byStage = {};
  for (const key of allKeys) {
    const { root, stage } = normalizeUnitKey(key);
    if (!stage) continue;
    (byStage[stage] ||= []).push({ key, root });
  }
  for (const [stage, arr] of Object.entries(byStage)) {
    const roots = new Set(arr.map((a) => a.root));
    const hasSung = [...roots].some((r) => r.includes('성질'));
    const hasHwal = [...roots].some((r) => r.includes('활용'));
    if (hasSung && hasHwal) {
      issues.push({ type: 'ROOT_VARIANT', stage, keys: arr.map((a) => a.key) });
    }
  }

  return issues;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/mappingAudit.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/algebraFix/mappingAudit.js src/lib/algebraFix/__tests__/mappingAudit.test.js
git commit -m "feat(algebra-fix): 단원-문제 매핑 audit 모듈(교차대조 5규칙)"
```

---

### Task 4: Audit 러너 (리포트 생성)

**Files:**
- Create: `scripts/audit_algebra.js`

- [ ] **Step 1: 러너 구현**

`scripts/audit_algebra.js`:
```js
import fs from 'fs';
import path from 'path';
import { detectIssues } from '../src/lib/algebraFix/latexDetect.js';
import { auditMapping } from '../src/lib/algebraFix/mappingAudit.js';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const mathTexts = readJson('public/data/math_problem_texts.json');
const avs = readJson('public/data/avs_answers.json');
const answersMaster = readJson('public/data/answers_master.json');
const problemsIndex = readJson('public/problems_index.json');

// 디스크 폴더(concept_cards)에서 단원 후보 추출
const ccDir = path.join(ROOT, 'public/concept_cards');
const diskFolders = fs.existsSync(ccDir) ? fs.readdirSync(ccDir) : [];

// ---- 매핑 audit ----
const mappingIssues = auditMapping({ problemsIndex, avsAnswers: avs, answersMaster, diskFolders });

// ---- LaTeX audit: A(문제 본문) ----
const latexA = [];
for (const [k, v] of Object.entries(mathTexts)) {
  const unit = k.split('/')[0];
  if (!isAlgebraKey(unit)) continue;
  const issues = detectIssues(typeof v === 'string' ? v : JSON.stringify(v));
  if (issues.length) latexA.push({ key: k, issues });
}

// ---- LaTeX audit: B(AVS 해설 _v2 등 문자열) ----
const latexB = [];
for (const [unit, obj] of Object.entries(avs)) {
  if (!isAlgebraKey(unit) || !obj || typeof obj !== 'object') continue;
  for (const [num, val] of Object.entries(obj)) {
    if (typeof val !== 'string') continue;
    const issues = detectIssues(val);
    if (issues.length) latexB.push({ key: `${unit}/${num}`, value: val, issues });
  }
}

// ---- MD 리포트 출력 ----
const SPEC = 'docs/superpowers/specs';
fs.mkdirSync(path.join(ROOT, SPEC), { recursive: true });

const mapMd = ['# 매핑 audit 리포트 (2026-06-02)', '', `총 이슈: ${mappingIssues.length}`, '']
  .concat(mappingIssues.map((i) => `- **${i.type}** \`${i.key ?? i.stage}\` ${JSON.stringify(i)}`))
  .join('\n');
fs.writeFileSync(path.join(ROOT, SPEC, '2026-06-02-mapping-audit.md'), mapMd);

const latexMd = ['# LaTeX audit 리포트 (2026-06-02)', '',
  `## A. 문제 본문 (${latexA.length}건)`, '']
  .concat(latexA.map((r) => `- \`${r.key}\`: ${r.issues.map((i) => i.code + '/' + i.grade).join(', ')}`))
  .concat(['', `## B. AVS 해설 (${latexB.length}건)`, ''])
  .concat(latexB.map((r) => `- \`${r.key}\`: ${r.issues.map((i) => i.code + '/' + i.grade).join(', ')} — \`${r.value.slice(0, 80)}\``))
  .join('\n');
fs.writeFileSync(path.join(ROOT, SPEC, '2026-06-02-latex-audit.md'), latexMd);

console.log(`[audit] mapping=${mappingIssues.length}, latexA=${latexA.length}, latexB=${latexB.length}`);
```

- [ ] **Step 2: 러너 실행(읽기전용)**

Run: `node scripts/audit_algebra.js`
Expected: stdout `[audit] mapping=N, latexA=N, latexB=N` (N>0), 2개 MD 파일 생성.

- [ ] **Step 3: 산출 리포트 커밋**

```bash
git add -f scripts/audit_algebra.js docs/superpowers/specs/2026-06-02-mapping-audit.md docs/superpowers/specs/2026-06-02-latex-audit.md
git commit -m "chore(algebra-fix): audit 러너 + 매핑/LaTeX audit 리포트 생성"
```

---

### Task 5: 사용자 리뷰 게이트 + 승인 파일 작성 (CHECKPOINT — 코드 아님)

- [ ] **Step 1:** 생성된 두 리포트를 사용자와 함께 검토한다.
- [ ] **Step 2:** 매핑 이동 승인 파일 작성 — `scripts/approvals/mapping_moves.json`:
```json
{
  "moves": [
    { "from": "삼각함수활용3단계", "to": "삼각함수성질3단계", "problems": ["..."], "files": ["avsAnswers", "answersMaster", "problemsIndex"], "reason": "디스크폴더+정답키 대조 결과 성질3 문제가 활용3로 흡수됨" }
  ]
}
```
> 실제 `moves` 항목은 audit 리포트와 디스크 폴더/정답키 대조로 사용자가 케이스별 승인한 것만 채운다. 승인 없으면 빈 `[]`.

- [ ] **Step 3:** LaTeX REVIEW 항목 승인 파일 작성 — `scripts/approvals/latex_review.json`:
```json
{ "B": { "삼각함수활용 4단계(68)/092_v2": "$\\frac{3}{4}+\\frac{\\sqrt{2}}{2}$" } }
```
> 키=`단원/번호`(B) 또는 `단원/NNN.webp`(A), 값=사용자가 확정한 교정 문자열. REVIEW 등급은 전부 여기서 명시적으로 채운다.

- [ ] **Step 4: 승인 파일 커밋**
```bash
git add -f scripts/approvals/mapping_moves.json scripts/approvals/latex_review.json
git commit -m "chore(algebra-fix): 매핑 이동/LaTeX REVIEW 승인 파일"
```

---

## Phase 2 — Fix 엔진 + 적용

### Task 6: AUTO LaTeX 수정 모듈

**Files:**
- Create: `src/lib/algebraFix/latexFix.js`
- Test: `src/lib/algebraFix/__tests__/latexFix.test.js`

- [ ] **Step 1: 실패 테스트 작성**

`src/lib/algebraFix/__tests__/latexFix.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { autoFix } from '../latexFix.js';

describe('autoFix', () => {
  it('\\sqrt5 → \\sqrt{5} 로 보정하고 재렌더 통과하면 채택한다', () => {
    const r = autoFix('$\\sqrt5$');
    expect(r.output).toBe('$\\sqrt{5}$');
    expect(r.applied).toContain('SQRT_BRACE');
  });

  it('재렌더 실패하는 변환은 적용하지 않고 원본 유지 + skipped 기록', () => {
    const r = autoFix('$\\frac{1}{$'); // 보정 불가
    expect(r.output).toBe('$\\frac{1}{$');
    expect(r.skipped.length).toBeGreaterThan(0);
  });

  it('정상 입력은 변경 없이 반환한다', () => {
    const r = autoFix('값 $x^2$');
    expect(r.output).toBe('값 $x^2$');
    expect(r.applied).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/latexFix.test.js`
Expected: FAIL — `Cannot find module '../latexFix.js'`

- [ ] **Step 3: 모듈 구현**

`src/lib/algebraFix/latexFix.js`:
```js
import katex from 'katex';

// 각 $…$ 세그먼트가 렌더 가능한지
function renders(seg) {
  try { katex.renderToString(seg, { throwOnError: true }); return true; }
  catch { return false; }
}

// AUTO 등급 변환만. 변환 후 해당 세그먼트가 katex 통과해야 채택, 아니면 롤백.
const AUTO_TRANSFORMS = [
  { name: 'SQRT_BRACE', fn: (s) => s.replace(/\\sqrt\s*([0-9])(?![0-9{])/g, '\\sqrt{$1}') },
  { name: 'TRIPLE_BACKSLASH', fn: (s) => s.replace(/\\{3,}/g, '\\\\') },
];

export function autoFix(text) {
  if (!text || typeof text !== 'string') return { output: text, applied: [], skipped: [] };
  const applied = [];
  const skipped = [];

  const out = text.replace(/(?<!\\)\$((?:[^$\\]|\\[\s\S])+?)\$/g, (full, seg) => {
    let cur = seg;
    for (const t of AUTO_TRANSFORMS) {
      const next = t.fn(cur);
      if (next === cur) continue;
      if (renders(next)) { cur = next; if (!applied.includes(t.name)) applied.push(t.name); }
      else if (!skipped.includes(t.name)) skipped.push(t.name);
    }
    return `$${cur}$`;
  });

  // 원본이 이미 깨졌고 변환으로도 못 고친 경우 skipped 보강
  if (out === text && /\\frac\{[^}]*\{?$|\\sqrt(?![{0-9])/.test(text)) {
    if (!skipped.length) skipped.push('UNRESOLVED');
  }
  return { output: out, applied, skipped };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npx vitest run src/lib/algebraFix/__tests__/latexFix.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/algebraFix/latexFix.js src/lib/algebraFix/__tests__/latexFix.test.js
git commit -m "feat(algebra-fix): AUTO LaTeX 수정 모듈(재렌더 검증/롤백)"
```

---

### Task 7: LaTeX 수정 적용 러너

**Files:**
- Create: `scripts/fix_algebra_latex.js`

- [ ] **Step 1: 러너 구현**

`scripts/fix_algebra_latex.js`:
```js
import fs from 'fs';
import path from 'path';
import { autoFix } from '../src/lib/algebraFix/latexFix.js';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const p = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const backup = (rel) => fs.copyFileSync(p(rel), p(rel) + '.bak'); // 백업 먼저

const reviewPath = 'scripts/approvals/latex_review.json';
const review = fs.existsSync(p(reviewPath)) ? readJson(reviewPath) : { A: {}, B: {} };
const diff = [];

// ---- A: 문제 본문 ----
const A_FILE = 'public/data/math_problem_texts.json';
backup(A_FILE);
const mathTexts = readJson(A_FILE);
const nextA = { ...mathTexts };
for (const [k, v] of Object.entries(mathTexts)) {
  if (!isAlgebraKey(k.split('/')[0]) || typeof v !== 'string') continue;
  let out = v;
  if (review.A && k in review.A) out = review.A[k];        // 사용자 확정 우선
  else { const r = autoFix(v); out = r.output; }
  if (out !== v) { nextA[k] = out; diff.push({ file: 'A', key: k, before: v, after: out }); }
}
fs.writeFileSync(p(A_FILE), JSON.stringify(nextA, null, 2));

// ---- B: AVS 해설 문자열 ----
const B_FILE = 'public/data/avs_answers.json';
backup(B_FILE);
const avs = readJson(B_FILE);
const nextB = { ...avs };
for (const [unit, obj] of Object.entries(avs)) {
  if (!isAlgebraKey(unit) || !obj || typeof obj !== 'object') continue;
  const nObj = { ...obj };
  for (const [num, val] of Object.entries(obj)) {
    if (typeof val !== 'string') continue;
    const rk = `${unit}/${num}`;
    let out = val;
    if (review.B && rk in review.B) out = review.B[rk];     // REVIEW는 승인분만 적용
    else { const r = autoFix(val); out = r.output; }
    if (out !== val) { nObj[num] = out; diff.push({ file: 'B', key: rk, before: val, after: out }); }
  }
  nextB[unit] = nObj;
}
fs.writeFileSync(p(B_FILE), JSON.stringify(nextB, null, 2));

// ---- diff 리포트 ----
const md = ['# LaTeX 수정 diff (2026-06-02)', '', `총 ${diff.length}건`, '']
  .concat(diff.map((d) => `- [${d.file}] \`${d.key}\`\n  - before: \`${d.before.slice(0, 100)}\`\n  - after: \`${d.after.slice(0, 100)}\``))
  .join('\n');
fs.writeFileSync(p('docs/superpowers/specs/2026-06-02-latex-fix-diff.md'), md);
console.log(`[fix-latex] applied ${diff.length} changes (backups: *.bak)`);
```

- [ ] **Step 2: 러너 실행**

Run: `node scripts/fix_algebra_latex.js`
Expected: stdout `[fix-latex] applied N changes`; `*.bak` 백업 생성; diff 리포트 작성.

- [ ] **Step 3: 즉시 KaTeX 검증**

Run: `npm run check:math-latex`
Expected: 신규 katex_failures 0 (또는 수정 전 대비 감소, 잔여는 REVIEW 미승인분으로 리포트에 명시).

- [ ] **Step 4: 커밋**

```bash
git add -f scripts/fix_algebra_latex.js docs/superpowers/specs/2026-06-02-latex-fix-diff.md public/data/math_problem_texts.json public/data/avs_answers.json
git commit -m "fix(algebra): 대수 문제 본문+AVS 해설 깨진 LaTeX 수정"
```

---

### Task 8: 매핑 이동 적용 러너

**Files:**
- Create: `scripts/apply_mapping_fixes.js`

- [ ] **Step 1: 러너 구현**

`scripts/apply_mapping_fixes.js`:
```js
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const p = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const backup = (rel) => fs.copyFileSync(p(rel), p(rel) + '.map.bak');

const FILE_MAP = {
  avsAnswers: 'public/data/avs_answers.json',
  answersMaster: 'public/data/answers_master.json',
  problemsIndex: 'public/problems_index.json',
};

const approvals = fs.existsSync(p('scripts/approvals/mapping_moves.json'))
  ? readJson('scripts/approvals/mapping_moves.json') : { moves: [] };

const log = [];
for (const move of approvals.moves) {
  for (const fileKey of move.files) {
    const rel = FILE_MAP[fileKey];
    if (!rel) continue;
    backup(rel);
    const data = readJson(rel);
    const next = { ...data };
    const fromVal = data[move.from];
    if (fromVal === undefined) { log.push(`SKIP ${fileKey}: '${move.from}' 없음`); continue; }
    // to 키로 이동(병합). problems 지정 시 해당 번호만 이동, 아니면 전체.
    if (Array.isArray(move.problems) && move.problems.length && typeof fromVal === 'object' && !Array.isArray(fromVal)) {
      const toObj = { ...(next[move.to] || {}) };
      const fromObj = { ...fromVal };
      for (const num of move.problems) { if (num in fromObj) { toObj[num] = fromObj[num]; delete fromObj[num]; } }
      next[move.to] = toObj; next[move.from] = fromObj;
    } else {
      next[move.to] = fromVal; delete next[move.from];
    }
    fs.writeFileSync(p(rel), JSON.stringify(next, null, 2));
    log.push(`OK ${fileKey}: ${move.from} → ${move.to}`);
  }
}
fs.writeFileSync(p('docs/superpowers/specs/2026-06-02-mapping-fix-log.md'),
  ['# 매핑 이동 적용 로그 (2026-06-02)', '', ...log.map((l) => `- ${l}`)].join('\n'));
console.log(`[fix-mapping] ${log.length} ops`);
```

- [ ] **Step 2: 러너 실행**

Run: `node scripts/apply_mapping_fixes.js`
Expected: stdout `[fix-mapping] N ops`; `*.map.bak` 백업; 로그 작성. (승인 moves 없으면 0 ops — 정상)

- [ ] **Step 3: 커밋**

```bash
git add -f scripts/apply_mapping_fixes.js docs/superpowers/specs/2026-06-02-mapping-fix-log.md public/data/avs_answers.json public/data/answers_master.json public/problems_index.json
git commit -m "fix(algebra): 승인된 단원-문제 매핑 이동 적용"
```

---

### Task 9: 적용 CHECKPOINT (코드 아님)

- [ ] **Step 1:** Task 7/8 diff·log 리포트를 사용자와 확인.
- [ ] **Step 2:** 잔여 REVIEW/이동 누락분이 있으면 승인 파일 보강 후 해당 러너 재실행.

---

## Phase 3 — 검증

### Task 10: 회귀 테스트 + 매핑 불변식 + 전체 검증

**Files:**
- Create: `src/lib/algebraFix/__tests__/regression.test.js`

- [ ] **Step 1: 회귀/불변식 테스트 작성**

`src/lib/algebraFix/__tests__/regression.test.js`:
```js
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import katex from 'katex';
import { isAlgebraKey } from '../algebraUnits.js';
import { auditMapping } from '../mappingAudit.js';

const ROOT = process.cwd();
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

describe('수정 후 회귀', () => {
  it('대수 문제 본문의 모든 $…$ 가 KaTeX 렌더 통과', () => {
    const data = readJson('public/data/math_problem_texts.json');
    const failures = [];
    for (const [k, v] of Object.entries(data)) {
      if (!isAlgebraKey(k.split('/')[0]) || typeof v !== 'string') continue;
      const m = v.match(/(?<!\\)\$((?:[^$\\]|\\[\s\S])+?)\$/g) || [];
      for (const seg of m) {
        try { katex.renderToString(seg.slice(1, -1), { throwOnError: true }); }
        catch { failures.push(`${k}: ${seg}`); }
      }
    }
    expect(failures).toEqual([]);
  });

  it('대수 단원에 EMPTY_SHELL 매핑 불일치가 없다', () => {
    const issues = auditMapping({
      problemsIndex: readJson('public/problems_index.json'),
      avsAnswers: readJson('public/data/avs_answers.json'),
      answersMaster: readJson('public/data/answers_master.json'),
    });
    const empties = issues.filter((i) => i.type === 'EMPTY_SHELL');
    expect(empties).toEqual([]);
  });
});
```

- [ ] **Step 2: 테스트 실행**

Run: `npx vitest run src/lib/algebraFix/__tests__/regression.test.js`
Expected: PASS. (실패 시 — 잔여 REVIEW 미승인분 → Task 5/9로 복귀해 승인·재적용)

- [ ] **Step 3: Red-Green 확인(불변식 신뢰성)**

`.bak` 백업으로 원복 후 재실행하여 위 테스트가 FAIL 하는지 확인:
```bash
cp public/data/math_problem_texts.json /tmp/fixed.json && cp public/data/math_problem_texts.json.bak public/data/math_problem_texts.json
npx vitest run src/lib/algebraFix/__tests__/regression.test.js   # FAIL 기대
cp /tmp/fixed.json public/data/math_problem_texts.json           # 복구
npx vitest run src/lib/algebraFix/__tests__/regression.test.js   # PASS 기대
```
Expected: 원본=FAIL, 수정본=PASS (테스트가 실제 수정을 검증함을 증명).

- [ ] **Step 4: 전체 테스트 + 검증**

Run: `npm test && npm run check:math-latex`
Expected: vitest 전체 PASS, check:math-latex 대수 단원 신규 실패 0.

- [ ] **Step 5: 커밋**

```bash
git add src/lib/algebraFix/__tests__/regression.test.js
git commit -m "test(algebra-fix): 수정 후 LaTeX 렌더+매핑 불변식 회귀 테스트"
```

---

## Phase 4 — 3-출처 동기화

### Task 11: public/data → src/data 대수 키 선별 동기화 + 배포 메모

**Files:**
- Create: `scripts/sync_algebra_sources.js`
- Create: `docs/superpowers/specs/2026-06-02-deploy-checklist.md`

- [ ] **Step 1: 동기화 러너 구현**

`scripts/sync_algebra_sources.js`:
```js
import fs from 'fs';
import path from 'path';
import { isAlgebraKey } from '../src/lib/algebraFix/algebraUnits.js';

const ROOT = process.cwd();
const p = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));

// avs_answers: 대수 단원 키만 public→src 반영(비대수 키 보존)
function syncAlgebraKeys(pubRel, srcRel) {
  const pub = readJson(pubRel);
  const src = fs.existsSync(p(srcRel)) ? readJson(srcRel) : {};
  fs.copyFileSync(p(srcRel), p(srcRel) + '.sync.bak');
  const next = { ...src };
  let n = 0;
  for (const [k, v] of Object.entries(pub)) {
    const unit = k.includes('/') ? k.split('/')[0] : k;
    if (isAlgebraKey(unit)) { next[k] = v; n++; }
  }
  fs.writeFileSync(p(srcRel), JSON.stringify(next, null, 2));
  return n;
}

const a = syncAlgebraKeys('public/data/avs_answers.json', 'src/data/avs_answers.json');
const b = syncAlgebraKeys('public/data/math_problem_texts.json', 'src/data/math_problem_texts.json');
console.log(`[sync] avs_answers 대수키 ${a}개, math_problem_texts 대수키 ${b}개 동기화`);
```

- [ ] **Step 2: 동기화 실행**

Run: `node scripts/sync_algebra_sources.js`
Expected: stdout `[sync] avs_answers 대수키 N개, math_problem_texts 대수키 N개 동기화`; `.sync.bak` 백업.

- [ ] **Step 3: src 비대수 키 보존 확인**

Run: `node -e "const a=require('./src/data/avs_answers.json');console.log('src keys after sync:',Object.keys(a).length)"`
Expected: 동기화 전 181키 이상 유지(비대수 키 손실 없음).

- [ ] **Step 4: 배포 체크리스트 작성**

`docs/superpowers/specs/2026-06-02-deploy-checklist.md`:
```markdown
# 배포 체크리스트 — 수1(대수) 수정 반영

런타임은 `/data/` (public/data) fetch가 우선이며 실패 시 Supabase Storage `mentos-assets/data/`로 폴백한다.
따라서 production 일관성을 위해 아래를 배포 시 갱신해야 한다.

- [ ] `public/data/math_problem_texts.json` 빌드 포함 확인
- [ ] `public/data/avs_answers.json` 빌드 포함 확인
- [ ] Supabase Storage `mentos-assets/data/math_problem_texts.json` 업로드(사용자 권한)
- [ ] Supabase Storage `mentos-assets/data/avs_answers.json` 업로드(사용자 권한)
- [ ] `public/problems_index.json` / `public/data/answers_master.json` 매핑 변경분 반영
- [ ] 배포 후 대수 단원 1~2개 실기기 렌더 확인(삼각함수 성질3/활용3 포함)
```

- [ ] **Step 5: 백업 산출물 정리 + 커밋**

```bash
# 검증 완료 후 백업 제거(또는 .gitignore 확인). 백업은 커밋하지 않음.
rm -f public/data/*.bak public/data/*.map.bak public/data/*.sync.bak public/problems_index.json.map.bak src/data/*.sync.bak
git add -f scripts/sync_algebra_sources.js docs/superpowers/specs/2026-06-02-deploy-checklist.md src/data/avs_answers.json src/data/math_problem_texts.json
git commit -m "chore(algebra-fix): public→src 대수키 동기화 + 배포 체크리스트"
```

---

## Self-Review 결과

- **Spec 커버리지:** A(문제 LaTeX)=Task 2/4/6/7, B(AVS LaTeX)=Task 2/4/6/7, C(매핑)=Task 3/4/8, 3-출처 동기화=Task 11, 에러처리(백업/try-catch/불변성)=각 러너, 테스트(회귀/Red-Green/불변식)=Task 10. 모든 스펙 섹션에 대응 태스크 존재.
- **플레이스홀더:** TBD/TODO 없음. 각 코드 스텝은 실제 동작 코드. Task 5/9의 승인 JSON 예시값은 사용자가 audit 결과로 채우는 입력 양식임을 명시.
- **타입 일관성:** `isAlgebraKey`/`normalizeUnitKey`(Task1), `detectIssues`(Task2), `auditMapping`(Task3), `autoFix`(Task6) 시그니처가 러너(Task4/7/8/11)에서 동일하게 사용됨. `applied`/`skipped`/`output` 필드명 일관.
- **주의:** Task 5/9는 사용자 승인 게이트(코드 아님). 승인 파일이 비어 있으면 자동 변환분만 적용되고 REVIEW/이동건은 보류된다.

---

## REVISED SCOPE (post-audit, 2026-06-02) — T5 게이트 결과 반영

audit 실행(T1~T4) 후 사용자 검토에서 다음이 확정되어 T6~T8 범위를 조정한다.

### 발견 1 — 성질3↔활용3 가설 불성립
활용3단계 읽을 수 있는 문제(001~032) 전수 분석 결과 **모두 진짜 활용**(사인·코사인법칙/넓이/외접·내접원/입체), 성질 유형 0건. 033~051은 미OCR placeholder. → **성질3는 활용3에 섞인 게 아니라 애초 로드된 적 없음.** 이동(move) 불필요.
- **조치:** 매핑 수정은 '이동'이 아니라 **'삭제'**. `삼각함수성질3단계` 빈 키 + `_백업_완료`/`_완료백업` 잔재 키 제거. 실제 성질3 문제는 추후 소스 확보 시 별도 로드.

### 발견 2 — LaTeX 깨짐 실수치는 ~795가 아니라 ~82
앱 렌더러 `MathProblemRenderer.jsx`의 `normalizeMathText`가 출력 전 **리터럴 `\n`(역슬래시+n)을 줄바꿈으로 변환**하고 `\neq`/`\leq`/`\newline` 등은 보호한다. 검출기(T2)가 이 전처리를 안 거쳐 700여 건을 헛집계. **정규화 적용 시 전체 322건 / 대수 단원 실제 깨짐 ≈ 82건(AUTO 18 + REVIEW 64).**
- **AUTO 2규칙(검증됨):** ① APPEND-CLOSE — 보기줄(`①~⑤`)에 `$` 1개이고 줄 끝이 아니며 `$` 뒤 중괄호 균형이면 끝에 `$` 보강 (`① $1`→`① $1$`). ② REMOVE-STRAY — 보기줄에 `$` 1개이고 줄 끝이면 그 `$` 제거 (`⑤ 3$`→`⑤ 3`). 적용 후 각 `$…$` katex 재렌더 통과 필수.
- REVIEW(~64): stem-옵션 미분리(C), 해설 수식 절단(D), 인접 span 내부 stray `$`(E) — 자동 금지, 배치로 사용자 확정.
- AVS 해설 B(84건, `frac34` 류 plaintext)는 별도 — 대부분 REVIEW.

### 조정된 태스크
- **T6(개정):** `src/lib/algebraFix/normalize.js`(렌더러 `normalizeMathText` 미러) 신설 + 테스트. `latexDetect`/`latexFix`가 normalize 선적용. `latexFix.autoFix`는 APPEND-CLOSE/REMOVE-STRAY 2규칙(보기줄 한정, brace 균형 가드, katex 재렌더 채택).
- **T7(개정):** latex 적용 러너 — normalize 인지, AUTO 18 적용 + REVIEW 목록 산출(배치 확정용), AVS B 84 별도 섹션.
- **T8(개정):** 매핑 **삭제** 러너 — `scripts/approvals/mapping_deletes.json` 기반 키 삭제. problems_index 백업키는 **비접미 base 단원이 동일 파일에 존재할 때만** 삭제(데이터 손실 가드). 백업 먼저.
- 삭제 목록: problems_index 10키 + avs_answers 8키(성질3 포함). answers_master 해당 없음.
