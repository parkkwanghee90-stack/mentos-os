# 난이도 상향 대량화 러너 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 미게시 ~109교 예상문제를 원본 킬러급으로, 한도에 막혀도 /loop로 자동 재개하며 생성→검수 게이트로 전수 상향한다.

**Architecture:** 결정적 단위(트래커·선택기·번들빌더)는 `scripts/blog_auto/lib`와 cjs로 구현·테스트하고, 비결정적 단위(학교당 생성/검수)는 프롬프트 템플릿으로 고정한다. 오케스트레이션은 `RUNBOOK.md` 절차를 따르는 /loop 턴(턴=배치 5교)이 수행: 선택기→생성5→검수5→트래커 갱신→배치 커밋, 3배치마다 번들 재빌드+배포.

**Tech Stack:** Node.js (CommonJS) 스크립트, `node:assert` 테스트, 기존 `scripts/exam_predict/06_bundle.cjs`·`scripts/build_hero_showcase.cjs`, Vite 빌드 + Vercel 배포, Agent 툴(서브에이전트), ScheduleWakeup(/loop).

---

## File Structure

| 파일 | 책임 |
|---|---|
| `scripts/blog_auto/posted.json` (생성) | 네이버 게시 12교 (grade,slug) — 선택기 제외 입력 |
| `scripts/blog_auto/difficulty_progress.json` (수정) | 트래커 상태: done/deferred/needs_review/needs_source |
| `scripts/blog_auto/lib/tracker.cjs` (생성) | 트래커 로드/저장/상태전이/한도신호 감지 |
| `scripts/blog_auto/lib/tracker.test.cjs` (생성) | tracker 단위 테스트 |
| `scripts/blog_auto/next_pick.cjs` (생성) | 선택기: done∪needs_*∪posted 제외, 강남/분당 우선, go1→go2, 다음 N |
| `scripts/blog_auto/next_pick.test.cjs` (생성) | 선택기 단위 테스트 |
| `scripts/blog_auto/deploy_bundles.cjs` (생성) | go1+go2 번들 + 대문 캐러셀 재빌드(배포 전) |
| `scripts/blog_auto/prompts/generate.md` (생성) | 학교당 생성 에이전트 프롬프트 템플릿 |
| `scripts/blog_auto/prompts/verify.md` (생성) | 학교당 검수 에이전트 프롬프트 템플릿 |
| `scripts/blog_auto/RUNBOOK.md` (생성) | /loop 한 턴(배치) 수행 절차 — 오케스트레이터용 |

기존 `next_go1.cjs`는 `next_pick.cjs`로 대체(go1 전용 → go1+go2·상태인지). Task 4에서 삭제.

---

### Task 1: 게시교 목록 + 트래커 스키마 확장

**Files:**
- Create: `scripts/blog_auto/posted.json`
- Modify: `scripts/blog_auto/difficulty_progress.json`

- [ ] **Step 1: 게시 12교 목록 작성**

Create `scripts/blog_auto/posted.json` (네이버 mthmentoslab RSS 기준, 전부 고1 분석 게시분):

```json
[
  { "grade": "go1", "slug": "낙동고" },
  { "grade": "go1", "slug": "화명고" },
  { "grade": "go1", "slug": "금명여고" },
  { "grade": "go1", "slug": "금곡고" },
  { "grade": "go1", "slug": "현대고" },
  { "grade": "go1", "slug": "풍산고" },
  { "grade": "go1", "slug": "잠신고" },
  { "grade": "go1", "slug": "중동고" },
  { "grade": "go1", "slug": "불곡고" },
  { "grade": "go1", "slug": "돌마고" },
  { "grade": "go1", "slug": "풍덕고" },
  { "grade": "go1", "slug": "영덕여고" }
]
```

- [ ] **Step 2: 트래커에 빈 상태 배열 추가**

`scripts/blog_auto/difficulty_progress.json`을 열어 최상위에 `deferred`, `needs_review`, `needs_source` 빈 배열을 추가한다(기존 `done` 22개·`failed`·`note` 유지). 결과 최상위 키:
`{ "note": "...", "done": [...22], "deferred": [], "needs_review": [], "needs_source": [], "failed": [...] }`
(`failed`는 레거시로 둔다 — tracker.cjs는 무시.)

- [ ] **Step 3: JSON 유효성 확인**

Run: `node -e "JSON.parse(require('fs').readFileSync('scripts/blog_auto/posted.json')); JSON.parse(require('fs').readFileSync('scripts/blog_auto/difficulty_progress.json')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add scripts/blog_auto/posted.json scripts/blog_auto/difficulty_progress.json
git commit -m "feat(diff-runner): 게시12교 목록 + 트래커 상태배열(deferred/needs_review/needs_source)"
```

---

### Task 2: 트래커 라이브러리 (tracker.cjs)

**Files:**
- Create: `scripts/blog_auto/lib/tracker.cjs`
- Test: `scripts/blog_auto/lib/tracker.test.cjs`

- [ ] **Step 1: 실패 테스트 작성**

Create `scripts/blog_auto/lib/tracker.test.cjs`:

```js
const assert = require('node:assert');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const T = require('./tracker.cjs');

const tmp = path.join(os.tmpdir(), `tracker_test_${process.pid}.json`);
fs.writeFileSync(tmp, JSON.stringify({ done: [{ grade: 'go1', slug: '가락고' }] }));

const t = T.load(tmp);
assert.deepStrictEqual(t.deferred, [], 'missing lists default to []');
assert.strictEqual(T.status(t, 'go1', '가락고'), 'done');
assert.strictEqual(T.status(t, 'go2', '휘문고'), null);

// mark moves between lists and is idempotent (no dup, promoted out of old list)
T.mark(t, 'go2', '휘문고', 'deferred', { reason: 'limit' });
assert.strictEqual(T.status(t, 'go2', '휘문고'), 'deferred');
T.mark(t, 'go2', '휘문고', 'done');
assert.strictEqual(T.status(t, 'go2', '휘문고'), 'done');
assert.strictEqual(t.deferred.length, 0, 'removed from deferred when promoted to done');
T.mark(t, 'go2', '휘문고', 'done'); // repeat
assert.strictEqual(t.done.filter(e => e.slug === '휘문고').length, 1, 'no duplicate done');

// limit signal detection
assert.ok(T.isLimitSignal("You've hit your weekly limit · resets 6pm (Asia/Seoul)"));
assert.ok(T.isLimitSignal('session limit'));
assert.ok(!T.isLimitSignal('all three files written and verified, done'));

T.save(t, tmp);
const reloaded = T.load(tmp);
assert.strictEqual(T.status(reloaded, 'go2', '휘문고'), 'done', 'save/load round-trip');

fs.unlinkSync(tmp);
console.log('tracker.test OK');
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node scripts/blog_auto/lib/tracker.test.cjs`
Expected: FAIL — `Cannot find module './tracker.cjs'`

- [ ] **Step 3: tracker.cjs 구현**

Create `scripts/blog_auto/lib/tracker.cjs`:

```js
/** 난이도 상향 트래커: 학교별 상태(done/deferred/needs_review/needs_source) 관리. */
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'difficulty_progress.json');
const LISTS = ['done', 'deferred', 'needs_review', 'needs_source'];
const key = (grade, slug) => `${grade}:${slug}`;

function load(file = FILE) {
  const t = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const l of LISTS) if (!Array.isArray(t[l])) t[l] = [];
  return t;
}
function save(t, file = FILE) {
  fs.writeFileSync(file, JSON.stringify(t, null, 2));
}
function status(t, grade, slug) {
  for (const l of LISTS) if ((t[l] || []).some(e => e.grade === grade && e.slug === slug)) return l;
  return null;
}
function mark(t, grade, slug, st, extra = {}) {
  if (!LISTS.includes(st)) throw new Error(`bad status: ${st}`);
  for (const l of LISTS) t[l] = (t[l] || []).filter(e => !(e.grade === grade && e.slug === slug));
  t[st].push({ grade, slug, ...extra });
  return t;
}
function isLimitSignal(text) {
  return /session limit|weekly limit|usage limit|토큰.{0,4}한도|한도.{0,6}리셋|resets \d/i.test(String(text || ''));
}

module.exports = { load, save, status, mark, key, isLimitSignal, LISTS, FILE };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node scripts/blog_auto/lib/tracker.test.cjs`
Expected: `tracker.test OK`

- [ ] **Step 5: Commit**

```bash
git add scripts/blog_auto/lib/tracker.cjs scripts/blog_auto/lib/tracker.test.cjs
git commit -m "feat(diff-runner): 트래커 라이브러리(상태전이·한도신호 감지) + 테스트"
```

---

### Task 3: 선택기 (next_pick.cjs)

**Files:**
- Create: `scripts/blog_auto/next_pick.cjs`
- Test: `scripts/blog_auto/next_pick.test.cjs`

- [ ] **Step 1: 실패 테스트 작성**

Create `scripts/blog_auto/next_pick.test.cjs`:

```js
const assert = require('node:assert');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { pick } = require('./next_pick.cjs');

const emptyPosted = path.join(os.tmpdir(), `posted_empty_${process.pid}.json`);
fs.writeFileSync(emptyPosted, '[]');
const PRI = ['강남', '서초', '송파', '분당', '성남'];

// 빈 트래커·빈 게시: go1 우선, 강남/분당 우선, 개수 준수
const t0 = { done: [], deferred: [], needs_review: [], needs_source: [] };
const r = pick(5, { tracker: t0, postedFile: emptyPosted });
assert.strictEqual(r.length, 5, 'returns N');
assert.ok(r.every(x => x.grade === 'go1'), 'go1 before go2');
assert.ok(PRI.some(k => r[0].region.includes(k)), 'priority region first');

// 제외: done·needs_review·게시는 큐에서 빠진다
const t1 = { done: [{ grade: 'go1', slug: r[0].slug }], deferred: [], needs_review: [{ grade: 'go1', slug: r[1].slug }], needs_source: [] };
const r1 = pick(50, { tracker: t1, postedFile: emptyPosted });
assert.ok(!r1.some(x => x.grade === 'go1' && x.slug === r[0].slug), 'done excluded');
assert.ok(!r1.some(x => x.grade === 'go1' && x.slug === r[1].slug), 'needs_review excluded');

// deferred 는 다시 뽑힌다(제외 아님)
const t2 = { done: [], deferred: [{ grade: 'go1', slug: r[0].slug }], needs_review: [], needs_source: [] };
const r2 = pick(50, { tracker: t2, postedFile: emptyPosted });
assert.ok(r2.some(x => x.grade === 'go1' && x.slug === r[0].slug), 'deferred is re-picked');

// 큐 소진: 모든 go1·go2를 done 처리하면 빈 배열
fs.unlinkSync(emptyPosted);
console.log('next_pick.test OK');
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node scripts/blog_auto/next_pick.test.cjs`
Expected: FAIL — `Cannot find module './next_pick.cjs'`

- [ ] **Step 3: next_pick.cjs 구현**

Create `scripts/blog_auto/next_pick.cjs`:

```js
/** 난이도 상향 선택기: done∪needs_review∪needs_source∪게시 제외, 강남/분당 우선, go1→go2, 다음 N개. */
const fs = require('node:fs');
const path = require('node:path');
const T = require('./lib/tracker.cjs');

const ROOT = path.join(__dirname, '..', '..');
const POSTED = path.join(__dirname, 'posted.json');
const BUNDLES = {
  go1: 'src/data/exam_predict/exam_predict_bundle.json',
  go2: 'src/data/exam_predict_go2/exam_predict_bundle.json',
};
const RAWPNG = {
  go1: 'src/data/exam_predict/raw_png',
  go2: 'src/data/exam_predict_go2/raw_png',
};
const PRI = ['강남', '서초', '송파', '분당', '성남'];

function rawPngDir(grade, slug) { return path.join(ROOT, RAWPNG[grade], slug); }

function pick(n = 5, opts = {}) {
  const t = opts.tracker || T.load();
  const posted = JSON.parse(fs.readFileSync(opts.postedFile || POSTED, 'utf8'));
  const excluded = new Set();
  for (const l of ['done', 'needs_review', 'needs_source']) for (const e of (t[l] || [])) excluded.add(T.key(e.grade, e.slug));
  for (const e of posted) excluded.add(T.key(e.grade, e.slug));

  const out = [];
  for (const grade of ['go1', 'go2']) {          // go1 먼저
    const schools = JSON.parse(fs.readFileSync(path.join(ROOT, BUNDLES[grade]), 'utf8')).schools || [];
    const cand = schools
      .filter(s => !excluded.has(T.key(grade, s.slug)))
      .map(s => ({ grade, slug: s.slug, region: s.region || '' }))
      .sort((a, b) => {
        const pa = PRI.findIndex(k => a.region.includes(k));
        const pb = PRI.findIndex(k => b.region.includes(k));
        const sa = pa < 0 ? 99 : pa, sb = pb < 0 ? 99 : pb;
        return sa - sb || a.region.localeCompare(b.region, 'ko') || a.slug.localeCompare(b.slug, 'ko');
      });
    out.push(...cand);
  }
  return out.slice(0, n);
}

if (require.main === module) {
  const n = parseInt(process.argv[2] || '5', 10);
  const picked = pick(n);
  if (!picked.length) { console.log('QUEUE_EMPTY'); process.exit(0); }
  for (const p of picked) {
    console.log(`${p.grade}\t${p.slug}\t${p.region}\traw_png=${fs.existsSync(rawPngDir(p.grade, p.slug)) ? 'O' : 'X'}`);
  }
}

module.exports = { pick, rawPngDir };
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `node scripts/blog_auto/next_pick.test.cjs`
Expected: `next_pick.test OK`

- [ ] **Step 5: 실제 다음 5개 확인(스모크)**

Run: `node scripts/blog_auto/next_pick.cjs 5`
Expected: 5줄 출력, 각 `go1\t<학교>\t<지역>\traw_png=O`, 상위는 강남/분당 지역.

- [ ] **Step 6: Commit**

```bash
git add scripts/blog_auto/next_pick.cjs scripts/blog_auto/next_pick.test.cjs
git commit -m "feat(diff-runner): 선택기(상태·게시 제외 + 강남/분당 우선 + go1→go2) + 테스트"
```

---

### Task 4: 레거시 선택기 제거

**Files:**
- Delete: `scripts/blog_auto/next_go1.cjs`

- [ ] **Step 1: 참조 없음 확인**

Run: `grep -rn "next_go1" scripts/ docs/ 2>/dev/null | grep -v next_pick`
Expected: 출력 없음(어떤 코드도 next_go1을 require하지 않음).

- [ ] **Step 2: 삭제 + Commit**

```bash
git rm scripts/blog_auto/next_go1.cjs
git commit -m "chore(diff-runner): next_go1.cjs 제거(next_pick.cjs로 대체)"
```

---

### Task 5: 번들 재빌드 헬퍼 (deploy_bundles.cjs)

**Files:**
- Create: `scripts/blog_auto/deploy_bundles.cjs`

- [ ] **Step 1: 구현**

Create `scripts/blog_auto/deploy_bundles.cjs`:

```js
/** 배포 전 권위 재빌드: go1+go2 번들 + 대문 캐러셀. (개별 에이전트가 번들 건드린 것 클린 복구) */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const ROOT = path.join(__dirname, '..', '..');

function run(args, env) {
  execFileSync('node', args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });
}

run(['scripts/exam_predict/06_bundle.cjs']);
run(['scripts/exam_predict/06_bundle.cjs'], { EXAM_OUT_BASE: 'src/data/exam_predict_go2' });
run(['scripts/build_hero_showcase.cjs']);
console.log('bundles+showcase rebuilt');
```

- [ ] **Step 2: 스모크 실행**

Run: `node scripts/blog_auto/deploy_bundles.cjs`
Expected: `[06] 번들 81개 ...`, `[06] 번들 53개 ...`, `HERO_EXAM_SHOWCASE...`, 마지막 `bundles+showcase rebuilt`.

- [ ] **Step 3: Commit**

```bash
git add scripts/blog_auto/deploy_bundles.cjs
git commit -m "feat(diff-runner): 배포 전 번들+캐러셀 권위 재빌드 헬퍼"
```

---

### Task 6: 생성 프롬프트 템플릿 (prompts/generate.md)

**Files:**
- Create: `scripts/blog_auto/prompts/generate.md`

- [ ] **Step 1: 작성**

Create `scripts/blog_auto/prompts/generate.md` (오케스트레이터가 `{{...}}`를 치환해 Agent에 전달):

```markdown
너는 최상위권 내신 수학 출제자다. 기존 예상문제가 **원본보다 쉽다**는 검수로 **원본 킬러 난이도로 전면 재생성**한다. 대상 = **{{SCHOOL}}**({{GRADE_LABEL}} {{SUBJECT}}{{REGION}}). 작업 디렉터리 /Users/user/mathmentos.

## 1) 원본 정독
`{{RAWPNG_DIR}}/` p*.png 전부 Read(이미지). **킬러 6~8문항 난이도 장치 분석**: {{KILLER_HINTS}}. 배점·서술형 위치.

## 2) 현재 카드
`{{CARD_DIR}}/{{SCHOOL}}.json` — 단원분포·객/서 비율·문항수 유지, **난이도만 원본 수준으로**.

## 3) 재생성 원칙 (필수)
- **숫자만 바꾸지 마라. 단계·결합·역추론·경우분리 원본 동급.** 공식 1~2번 적용 단답 금지.
- **'심화'는 진짜만**(단순 n회 대입·공식직대입은 '기본'으로, 라벨 인플레 금지).
- **정답·풀이 자가검산 필수**(node/python로 60문항=20×3라운드 재계산). 풀이 논리 깨짐 금지.
- 오리지널(원본 복제 금지)·난이도 원본 동급. KaTeX 엄수: $짝, `\(``\)`금지, 수식속 한글 `\text{}`, `${...}`(JS템플릿) 금지, `${}_n\mathrm{P}_r` 같은 조합기호는 정상, 깨짐 0.

## 4) 산출물(덮어쓰기, 기존 스키마 유지)
- predicted.problems(round1 20)+rounds=[r1,r2,r3](r2·r3 숫자변형·정답재계산), 각 {num,unit,level,type,latex,choices,answer,solution}.
- AVS 6~8(서술형+심화핵심) PCBSA 5단계. analysis의 advanced_ratio·difficulty_stars 정직 갱신.
- `{{CARD_DIR}}/{{SCHOOL}}.json` 와 같은 디렉터리 구조의 cards/predicted/analysis 3파일 모두 갱신. **번들은 건드리지 말 것**(오케스트레이터가 일괄 재빌드).

## 5) 검증+보고
Bash: JSON파싱·각round20·객answer1~5·`grep -o '\${[A-Za-z_]'`누출0·문항별$짝·AVS6~8·정답 독립재계산 일치. 보고는 학교명/심화수/서술형수/검증결과만 간결히.
```

- [ ] **Step 2: 플레이스홀더 확인**

Run: `grep -o "{{[A-Z_]*}}" scripts/blog_auto/prompts/generate.md | sort -u`
Expected: `{{CARD_DIR}}`, `{{GRADE_LABEL}}`, `{{KILLER_HINTS}}`, `{{RAWPNG_DIR}}`, `{{REGION}}`, `{{SCHOOL}}`, `{{SUBJECT}}` 가 모두 등장.

- [ ] **Step 3: Commit**

```bash
git add scripts/blog_auto/prompts/generate.md
git commit -m "feat(diff-runner): 학교당 생성 프롬프트 템플릿"
```

---

### Task 7: 검수 프롬프트 템플릿 (prompts/verify.md)

**Files:**
- Create: `scripts/blog_auto/prompts/verify.md`

- [ ] **Step 1: 작성**

Create `scripts/blog_auto/prompts/verify.md`:

```markdown
너는 엄격한 수학 시험 난이도 감수관이다. **원본 기출**과 우리가 방금 재생성한 **예상문제**의 난이도가 동급인지 비판적으로 대조하라. 대상 = **{{SCHOOL}}**({{GRADE_LABEL}} {{SUBJECT}}). 작업 디렉터리 /Users/user/mathmentos.

## 읽을 것
1. 원본: `{{RAWPNG_DIR}}/` p*.png 전부 Read(이미지). 최고난도(킬러) 문항·장치 파악.
2. 우리: `{{CARD_DIR}}/{{SCHOOL}}.json` 의 predicted.problems(또는 rounds[0]).

## 판정 기준
- 원본 킬러와 우리 최고난도가 **같은 수준**인가? 단계 수·결합·역추론·경우분리.
- 우리 문제가 숫자만 쉽거나, 다단계를 단순화했거나, 변별 장치를 빠뜨렸는지.
- '심화' 표기가 실제 심화급인지(라벨 인플레 여부).

## 출력 (마지막 줄에 기계판독용 한 줄 필수)
- 근거: 원본 킬러 2~3개 인용 + 우리 대응 1:1 비교, 격차 있으면 적시.
- **마지막 줄에 정확히** `VERDICT: 적정` 또는 `VERDICT: 쉬움` 중 하나만. (쉬우면 어느 문항을 어떻게 올려야 하는지 1~2줄 함께)
```

- [ ] **Step 2: 플레이스홀더·판정마커 확인**

Run: `grep -c "VERDICT:" scripts/blog_auto/prompts/verify.md`
Expected: `2` (적정/쉬움 두 줄).

- [ ] **Step 3: Commit**

```bash
git add scripts/blog_auto/prompts/verify.md
git commit -m "feat(diff-runner): 학교당 검수 프롬프트 템플릿(VERDICT 기계판독)"
```

---

### Task 8: 오케스트레이션 런북 (RUNBOOK.md)

**Files:**
- Create: `scripts/blog_auto/RUNBOOK.md`

- [ ] **Step 1: 작성**

Create `scripts/blog_auto/RUNBOOK.md`:

```markdown
# 난이도 상향 대량화 — /loop 런북 (오케스트레이터용)

한 /loop 턴 = 한 배치(5교). 매 턴 아래 절차를 수행한다.

## 0) 직전 한도 여부
- 직전 턴이 한도(deferred 다수)로 끝났고 리셋 전이면: 작업 생략, ScheduleWakeup(1200~3600s) 후 종료.

## 1) 다음 배치 선택
- `node scripts/blog_auto/next_pick.cjs 5` 실행.
- 출력이 `QUEUE_EMPTY` 면: 최종 배포(4단계) 후 ScheduleWakeup 생략(루프 종료).
- `raw_png=X` 인 학교는 즉시 `needs_source`로 트래커 기록(아래 6단계 헬퍼)하고 배치에서 빼고 다음 후보로 채운다.

## 2) 생성 (병렬 5)
- 각 학교에 `prompts/generate.md`의 `{{...}}`를 치환해 Agent(general-purpose) 5개 병렬 dispatch.
  - go1 → GRADE_LABEL=고1, SUBJECT=공통수학1, CARD_DIR=src/data/exam_predict/cards, RAWPNG_DIR=src/data/exam_predict/raw_png/<학교>
  - go2 → GRADE_LABEL=고2, SUBJECT=수학Ⅰ, CARD_DIR=src/data/exam_predict_go2/cards, RAWPNG_DIR=src/data/exam_predict_go2/raw_png/<학교>
  - KILLER_HINTS: go1=「행렬 거듭제곱·미정계수, 1의세제곱근 ω 다항합·주기, 경우의수 색칠·포함배제·이웃배치, 판별식 다중계수 케이스, 절댓값·연립부등식 정수해 역추적, 이차함수+도형 결합, 복소수 켤레」 / go2=「부분합→일반항 역산, 절댓값·분기 점화식 추적, 등차 부호변화 역추적, 도형결합(사인변비→넓이역산→코사인→이등분), (가)(나)(다) 동시조건, 경우분리 3+」
- 에이전트 보고에 한도신호(tracker.isLimitSignal)가 있으면 그 학교는 `deferred`로 기록.

## 3) 검수 (병렬, 생성 성공분만)
- 각 성공 학교에 `prompts/verify.md` 치환해 Agent 병렬 dispatch.
- 마지막 줄 `VERDICT: 적정` → `done`. `VERDICT: 쉬움` → 검수 근거를 generate 프롬프트 끝에 덧붙여 **1회 재생성→재검수**. 2회째도 `쉬움`이면 `needs_review`.

## 4) 트래커·커밋·(주기)배포
- 트래커 갱신은 인라인 node로(예시):
  `node -e "const T=require('./scripts/blog_auto/lib/tracker.cjs');const t=T.load();T.mark(t,'go1','개포고','done');T.save(t)"`
- done된 학교의 cards/predicted/analysis + difficulty_progress.json 커밋·푸시.
- **3배치마다 또는 QUEUE_EMPTY**: `node scripts/blog_auto/deploy_bundles.cjs` → `rm -rf dist && npm run build && npm run deploy` → 라이브 index 청크 일치 검증.

## 5) 다음 깨움
- 작업 진행됨 → ScheduleWakeup(약 270s, 캐시 유지)로 다음 배치.
- 한도로 막힘 → ScheduleWakeup(1200~3600s).
- QUEUE_EMPTY → ScheduleWakeup 생략(종료).

## 6) needs_source 기록 헬퍼
`node -e "const T=require('./scripts/blog_auto/lib/tracker.cjs');const t=T.load();T.mark(t,'<grade>','<slug>','needs_source');T.save(t)"`
```

- [ ] **Step 2: Commit**

```bash
git add scripts/blog_auto/RUNBOOK.md
git commit -m "feat(diff-runner): /loop 오케스트레이션 런북"
```

---

### Task 9: 통합 드라이런 (1배치, 배포 제외)

**Files:** (코드 변경 없음 — 절차 검증)

- [ ] **Step 1: 모든 단위 테스트 일괄 실행**

Run: `node scripts/blog_auto/lib/tracker.test.cjs && node scripts/blog_auto/next_pick.test.cjs`
Expected: `tracker.test OK` 와 `next_pick.test OK` 둘 다 출력.

- [ ] **Step 2: 1배치 수동 드라이런**

RUNBOOK 1~3단계를 **5교 한 배치**에 대해 1회 수동 수행(생성 5 → 검수 5). 검수 `적정`이 나오는지, 트래커가 done으로 갱신되는지 확인. 배포(4단계 후반)는 **생략**.
Expected: 5교 중 대부분 `VERDICT: 적정`, 트래커 done 5 증가, KaTeX/정답 검증 통과.

- [ ] **Step 3: 트래커 일관성 확인**

Run: `node -e "const T=require('./scripts/blog_auto/lib/tracker.cjs');const t=T.load();const all=[...t.done,...t.deferred,...t.needs_review,...t.needs_source];const k=all.map(e=>e.grade+':'+e.slug);console.log('total',k.length,'unique',new Set(k).size)"`
Expected: `total` 과 `unique` 가 같다(한 학교가 두 상태에 동시 존재하지 않음).

- [ ] **Step 4: Commit (드라이런 결과 트래커)**

```bash
git add scripts/blog_auto/difficulty_progress.json src/data/exam_predict*/cards src/data/exam_predict*/predicted src/data/exam_predict*/analysis
git commit -m "chore(diff-runner): 통합 드라이런 1배치(5교) 상향 + 트래커 갱신"
```

---

### Task 10: 전체 가동 (/loop)

**Files:** (코드 변경 없음)

- [ ] **Step 1: /loop 시작**

사용자가 `/loop 난이도 상향 계속 (RUNBOOK 따라 5교씩, 한도면 자고 재개)` 형태로 시작하거나, 오케스트레이터가 RUNBOOK을 매 턴 수행하며 ScheduleWakeup으로 자가 페이싱.

- [ ] **Step 2: 종료 조건**

`next_pick.cjs`가 `QUEUE_EMPTY` 반환 → 최종 번들 재빌드+배포 후 루프 종료. `needs_review`/`needs_source` 목록을 사용자에게 보고.

---

## Self-Review

**Spec coverage:**
- 트래커(§4.1) → Task 1·2 ✓
- 선택기(§4.2) → Task 3 ✓
- 배치 러너 생성→검수→재큐(§4.3) → 프롬프트 Task 6·7 + 런북 Task 8 + 드라이런 Task 9 ✓
- 주기 배포(§4.4) → Task 5 + 런북 4단계 ✓
- /loop 셀프페이싱(§4.5) → 런북 0·5단계 + Task 10 ✓
- 엣지(§6): 한도=deferred(런북2·tracker), raw_png없음=needs_source(런북1·6), 2회쉬움=needs_review(런북3), 동명이교=(grade,slug)키(tracker/picker), 번들오염=deploy_bundles 클린재빌드 ✓
- 성공기준(§7)/테스트(§8) → Task 9 ✓

**Placeholder scan:** generate.md/verify.md의 `{{...}}`는 의도된 치환 토큰(런북 2·3단계에 치환 규칙 명시). 코드/테스트에 TODO·미완 없음.

**Type consistency:** tracker API(`load/save/status/mark/key/isLimitSignal/LISTS`)가 next_pick.cjs·런북·테스트에서 동일 시그니처로 사용. mark의 status 인자는 LISTS 멤버만. picker의 `pick(n, {tracker, postedFile})` 시그니처가 테스트와 일치.
