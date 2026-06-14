# 원의방정식 2단계 살아 움직이는 도형 (파일럿) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 원의방정식 2단계 50문제를 흰 좌표평면 + 검정 단색의 단계별 빌드업 도형으로 만든다(정적·빈 도형 없음).

**Architecture:** (1) 렌더러 스타일을 흰배경/검정으로 코드 변경, (2) 데이터 파이프라인(분산기·작도·좌표검산·업로더)으로 각 문제 JSON의 step별 `objects`를 채워 Supabase 스토리지에 덮어쓴다. 앱은 런타임에 fetch해 `base_figure + step0..현재step objects`를 누적 렌더한다.

**Tech Stack:** React + Mafs(`MathCanvas`), Node fetch 업로드, Python 좌표검산. 데이터는 git이 아니라 Supabase 스토리지(`mentos-assets/math_hints/circle_eq_step2/<pid>.json`).

---

## 파일 구조

- Modify: `src/components/hints/GeometryHintPlayer.jsx` — `.avs-canvas-col` 배경 흰색 + Mafs CSS 변수(검정 축/그리드)
- Modify: `src/components/hints/MathCanvas.jsx` — 객체 기본색 검정 계열
- Create: `scripts/geo/distribute.cjs` — 도형 있는 문제의 base_figure.objects를 step별로 분산(무손실)
- Create: `scripts/geo/verify_coords.cjs` — 작도 좌표가 방정식을 만족하는지 검산
- Create: `scripts/geo/upload_hints.cjs` — `/tmp/geo_out/*.json` → 스토리지 업로드
- 작업 디렉토리: `/tmp/geo_in`(현재 데이터), `/tmp/geo_out`(빌드업 결과). git 추적 안 함.

검증 게이트: ① 빌드 통과, ② 좌표검산 통과, ③ 사용자 라이브 확인(`/inspector` 메뉴7 또는 수학교실).

---

## Task 1: 렌더러 흰배경 + 검정 단색

**Files:**
- Modify: `src/components/hints/GeometryHintPlayer.jsx:475`
- Modify: `src/components/hints/MathCanvas.jsx` (기본색 라인 94/159/160/216/274)

- [ ] **Step 1: 캔버스 배경을 흰색 + Mafs 색변수 지정**

`GeometryHintPlayer.jsx`의 `.avs-canvas-col` 규칙(약 473–476행) 수정:
```
.avs-canvas-col {
  width: 40% !important;
  background: #ffffff !important;            /* 기존 #1e293b → 흰색 */
  --mafs-bg: #ffffff;
  --mafs-fg: #111827;                        /* 축/숫자: 검정 */
  --mafs-line-color: #d1d5db;                /* 그리드: 옅은 회색 */
  --mafs-origin-color: #111827;
  border-radius: 12px !important;
  ...(나머지 기존 속성 유지)...
}
```

- [ ] **Step 2: MathCanvas 객체 기본색을 검정 계열로**

`MathCanvas.jsx`에서 기본색 치환(객체 data에 color가 없을 때의 fallback):
- 94행 `const color = obj.color || '#60a5fa';` → `'#111827'`
- 159–160행 point/label `obj.color || '#4ade80'` → `obj.color || '#111827'` (2곳)
- 178·200·203·216행 `'#f59e0b'`/`'#ec4899'` → `'#111827'`
- 274행 `const defaultColor = isAlpha ? '#4ade80' : '#f8fafc';` → `isAlpha ? '#111827' : '#111827';`

- [ ] **Step 3: 빌드로 컴파일 확인**

Run: `cd /Users/user/mathmentos && rm -rf dist && npm run build 2>&1 | tail -2`
Expected: `✓ built in ...` (에러 없음)

- [ ] **Step 4: 커밋**

```bash
git add src/components/hints/GeometryHintPlayer.jsx src/components/hints/MathCanvas.jsx
git commit -m "기하 AVS: 흰 좌표평면 + 검정 단색 렌더"
```

- [ ] **Step 5: 배포 (코드 변경은 배포 필요)**

Run: `npm run deploy 2>&1 | tail -3`
검증 게이트(③): 사용자에게 `/inspector` 메뉴7 문제 011에서 흰배경/검정 도형 확인 요청.

---

## Task 2: 분산기 스크립트 + 도형 있는 문제 적용

도형이 이미 있는 문제(011,012,016,019,025,031,034,036,037,040,042,043)는 base_figure.objects를 step별로 분산한다(최종 누적 = 원본, 무손실).

**Files:**
- Create: `scripts/geo/distribute.cjs`

- [ ] **Step 1: 분산기 작성**

`scripts/geo/distribute.cjs`:
```js
// 입력: 문제 JSON. base_figure.objects(축 제외)를 type 우선순위로 step별 objects에 분배.
// 도형(circle/line/function_plot/curve/triangle/perpendicular) → segment → point → label 순.
const fs = require('fs');
const SHAPE = new Set(['circle','line','curve','function','function_plot','triangle','perpendicular','drawCircle']);
const SEG = new Set(['segment','drawSegment','polygon','drawPolygon']);
const PT = new Set(['point']);
const LBL = new Set(['latex_label','text','label_text','markLength','markAngle']);
const AX = new Set(['axes','axis']);
function distribute(d) {
  const bf = d.base_figure || (d.base_figure = { preset:'custom', objects:[] });
  const objs = bf.objects || [];
  const steps = d.steps || d.overlay_steps || [];
  const N = steps.length;
  if (N < 3) return d;
  let axes = objs.filter(o => AX.has(o.type));
  if (!axes.length) axes = [{ type:'axes' }];
  const groups = [
    objs.filter(o => SHAPE.has(o.type)),
    objs.filter(o => SEG.has(o.type)),
    objs.filter(o => PT.has(o.type)),
    objs.filter(o => LBL.has(o.type)),
  ].filter(g => g.length);
  bf.objects = axes;
  const content = []; for (let i=1;i<=N-2;i++) content.push(i); if(!content.length) content.push(1);
  const assign = Array.from({length:N},()=>[]);
  groups.forEach((g,gi)=>{ assign[content[Math.min(gi,content.length-1)]].push(...g); });
  steps.forEach((s,i)=>{ s.objects = assign[i]; });
  if (d.overlay_steps && d.overlay_steps !== steps) d.overlay_steps.forEach((s,i)=>{ s.objects = assign[i]||[]; });
  return d;
}
module.exports = { distribute };
if (require.main === module) {
  const [,, inf, outf] = process.argv;
  const d = JSON.parse(fs.readFileSync(inf,'utf8'));
  fs.writeFileSync(outf, JSON.stringify(distribute(d), null, 1));
  console.log('distributed', inf, '->', outf);
}
```

- [ ] **Step 2: 무손실 검증 테스트**

Run:
```bash
cd /Users/user/mathmentos
node -e "const {distribute}=require('./scripts/geo/distribute.cjs');const d={base_figure:{preset:'custom',objects:[{type:'axes'},{type:'circle',center:[0,0],radius:2},{type:'point',coords:[1,1]}]},steps:[{},{},{},{},{}]};const r=distribute(JSON.parse(JSON.stringify(d)));const acc=r.base_figure.objects.length+r.steps.reduce((n,s)=>n+(s.objects||[]).length,0);console.log('orig',d.base_figure.objects.length,'acc',acc, acc===d.base_figure.objects.length+1?'OK(축추가1)':'MISMATCH');"
```
Expected: `OK(축추가1)` (원본 객체 전부 보존 + 축 1개)

- [ ] **Step 3: 12문제에 적용**

```bash
mkdir -p /tmp/geo_out
for pid in 011 012 016 019 025 031 034 036 037 040 042 043; do
  node scripts/geo/distribute.cjs /tmp/geo_in/circle_eq_step2__$pid.json /tmp/geo_out/circle_eq_step2__$pid.json
done
ls /tmp/geo_out | wc -l
```
Expected: 12 (이미 적용·업로드된 상태면 재확인용)

- [ ] **Step 4: 커밋**

```bash
git add scripts/geo/distribute.cjs && git commit -m "geo: 도형 단계별 분산기"
```

---

## Task 3: 좌표 검산 스크립트

작도한 도형의 좌표가 수학적으로 맞는지 검산한다(점이 원/직선 위, 원 방정식 일치).

**Files:**
- Create: `scripts/geo/verify_coords.cjs`

- [ ] **Step 1: 검산기 작성**

`scripts/geo/verify_coords.cjs`:
```js
// 누적 객체에서 circle/line과 point를 모아, 각 point가 어떤 circle/line 위에 있는지(오차<0.05) 확인.
// "교점"으로 의도된 point가 어떤 곡선 위에도 없으면 경고. JSON 유효성도 검사.
const fs = require('fs');
function onCircle(p, c) { const dx=p[0]-c.center[0], dy=p[1]-c.center[1]; return Math.abs(Math.hypot(dx,dy)-c.radius) < 0.05; }
function onLine(p, l) { // l: {from,to}
  const [x1,y1]=l.from,[x2,y2]=l.to; const A=y2-y1,B=x1-x2,C=-(A*x1+B*y1);
  return Math.abs(A*p[0]+B*p[1]+C)/Math.hypot(A,B) < 0.05;
}
function verify(file) {
  const d = JSON.parse(fs.readFileSync(file,'utf8'));
  const steps = d.steps||d.overlay_steps||[];
  const acc = [...(d.base_figure?.objects||[])];
  steps.forEach(s=>acc.push(...(s.objects||[])));
  const circles = acc.filter(o=>o.type==='circle'&&Array.isArray(o.center));
  const lines = acc.filter(o=>['line','segment'].includes(o.type)&&o.from&&o.to);
  const pts = acc.filter(o=>o.type==='point').map(o=>o.coords||o.coordinates).filter(Boolean);
  const warns = [];
  for (const p of pts) {
    const ok = circles.some(c=>onCircle(p,c)) || lines.some(l=>onLine(p,l)) || (!circles.length&&!lines.length);
    if (!ok) warns.push('point '+JSON.stringify(p)+' 어떤 도형 위에도 없음');
  }
  return warns;
}
if (require.main === module) {
  let bad=0;
  for (const f of process.argv.slice(2)) {
    const w = verify(f);
    if (w.length){ bad++; console.log('⚠️', f); w.forEach(x=>console.log('   ',x)); }
  }
  console.log(bad?('검산 경고 '+bad+'개'):'검산 통과');
  process.exit(0);
}
module.exports = { verify };
```

- [ ] **Step 2: 분산 결과에 검산 실행**

Run: `node scripts/geo/verify_coords.cjs /tmp/geo_out/circle_eq_step2__*.json`
Expected: `검산 통과` (분산은 원본 좌표라 통과해야 함; 경고 뜨면 원본 데이터 좌표 문제 → 리스트업)

- [ ] **Step 3: 커밋**

```bash
git add scripts/geo/verify_coords.cjs && git commit -m "geo: 좌표 검산기"
```

---

## Task 4: 빈 문제 작도 (배치, 5개씩)

도형이 빈 28문제(002~006,014,015,017,018,020~024,026~030,032,033,038,039,044~050)를 힌트 latex의 좌표·방정식에서 작도한다. **5문제씩 배치** → 검산 → 업로드 → 사용자 라이브 확인 → 다음 배치.

**Files:**
- 작업: `/tmp/geo_out/circle_eq_step2__<pid>.json` (작도 결과)

- [ ] **Step 1: 첫 배치(002~006) 작도**

각 문제에 대해 `/tmp/geo_in/circle_eq_step2__<pid>.json`을 읽고, steps의 latex에서 원(중심·반지름)·직선·점 좌표를 추출해 build 패턴으로 step별 objects를 채운다(base_figure.objects=[{type:'axes'}]). 작도 규칙:
  - 주어진 원 `(x-a)^2+(y-b)^2=r^2` → C단계 `{type:'circle',center:[a,b],radius:r}`
  - 주어진 직선 `y=mx+k` 또는 두 점 → C/B단계 `{type:'line',from:[..],to:[..]}` 또는 `{type:'function_plot',expr:'m*x+k'}`
  - 교점/핵심 점 `(x,y)` → S단계 `{type:'point',coords:[x,y],label:'(x,y)'}`
  - 색은 지정하지 않음(기본 검정 사용).
결과를 `/tmp/geo_out/`에 저장.

- [ ] **Step 2: 배치 검산**

Run: `node scripts/geo/verify_coords.cjs /tmp/geo_out/circle_eq_step2__00{2,3,4,5,6}.json`
Expected: `검산 통과`. 경고 시 해당 문제 좌표 수정 후 재검산.

- [ ] **Step 3: 배치 업로드**

Run: `node scripts/geo/upload_hints.cjs circle_eq_step2 002 003 004 005 006` (Task 5의 업로더)
Expected: `업로드 5/5`

- [ ] **Step 4: 사용자 라이브 확인 게이트**

사용자에게 `/inspector` 메뉴7 문제 002~006 단계별 빌드업 확인 요청. OK면 다음 배치.

- [ ] **Step 5: 나머지 배치 반복**

위 Step 1–4를 (014,015,017,018,020) / (021~024,026) / (027~030,032) / (033,038,039,044,045) / (046,047,048,049,050) 배치로 반복.

---

## Task 5: 업로더 스크립트

**Files:**
- Create: `scripts/geo/upload_hints.cjs`

- [ ] **Step 1: 업로더 작성**

`scripts/geo/upload_hints.cjs`:
```js
const fs = require('fs');
const env = fs.readFileSync(__dirname+'/../../.env','utf8');
const SUPA = (env.match(/VITE_SUPABASE_URL=(.*)/)||[])[1].trim().replace(/["']/g,'');
const SKEY = (env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)||[])[1].trim().replace(/["']/g,'');
(async () => {
  const [,, folder, ...pids] = process.argv;
  let ok=0, fail=[];
  for (const pid of pids) {
    const body = fs.readFileSync(`/tmp/geo_out/${folder}__${pid}.json`);
    JSON.parse(body); // 유효성
    const r = await fetch(`${SUPA}/storage/v1/object/mentos-assets/math_hints/${folder}/${pid}.json`,
      { method:'POST', headers:{ Authorization:'Bearer '+SKEY, 'Content-Type':'application/json', 'x-upsert':'true' }, body });
    r.ok ? ok++ : fail.push(pid+' '+r.status);
  }
  console.log('업로드', ok+'/'+pids.length, fail.length?('실패:'+fail.join(',')):'');
})();
```

- [ ] **Step 2: 업로더로 분산 12문제 재업로드(동작 확인)**

Run: `node scripts/geo/upload_hints.cjs circle_eq_step2 011 012 016 019 025 031 034 036 037 040 042 043`
Expected: `업로드 12/12`

- [ ] **Step 3: 커밋**

```bash
git add scripts/geo/upload_hints.cjs && git commit -m "geo: 힌트 업로더"
```

---

## Self-Review 결과

- 스펙 커버리지: 렌더 스타일(Task1)·데이터 패턴/분산(Task2)·작도(Task4)·검산(Task3)·업로드(Task5)·단원별 라이브 확인(Task4 게이트) 모두 매핑됨. 롤아웃 타 단원은 본 파일럿 확정 후 별도 plan.
- 플레이스홀더: 없음(작도 규칙은 Task4에 구체 명시). 단, 빈 문제별 실제 좌표는 각 문제 latex에서 추출(작업 시 결정) — 검산 게이트로 보증.
- 타입 일관성: `distribute`/`verify`/`upload_hints` 인터페이스 일치, 객체 타입은 MathCanvas 지원 타입만 사용.

미해결: 렌더 스타일(흰/검정)의 실제 시각 결과는 작업자 브라우저 복구 전까지 **사용자 라이브 확인**에 의존.
