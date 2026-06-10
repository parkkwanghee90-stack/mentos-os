# 매스멘토스 홈 V3 "칠판 다크테크" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 랜딩 홈(`/`, `/landing`)을 "칠판 다크테크" 아트 디렉션(딥 그린블랙 + 네온 분필)으로 7비트 구조로 새로 구현한다.

**Architecture:** **Tailwind 미사용** — 이 브랜치(main 기준)는 Tailwind가 비활성이고 앱 전역이 자체 CSS로 동작하므로, Tailwind를 켜면 preflight가 앱 전체를 리셋할 위험이 있다. 대신 원본 `Landing.css` 패턴을 계승해 **`.chalk-root`로 스코프된 순수 CSS**(`src/styles/chalkboard.css`)에 디자인 토큰(CSS 변수)·공용 유틸·섹션/컴포넌트 클래스를 정의하고, `src/components/home/*` 컴포넌트는 시맨틱 className만 사용한다. 애니메이션은 Framer Motion(이미 설치), 모노 폰트는 시스템 스택(신규 폰트 미도입). 모든 스타일이 `.chalk-root` 하위로 한정되어 교실 등 타 페이지에 영향 0.

**Tech Stack:** React 19, framer-motion 12, lucide-react, react-router-dom 7, 순수 CSS(스코프). Pretendard는 `src/index.css`가 전역 로드(기존).

**Spec:** `docs/superpowers/specs/2026-06-03-home-v3-chalkboard-design.md`

---

## 검증 전략 (TDD 대체 근거)

테스트 러너 없음(vitest/jest 미설치), 대상은 프레젠테이션 컴포넌트 → 러너 신규 도입은 YAGNI.
각 태스크 게이트:
1. **`npm run build`** → exit 0 (TMPDIR 주의: `export TMPDIR=/tmp` 후 실행. repo 내부 임시폴더는 가득 찰 수 있음)
2. **시각 확인** → `npm run dev` 후 `/landing`에서 해당 섹션 육안 점검(데스크탑 + 모바일 ≤390px)
게이트 통과 후 커밋. "should work" 금지 — 빌드 출력으로 증거 제시.

작업 디렉토리: `/Users/mac/mathmentos-mainpaage/.claude/worktrees/home-fresh` (worktree, 브랜치 `feature/home-fresh`).

---

## 파일 구조

```
src/main.jsx                       # 변경 없음 (index.css 전역 유지)
src/pages/Landing.jsx              # 전체 재작성 — chalkboard.css import + .chalk-root 조립
src/styles/chalkboard.css          # ★신규 — 토큰 + 공용 유틸 + 섹션/컴포넌트 클래스 (.chalk-root 스코프)
src/components/home/_motion.js     # ★신규 — Framer variants
src/components/home/ChalkTray.jsx  # ★신규 — 분필 트레이 장식 (공용)
src/components/home/ChalkUnderline.jsx # ★신규 — 손글씨 SVG 밑줄 (공용)
src/components/home/ChalkHeader.jsx    # ★신규 — 다크 헤더 + nav
src/components/home/Hero.jsx           # ★신규 — 다크 히어로 + 라이브 수식
src/components/home/Empathy.jsx        # ★신규 — 밝음, 분필 메모 4카드 (#empathy)
src/components/home/HowItWorks.jsx     # ★신규 — 다크, 4단계 (#how)
src/components/home/AiDemo.jsx         # ★신규 — 다크, 대화형 칠판 (#demo)
src/components/home/ParentsReport.jsx  # ★신규 — 밝음, 리포트("예시") (#parents)
src/components/home/Pricing.jsx        # ★신규 — 밝음, Free/Premium (#pricing)
src/components/home/FinalCta.jsx       # ★신규 — 다크 마무리 (#cta)
src/components/home/Faq.jsx            # ★신규 — 다크 아코디언 (#faq)
src/components/home/ChalkFooter.jsx    # ★신규 — 다크 푸터
```

원본 `src/pages/Landing.css`는 신규 홈에서 미사용 → Landing.jsx의 import 제거. 파일 삭제는 Task 9에서 타 참조 확인 후 처리.

---

## CSS 클래스 규약 (Task 0에서 전부 정의, 이후 태스크가 사용)

- 섹션: `.chalk-section`(공용 패딩/오버플로) + `.chalk-section--dark` | `.chalk-section--light`
- 내부 컨테이너: `.chalk-wrap`(max-width 1180px, 중앙, 패딩)
- 키커(모노 라벨): `.chalk-kicker`
- 제목/본문: `.chalk-h2`, `.chalk-lead`, 다크에선 `--dark` 변형이 색만 바꿈(부모 섹션 클래스로 상속)
- 카드: `.chalk-card`(밝음 종이카드), `.chalk-card--memo`(기울어진 분필 메모)
- 버튼: `.chalk-btn`(민트 솔리드), `.chalk-btn--ghost`(보더)
- 수식: `.chalk-eq`(모노, 다크 글로우), 컬러: `.chalk-mint/.chalk-yellow/.chalk-coral`
- 장식: `.chalk-grain`, `.chalk-grid`, `.chalk-tray`, `.chalk-chip`
- 섹션 번호: `.chalk-num`
- 글로우 텍스트: `.chalk-glow`

---

## Task 0: 디자인 시스템 — chalkboard.css + _motion.js

**Files:**
- Create: `src/styles/chalkboard.css`
- Create: `src/components/home/_motion.js`

- [ ] **Step 1: Create `src/components/home/_motion.js`** (exact):

```js
// 랜딩 공용 Framer Motion variants. Framer가 prefers-reduced-motion 전역 존중.
export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
// 분필 그려지기 — SVG path length 용
export const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: "easeInOut" } },
};
```

- [ ] **Step 2: Create `src/styles/chalkboard.css`** (exact, complete — all rules scoped under `.chalk-root`):

```css
/* ============================================================
   매스멘토스 홈 V3 — "칠판 다크테크" 디자인 시스템
   전부 .chalk-root 스코프 → 앱 타 페이지에 영향 없음. Tailwind 미사용.
   ============================================================ */

.chalk-root {
  /* 다크 칠판 */
  --bb: #0b1410;          /* board base */
  --bb-elev: #0f1a14;     /* elevated */
  --bb-line: rgba(124, 255, 176, 0.15);
  --ink-on-dark: #b9c7bf;
  --title-on-dark: #f3fff8;
  /* 밝은 분필가루 종이 */
  --paper: #f2f4f1;
  --ink: #0b1410;
  --ink-soft: #5a6b61;
  --paper-line: #e2e8e2;
  /* 컬러 분필 */
  --mint: #7cffb0;
  --yellow: #f2e9b8;
  --coral: #ff9e80;
  --green-solid: #0b6b3a;
  /* 폰트 */
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

/* ---------- 섹션 / 레이아웃 ---------- */
.chalk-root .chalk-section {
  position: relative;
  overflow: hidden;
  padding: 6rem 0;
}
@media (min-width: 1024px) {
  .chalk-root .chalk-section { padding: 8.5rem 0; }
}
.chalk-root .chalk-section--dark { background: var(--bb); color: var(--ink-on-dark); }
.chalk-root .chalk-section--light { background: var(--paper); color: var(--ink); }
.chalk-root .chalk-wrap {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
@media (min-width: 1024px) {
  .chalk-root .chalk-wrap { padding: 0 2.5rem; }
}

/* ---------- 텍스처 (다크) ---------- */
.chalk-root .chalk-grain::before {
  content: "";
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 18px 18px;
}
.chalk-root .chalk-grid::after {
  content: "";
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--bb-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--bb-line) 1px, transparent 1px);
  background-size: 40px 40px;
  -webkit-mask-image: radial-gradient(ellipse 75% 70% at 50% 35%, #000 0%, transparent 78%);
  mask-image: radial-gradient(ellipse 75% 70% at 50% 35%, #000 0%, transparent 78%);
  opacity: 0.6;
}

/* ---------- 타이포 ---------- */
.chalk-root .chalk-kicker {
  font-family: var(--mono);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  color: var(--mint);
  text-transform: uppercase;
}
.chalk-root .chalk-section--light .chalk-kicker { color: var(--green-solid); }
.chalk-root .chalk-h1 {
  font-size: clamp(2.4rem, 7vw, 3.6rem);
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.03em;
}
.chalk-root .chalk-h2 {
  font-size: clamp(1.75rem, 4.5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -0.025em;
}
.chalk-root .chalk-section--dark .chalk-h1,
.chalk-root .chalk-section--dark .chalk-h2 { color: var(--title-on-dark); }
.chalk-root .chalk-lead {
  font-size: 1.0625rem;
  line-height: 1.75;
  max-width: 44ch;
}
.chalk-root .chalk-num {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--mint);
  opacity: 0.8;
}

/* 컬러 분필 */
.chalk-root .chalk-mint { color: var(--mint); }
.chalk-root .chalk-yellow { color: var(--yellow); }
.chalk-root .chalk-coral { color: var(--coral); }
.chalk-root .chalk-glow { text-shadow: 0 0 22px rgba(124, 255, 176, 0.5); }

/* 수식 (모노) */
.chalk-root .chalk-eq {
  font-family: var(--mono);
  line-height: 1.9;
  color: var(--title-on-dark);
}

/* ---------- 버튼 ---------- */
.chalk-root .chalk-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-weight: 800; font-size: 1rem;
  padding: 0.85rem 1.4rem; border-radius: 8px;
  background: var(--mint); color: #06140d;
  box-shadow: 0 0 24px rgba(124, 255, 176, 0.35);
  text-decoration: none; border: none; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.chalk-root .chalk-btn:hover { transform: translateY(-2px); box-shadow: 0 0 34px rgba(124, 255, 176, 0.55); }
.chalk-root .chalk-btn--ghost {
  background: transparent; color: var(--title-on-dark);
  border: 1px solid var(--bb-line); box-shadow: none; font-weight: 700;
}
.chalk-root .chalk-section--light .chalk-btn--ghost { color: var(--ink); border-color: #cdd6cf; }

/* ---------- 카드 ---------- */
.chalk-root .chalk-card {
  background: #fff;
  border: 1px solid var(--paper-line);
  border-radius: 18px;
  padding: 1.6rem;
  transition: transform 0.3s, box-shadow 0.3s;
}
.chalk-root .chalk-card:hover { transform: translateY(-4px); box-shadow: 0 18px 44px -18px rgba(11, 20, 16, 0.2); }
.chalk-root .chalk-card--memo {
  background: #fcfbf4;
  border: 1px solid #e9e6d2;
  border-radius: 6px;
  box-shadow: 0 8px 22px -12px rgba(11, 20, 16, 0.25);
}
.chalk-root .chalk-card--memo:nth-child(odd) { transform: rotate(-1.2deg); }
.chalk-root .chalk-card--memo:nth-child(even) { transform: rotate(1deg); }
.chalk-root .chalk-card--dark {
  background: var(--bb-elev);
  border: 1px solid var(--bb-line);
  border-radius: 16px;
  padding: 1.4rem;
}

/* ---------- 분필 트레이 / 칩 ---------- */
.chalk-root .chalk-tray {
  position: absolute; left: 0; right: 0; bottom: 0; height: 12px;
  background: linear-gradient(#3a2a1c, #241a11); z-index: 3;
}
.chalk-root .chalk-chip {
  position: absolute; bottom: 12px; height: 8px; border-radius: 4px; z-index: 4; opacity: 0.85;
}

/* ---------- 헤더 ---------- */
.chalk-root .chalk-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(11, 20, 16, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--bb-line);
}
.chalk-root .chalk-header-inner {
  max-width: 1180px; margin: 0 auto; padding: 0.85rem 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
}
.chalk-root .chalk-navlink {
  color: var(--ink-on-dark); text-decoration: none; font-size: 0.92rem; font-weight: 500;
  transition: color 0.2s;
}
.chalk-root .chalk-navlink:hover { color: var(--mint); }

/* ---------- 접근성 / 모션 ---------- */
.chalk-root :focus-visible { outline: 2px solid var(--mint); outline-offset: 2px; border-radius: 4px; }
@keyframes chalk-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(124, 255, 176, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(124, 255, 176, 0); }
}
.chalk-root .chalk-live { animation: chalk-pulse 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .chalk-root .chalk-live { animation: none; }
}

/* ---------- skip link ---------- */
.chalk-root .chalk-skip {
  position: absolute; top: -100px; left: 0; z-index: 100;
  background: var(--mint); color: #06140d; padding: 0.75rem 1rem; font-weight: 700; text-decoration: none;
}
.chalk-root .chalk-skip:focus { top: 0; }
```

- [ ] **Step 3: Build 검증** — Run: `export TMPDIR=/tmp && npm run build` → exit 0 (CSS/JS는 아직 미사용이지만 파싱 통과 확인).
- [ ] **Step 4: Commit**

```bash
git add src/styles/chalkboard.css src/components/home/_motion.js
git commit -m "feat(home): add chalkboard design system (scoped css + motion)"
```

---

## Task 1: Landing 조립 셸 + ChalkHeader + 공용 장식(ChalkTray/ChalkUnderline)

**Files:**
- Create: `src/components/home/ChalkTray.jsx`, `src/components/home/ChalkUnderline.jsx`, `src/components/home/ChalkHeader.jsx`
- Modify (전체 교체): `src/pages/Landing.jsx`

- [ ] **Step 1: Create `src/components/home/ChalkTray.jsx`** (공용 분필 트레이):

```jsx
// 다크 섹션 하단 분필 트레이 + 컬러 분필 3색
export default function ChalkTray() {
  return (
    <>
      <div className="chalk-tray" aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 40, width: 40, background: "var(--mint)" }} aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 90, width: 30, background: "var(--yellow)" }} aria-hidden="true" />
      <span className="chalk-chip" style={{ left: 130, width: 30, background: "var(--coral)" }} aria-hidden="true" />
    </>
  );
}
```

- [ ] **Step 2: Create `src/components/home/ChalkUnderline.jsx`** (손글씨 SVG 밑줄, draw-on):

```jsx
import { motion } from "framer-motion";
import { drawLine } from "./_motion";

// 핵심 구절 아래 분필 손글씨 밑줄. color prop 기본 노랑.
export default function ChalkUnderline({ color = "var(--yellow)" }) {
  return (
    <svg
      className="chalk-underline"
      width="100%" height="12" viewBox="0 0 190 12" preserveAspectRatio="none"
      style={{ position: "absolute", left: 0, bottom: "-8px" }}
      aria-hidden="true"
    >
      <motion.path
        d="M2 7 Q60 2 100 6 T188 5"
        stroke={color} strokeWidth="3" fill="none" strokeLinecap="round"
        variants={drawLine} initial="hidden" whileInView="show" viewport={{ once: true }}
      />
    </svg>
  );
}
```

- [ ] **Step 3: Create `src/components/home/ChalkHeader.jsx`**:

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "작동 방식", href: "#how" },
  { label: "AI 데모", href: "#demo" },
  { label: "학부모", href: "#parents" },
  { label: "요금", href: "#pricing" },
];

export default function ChalkHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="chalk-header">
      <div className="chalk-header-inner">
        <Link to="/" className="chalk-brand" aria-label="매스멘토스 홈"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 9,
            background: "var(--mint)", color: "#06140d", fontWeight: 800, fontFamily: "var(--mono)" }}>ƒ</span>
          <span style={{ color: "var(--title-on-dark)", fontWeight: 800, fontSize: "1.15rem" }}>매스멘토스</span>
        </Link>

        <nav aria-label="메인 메뉴" style={{ display: "none", gap: 28, alignItems: "center" }} className="chalk-nav-desktop">
          {NAV.map((n) => (<a key={n.href} href={n.href} className="chalk-navlink">{n.label}</a>))}
          <Link to="/login" className="chalk-btn" style={{ padding: "0.55rem 1.1rem", fontSize: "0.9rem" }}>무료로 시작</Link>
        </nav>

        <button className="chalk-burger" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{ display: "flex", background: "rgba(124,255,176,0.1)", border: "none", borderRadius: 10,
            width: 40, height: 40, alignItems: "center", justifyContent: "center", color: "var(--mint)", cursor: "pointer" }}>
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--bb-line)", padding: "0.5rem 1.5rem 1.25rem" }}>
          <nav aria-label="모바일 메뉴" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="chalk-navlink" style={{ padding: "0.75rem 0" }}
                onClick={() => setOpen(false)}>{n.label}</a>
            ))}
            <Link to="/login" className="chalk-btn" style={{ marginTop: 12, justifyContent: "center" }}
              onClick={() => setOpen(false)}>무료로 시작</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 4: Add responsive nav CSS to `src/styles/chalkboard.css`** (append at end):

```css
/* 헤더 반응형 nav */
@media (min-width: 1024px) {
  .chalk-root .chalk-nav-desktop { display: flex !important; }
  .chalk-root .chalk-burger { display: none !important; }
}
.chalk-root .chalk-underline path { will-change: stroke-dashoffset; }
```

- [ ] **Step 5: Replace `src/pages/Landing.jsx`** (shell with header only for now):

```jsx
// 매스멘토스 홈 V3 — 칠판 다크테크
import "@/styles/chalkboard.css";
import ChalkHeader from "@/components/home/ChalkHeader";

export default function Landing() {
  return (
    <div className="chalk-root" style={{ minHeight: "100vh", width: "100%", overflowX: "hidden", background: "var(--bb)" }}>
      <a href="#main" className="chalk-skip">본문 바로가기</a>
      <ChalkHeader />
      <main id="main">
        {/* 섹션은 후속 태스크에서 추가 */}
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Build + 시각 검증** — `export TMPDIR=/tmp && npm run build` → exit 0. `npm run dev` → `/landing`에서 다크 헤더 + 모바일 햄버거 동작 확인.
- [ ] **Step 7: Commit**

```bash
git add src/components/home/ChalkTray.jsx src/components/home/ChalkUnderline.jsx src/components/home/ChalkHeader.jsx src/pages/Landing.jsx src/styles/chalkboard.css
git commit -m "feat(home): chalkboard header + landing shell + shared chalk decorations"
```

---

## Task 2: Hero (다크) + 라이브 수식

**Files:**
- Create: `src/components/home/Hero.jsx`
- Modify: `src/pages/Landing.jsx` (Hero 삽입)

- [ ] **Step 1: Create `src/components/home/Hero.jsx`**:

```jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";
import ChalkTray from "./ChalkTray";
import ChalkUnderline from "./ChalkUnderline";

const EQ = [
  { t: "x² − 5x + 6 = 0", c: "" },
  { t: "곱 6, 합 −5  →  −2, −3", c: "soft" },
  { t: "(x − 2)(x − 3) = 0", c: "" },
  { t: "x = 2  또는  x = 3", c: "coral" },
];

export default function Hero() {
  return (
    <section className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr", alignItems: "center" }}>
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="chalk-kicker">// MATHMENTOS · AI 수학 코치</motion.div>
          <motion.h1 variants={fadeUp} className="chalk-h1" style={{ marginTop: 14 }}>
            답은 <span className="chalk-mint chalk-glow">알려주지 않아.</span>
            <br />
            <span style={{ position: "relative", display: "inline-block" }}>
              같이 푸는 거야<span className="chalk-coral">.</span>
              <ChalkUnderline />
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="chalk-lead" style={{ marginTop: 22 }}>
            막힐 때마다 네 풀이를 보고, 딱 다음 한 칸을 분필로 짚어주는 AI 수학 코치.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <Link to="/login" className="chalk-btn">30일 무료 체험</Link>
            <a href="#demo" className="chalk-btn chalk-btn--ghost">풀이 보기 ▶</a>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" className="chalk-card--dark" style={{ marginTop: 8 }}>
          <div className="chalk-kicker" style={{ fontSize: "0.66rem" }}>— 칠판에서 같이 —</div>
          <div className="chalk-eq" style={{ fontSize: "1.25rem", marginTop: 12 }}>
            {EQ.map((line, i) => (
              <motion.div key={i} variants={fadeUp}
                className={line.c === "coral" ? "chalk-coral" : line.c === "soft" ? "" : ""}
                style={line.c === "soft" ? { color: "var(--ink-on-dark)" } : undefined}>
                {line.t}
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 16, border: "1px dashed var(--bb-line)", borderRadius: 8, padding: "10px 12px",
            fontSize: "0.85rem", color: "var(--ink-on-dark)" }}>
            💬 <b className="chalk-mint">힌트:</b> 합이 음수·곱이 양수면 두 수의 부호는?
          </div>
        </motion.div>
      </div>
      <ChalkTray />
    </section>
  );
}
```

- [ ] **Step 2: Insert Hero into `src/pages/Landing.jsx`** — add import and render inside `<main>`:

```jsx
import Hero from "@/components/home/Hero";
```
그리고 `<main id="main">` 안에 `<Hero />` 추가.

- [ ] **Step 3: Build + 시각 검증** — `export TMPDIR=/tmp && npm run build` → exit 0. dev에서 히어로: 민트 글로우 제목, 손글씨 밑줄 draw-on, 수식 stagger 등장, 분필 트레이, 모바일 1열·overflow 없음.
- [ ] **Step 4: Commit**

```bash
git add src/components/home/Hero.jsx src/pages/Landing.jsx
git commit -m "feat(home): chalkboard hero with live equation + chalk underline"
```

---

## Task 3: Empathy (밝음) — 분필 메모 4카드

**Files:** Create `src/components/home/Empathy.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/Empathy.jsx`**:

```jsx
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";

const PAINS = [
  "조금만 바뀌면 또 막혀요",
  "왜 틀렸는지 모르겠어요",
  "물어볼 사람이 없어요",
  "풀이를 외우기만 해요",
];

export default function Empathy() {
  return (
    <section id="empathy" className="chalk-section chalk-section--light">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">이런 적, 있죠?</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            공식은 외웠는데,<br />시험만 보면 막히는 이유.
          </motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {PAINS.map((p) => (
              <motion.div key={p} variants={fadeUp} className="chalk-card--memo"
                style={{ padding: "1.5rem 1.4rem", textAlign: "left", fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)" }}>
                <span style={{ fontFamily: "var(--mono)", color: "var(--green-solid)", marginRight: 8 }}>?</span>
                {p}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert into Landing.jsx** — `import Empathy from "@/components/home/Empathy";` + `<Empathy />` after `<Hero />`.
- [ ] **Step 3: Build 검증** — `export TMPDIR=/tmp && npm run build` → exit 0.
- [ ] **Step 4: Commit**

```bash
git add src/components/home/Empathy.jsx src/pages/Landing.jsx
git commit -m "feat(home): empathy section with chalk memo cards"
```

---

## Task 4: HowItWorks (다크) — 4단계

**Files:** Create `src/components/home/HowItWorks.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/HowItWorks.jsx`**:

```jsx
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";

const STEPS = [
  { n: "01", t: "네 풀이를 읽어요", d: "정답지가 아니라 학생이 직접 쓴 풀이를 그대로 분석합니다." },
  { n: "02", t: "막힌 칸을 찾아요", d: "어느 단계에서 어긋났는지 정확히 짚습니다. 그 한 곳만." },
  { n: "03", t: "답 대신 힌트를 줘요", d: "정답을 말하지 않습니다. 다음 한 걸음을 떠올리게 하는 질문을." },
  { n: "04", t: "스스로 확인하게 해요", d: "직접 도달한 풀이를 검산까지. 외운 게 아니라 이해한 과정으로." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="chalk-section chalk-section--dark chalk-grain">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">// HOW IT WORKS</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            칠판이 채워지는 방식.
          </motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48,
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", textAlign: "left" }}>
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="chalk-card--dark">
                <div className="chalk-num">{s.n}</div>
                <h3 style={{ color: "var(--title-on-dark)", fontWeight: 800, fontSize: "1.1rem", marginTop: 12 }}>{s.t}</h3>
                <p style={{ color: "var(--ink-on-dark)", fontSize: "0.95rem", lineHeight: 1.65, marginTop: 8 }}>{s.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert into Landing.jsx** — `import HowItWorks from "@/components/home/HowItWorks";` + `<HowItWorks />` after `<Empathy />`.
- [ ] **Step 3: Build 검증** — `export TMPDIR=/tmp && npm run build` → exit 0.
- [ ] **Step 4: Commit**

```bash
git add src/components/home/HowItWorks.jsx src/pages/Landing.jsx
git commit -m "feat(home): how-it-works 4-step dark section"
```

---

## Task 5: AiDemo (다크, 시그니처) — 대화형 칠판

**Files:** Create `src/components/home/AiDemo.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/AiDemo.jsx`**:

```jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, ListOrdered, MessageSquareText, ScanSearch } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const BUBBLES = [
  { who: "ai", t: "x² − 5x + 6, 같이 볼까? 곱이 6 되는 두 수를 떠올려봐." },
  { who: "me", t: "2랑 3?" },
  { who: "ai", t: "좋아! 그런데 합은 −5여야 해. 부호를 어떻게?" },
  { who: "me", t: "아 둘 다 음수! −2랑 −3." },
  { who: "ai", t: "정확해 👏 (x−2)(x−3). 전개해서 검산해보자." },
];
const FEATURES = [
  { Icon: Mic, label: "음성 힌트" },
  { Icon: ListOrdered, label: "단계 풀이" },
  { Icon: MessageSquareText, label: "AI 피드백" },
  { Icon: ScanSearch, label: "답안 분석" },
];

export default function AiDemo() {
  return (
    <section id="demo" className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ display: "grid", gap: 40, gridTemplateColumns: "1fr", alignItems: "center" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">// LIVE COACHING</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            실시간으로,<br /><span className="chalk-mint chalk-glow">이렇게 같이 풉니다.</span>
          </motion.h2>
          <motion.div variants={fadeUp} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
            maxWidth: 420, margin: "28px auto 0" }}>
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--bb-line)", borderRadius: 14 }}>
                <Icon size={18} color="var(--mint)" aria-hidden="true" />
                <span style={{ color: "var(--title-on-dark)", fontWeight: 600, fontSize: "0.92rem" }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="chalk-card--dark" style={{ maxWidth: 460, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BUBBLES.map((b, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{
                  maxWidth: "84%", padding: "11px 15px", fontSize: "0.92rem", lineHeight: 1.5,
                  borderRadius: 16,
                  alignSelf: b.who === "me" ? "flex-end" : "flex-start",
                  background: b.who === "me" ? "var(--mint)" : "rgba(255,255,255,0.05)",
                  color: b.who === "me" ? "#06140d" : "#eafff1",
                  border: b.who === "me" ? "none" : "1px solid var(--bb-line)",
                  borderBottomRightRadius: b.who === "me" ? 5 : 16,
                  borderBottomLeftRadius: b.who === "me" ? 16 : 5,
                }}>
                {b.t}
              </motion.div>
            ))}
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start",
              padding: "10px 14px", borderRadius: 16, background: "rgba(124,255,176,0.1)", border: "1px solid var(--bb-line)" }}>
              <span className="chalk-live" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mint)", display: "inline-block" }} />
              <span style={{ color: "var(--mint)", fontSize: "0.82rem" }}>AI 누리가 분필 드는 중…</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
        style={{ textAlign: "center", marginTop: 36, position: "relative", zIndex: 2 }}>
        <Link to="/login" className="chalk-btn">직접 체험해보기</Link>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Insert into Landing.jsx** — `import AiDemo from "@/components/home/AiDemo";` + `<AiDemo />` after `<HowItWorks />`.
- [ ] **Step 3: Build + 시각 검증** — `export TMPDIR=/tmp && npm run build` → exit 0. dev에서 채팅 버블 stagger 등장 + 펄스.
- [ ] **Step 4: Commit**

```bash
git add src/components/home/AiDemo.jsx src/pages/Landing.jsx
git commit -m "feat(home): interactive chalkboard AI demo section"
```

---

## Task 6: ParentsReport (밝음) — 리포트 미리보기

**Files:** Create `src/components/home/ParentsReport.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/ParentsReport.jsx`**:

```jsx
import { motion } from "framer-motion";
import { FileText, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const BARS = [42, 58, 50, 80, 70, 64, 88]; // 가상 시각화 높이(%)
const ITEMS = [
  { Icon: FileText, t: "학습 리포트" },
  { Icon: Clock, t: "공부 시간" },
  { Icon: ShieldCheck, t: "안전한 환경" },
  { Icon: AlertTriangle, t: "오답 패턴" },
];

export default function ParentsReport() {
  return (
    <section id="parents" className="chalk-section chalk-section--light">
      <div className="chalk-wrap">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center" }}>
          <motion.div variants={fadeUp} className="chalk-kicker">학부모님께</motion.div>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ marginTop: 14 }}>
            아이가 어떻게 공부하는지,<br />부모님도 함께 봅니다.
          </motion.h2>

          <motion.div variants={fadeUp} className="chalk-card" style={{ maxWidth: 820, margin: "48px auto 0", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>주간 이해도 추이</strong>
              <span style={{ background: "#eef2ee", color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 700,
                padding: "4px 10px", borderRadius: 999 }}>예시 데이터</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 170 }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0",
                  background: i === BARS.length - 1 ? "var(--green-solid)" : "#cfe3d6" }} />
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 24 }}>
              {ITEMS.map(({ Icon, t }) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: "#f6f8f5", border: "1px solid var(--paper-line)", borderRadius: 12 }}>
                  <Icon size={18} color="var(--green-solid)" aria-hidden="true" />
                  <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: "0.9rem" }}>{t}</span>
                  <span style={{ marginLeft: "auto", color: "var(--ink-soft)", fontSize: "0.72rem", fontWeight: 700 }}>예시</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert into Landing.jsx** — `import ParentsReport from "@/components/home/ParentsReport";` + `<ParentsReport />` after `<AiDemo />`.
- [ ] **Step 3: Build 검증** — `export TMPDIR=/tmp && npm run build` → exit 0. ("예시 데이터" 배지 노출 확인)
- [ ] **Step 4: Commit**

```bash
git add src/components/home/ParentsReport.jsx src/pages/Landing.jsx
git commit -m "feat(home): parents report preview (labeled sample data)"
```

---

## Task 7: Pricing (밝음) — Free / Premium

**Files:** Create `src/components/home/Pricing.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/Pricing.jsx`**:

```jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, stagger } from "./_motion";

const PLANS = [
  { name: "Free", tag: "체험", hi: false, desc: "부담 없이 단계 코칭을 먼저 경험하세요.",
    features: ["단계별 힌트 체험", "기본 AI 풀이 보기", "학습 기록 미리보기"], cta: "무료로 시작" },
  { name: "Premium", tag: "AI 코칭", hi: true, desc: "막히는 순간 끝까지, 12명 AI 선생님과 함께.",
    features: ["무제한 단계 코칭", "12명 과목별 AI 선생님", "AVS 애니메이션 힌트", "학습 리포트 & 오답 분석"], cta: "30일 무료 체험" },
];

export default function Pricing() {
  return (
    <section id="pricing" className="chalk-section chalk-section--light">
      <div className="chalk-wrap" style={{ maxWidth: 920 }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <motion.h2 variants={fadeUp} className="chalk-h2" style={{ textAlign: "center" }}>심플한 요금제.</motion.h2>
          <div style={{ display: "grid", gap: 18, marginTop: 48, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PLANS.map((p) => (
              <motion.div key={p.name} variants={fadeUp} className="chalk-card"
                style={p.hi ? { borderColor: "var(--green-solid)", borderWidth: 2, boxShadow: "0 18px 44px -20px rgba(11,107,58,0.3)" } : undefined}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.4rem", color: "var(--ink)" }}>{p.name}</strong>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                    background: p.hi ? "var(--green-solid)" : "#eef2ee", color: p.hi ? "#fff" : "var(--ink-soft)" }}>{p.tag}</span>
                </div>
                <p style={{ marginTop: 12, color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6 }}>{p.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink)", fontSize: "0.92rem" }}>
                      <Check size={17} color="var(--green-solid)" aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" style={{ marginTop: 24, display: "inline-flex", justifyContent: "center", alignItems: "center",
                  padding: "0.7rem 1.2rem", borderRadius: 999, fontWeight: 800, textDecoration: "none",
                  background: p.hi ? "var(--green-solid)" : "transparent",
                  color: p.hi ? "#fff" : "var(--ink)", border: p.hi ? "none" : "1px solid #cdd6cf" }}>{p.cta}</Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert into Landing.jsx** — `import Pricing from "@/components/home/Pricing";` + `<Pricing />` after `<ParentsReport />`.
- [ ] **Step 3: Build 검증** — `export TMPDIR=/tmp && npm run build` → exit 0.
- [ ] **Step 4: Commit**

```bash
git add src/components/home/Pricing.jsx src/pages/Landing.jsx
git commit -m "feat(home): free/premium pricing (no fabricated prices)"
```

---

## Task 8: FinalCta + Faq + ChalkFooter (다크 마무리 3종)

**Files:** Create `src/components/home/FinalCta.jsx`, `src/components/home/Faq.jsx`, `src/components/home/ChalkFooter.jsx`; Modify `src/pages/Landing.jsx`.

- [ ] **Step 1: Create `src/components/home/FinalCta.jsx`**:

```jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "./_motion";
import ChalkTray from "./ChalkTray";

export default function FinalCta() {
  return (
    <section id="cta" className="chalk-section chalk-section--dark chalk-grain chalk-grid">
      <div className="chalk-wrap" style={{ textAlign: "center" }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
          <motion.h2 variants={fadeUp} className="chalk-h1" style={{ maxWidth: 720, margin: "0 auto" }}>
            막히는 순간,<br /><span className="chalk-mint chalk-glow">바로 옆에 분필이 있어.</span>
          </motion.h2>
          <motion.div variants={fadeUp} style={{ marginTop: 28 }}>
            <Link to="/login" className="chalk-btn" style={{ fontSize: "1.1rem", padding: "1rem 1.8rem" }}>무료로 시작하기</Link>
          </motion.div>
          <motion.p variants={fadeUp} style={{ marginTop: 16, fontSize: "0.82rem", color: "var(--ink-on-dark)" }}>
            신용카드 불필요 · 자동결제 없음 · 30일 후 선택
          </motion.p>
        </motion.div>
      </div>
      <ChalkTray />
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/home/Faq.jsx`**:

```jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const QA = [
  { q: "정말 답을 안 알려주나요?", a: "네. 답 대신 막힌 지점에 맞는 힌트와 질문을 주어 스스로 도달하게 합니다. 단계가 끝나면 검산으로 확인합니다." },
  { q: "어떤 과목·범위를 지원하나요?", a: "과목별 AI 선생님이 단계별로 코칭합니다. 자세한 범위는 체험에서 직접 확인할 수 있어요." },
  { q: "학부모도 학습을 볼 수 있나요?", a: "학습 리포트로 무엇을 풀었고 어디서 막혔는지, 공부 시간과 오답 패턴을 함께 확인할 수 있습니다." },
  { q: "무료 체험은 어떻게 되나요?", a: "30일 무료 체험을 제공합니다. 신용카드 등록 없이 시작하고 언제든 그만둘 수 있습니다." },
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="chalk-section chalk-section--dark">
      <div className="chalk-wrap" style={{ maxWidth: 760 }}>
        <h2 className="chalk-h2" style={{ textAlign: "center", marginBottom: 40 }}>자주 묻는 질문.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="chalk-card--dark" style={{ padding: 0, overflow: "hidden" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                    gap: 12, padding: "1.1rem 1.3rem", background: "transparent", border: "none", cursor: "pointer",
                    color: "var(--title-on-dark)", fontWeight: 700, fontSize: "1rem", textAlign: "left" }}>
                  {item.q}
                  <ChevronDown size={18} color="var(--mint)" aria-hidden="true"
                    style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {isOpen && (
                  <p style={{ padding: "0 1.3rem 1.2rem", color: "var(--ink-on-dark)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `src/components/home/ChalkFooter.jsx`**:

```jsx
import { Link } from "react-router-dom";

export default function ChalkFooter() {
  return (
    <footer style={{ background: "var(--bb)", borderTop: "1px solid var(--bb-line)", color: "var(--ink-on-dark)" }}>
      <div className="chalk-wrap" style={{ padding: "3rem 1.5rem", display: "flex", flexWrap: "wrap",
        gap: 20, justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong style={{ color: "var(--title-on-dark)", fontSize: "1.05rem" }}>매스멘토스</strong>
          <p style={{ fontSize: "0.82rem", marginTop: 8, maxWidth: 360, lineHeight: 1.6 }}>
            답 대신 과정을 함께하는 AI 수학 코치. 실제 교사를 대체하지 않습니다.
          </p>
        </div>
        <nav style={{ display: "flex", gap: 18, fontSize: "0.85rem" }} aria-label="푸터 메뉴">
          <Link to="/terms" className="chalk-navlink">이용약관</Link>
          <Link to="/privacy" className="chalk-navlink">개인정보</Link>
          <Link to="/refund" className="chalk-navlink">환불정책</Link>
        </nav>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Insert into Landing.jsx** — add imports and render `<FinalCta />`, `<Faq />` inside `<main>` (after `<Pricing />`), and `<ChalkFooter />` AFTER `</main>`:

```jsx
import FinalCta from "@/components/home/FinalCta";
import Faq from "@/components/home/Faq";
import ChalkFooter from "@/components/home/ChalkFooter";
```

- [ ] **Step 5: Verify footer legal routes exist** — Run: `grep -rn "/terms\|/privacy\|/refund" src/App.jsx`. 라우트가 없으면 해당 링크를 `<a>` 텍스트로 두지 말고, 존재하는 경로만 남긴다(없는 링크 금지). 결과를 보고하고 없는 링크는 제거.
- [ ] **Step 6: Build + 시각 검증** — `export TMPDIR=/tmp && npm run build` → exit 0. dev에서 FAQ 아코디언 토글, 마지막 CTA 트레이, 푸터 링크 확인.
- [ ] **Step 7: Commit**

```bash
git add src/components/home/FinalCta.jsx src/components/home/Faq.jsx src/components/home/ChalkFooter.jsx src/pages/Landing.jsx
git commit -m "feat(home): final CTA + FAQ accordion + footer (dark)"
```

---

## Task 9: 최종 점검 + 정리

**Files:** 검증 위주. 필요 시 `src/pages/Landing.css` 정리.

- [ ] **Step 1: Landing.jsx 최종 형태 확인** — `<main>` 안 순서가 Hero → Empathy → HowItWorks → AiDemo → ParentsReport → Pricing → FinalCta → Faq, 그 뒤 `</main>` → `<ChalkFooter />` 인지 확인. `import "@/styles/chalkboard.css";` 존재, `import '@/pages/Landing.css'` 같은 원본 import 없음 확인:
  - Run: `grep -n "Landing.css\|chalkboard.css" src/pages/Landing.jsx`
  - Expected: chalkboard.css만 import, Landing.css import 없음.

- [ ] **Step 2: Landing.css 타 참조 확인** — Run: `grep -rn "Landing.css" src/`. 만약 Landing.jsx 외 다른 참조가 없으면 `git rm src/pages/Landing.css`. 참조가 있으면 삭제 보류하고 보고.

- [ ] **Step 3: 최종 build** — `export TMPDIR=/tmp && npm run build` → exit 0. 출력 마지막 줄(빌드 시간) 기록.

- [ ] **Step 4: 반응형/접근성 육안 점검** — `npm run dev` → `/landing`:
  - 데스크탑(≥1280px): 8섹션 + 푸터 다크↔밝음 교차 순서/정렬
  - 모바일(≤390px): 가로 스크롤 없음, 헤더 햄버거, 모든 섹션 1열, 버튼 탭 가능
  - `prefers-reduced-motion: reduce`(OS): draw-on/펄스 정지, 콘텐츠 정적 노출
  - 키보드 Tab: 포커스 링(민트), skip-link 동작, FAQ 토글 aria-expanded
  - 콘텐츠 정직성: ParentsReport "예시 데이터"/"예시" 라벨 노출

- [ ] **Step 5: Commit (정리분이 있으면)**

```bash
git add -A
git commit -m "chore(home): finalize landing assembly + remove unused Landing.css"
```

---

## Self-Review (작성자 확인 완료)

- **Spec 커버리지**: 디자인시스템=T0 · Hero(B1)=T2 · 공감(B2)=T3 · 작동방식(B3)=T4 · AI데모(B4)=T5 · 학부모(B5)=T6 · 요금(B6)=T7 · 마지막CTA(B7)+FAQ+Footer=T8 · 헤더/조립셸=T1 · 정리=T9. 전 비트 매핑됨.
- **콘텐츠 정직성**: ParentsReport "예시 데이터"/"예시"(T6), Pricing 가격 미조작(T7), Footer 면책 문구(T8) — 스펙 §6 충족. 후기 섹션 없음(거짓 인용 회피).
- **타입/이름 일관성**: `_motion.js` exports `fadeUp/stagger/scaleIn/drawLine` — 전 태스크 동일 사용. CSS 클래스(`chalk-section--dark/light`, `chalk-wrap`, `chalk-card--dark/--memo`, `chalk-btn`, `chalk-eq`, `chalk-kicker`, `chalk-num`, `chalk-tray`, `chalk-live`)는 T0에서 정의 → 이후 태스크가 동일 명칭 사용. 섹션 id(`#how/#demo/#parents/#pricing/#empathy/#cta/#faq`)와 헤더 nav(`#how/#demo/#parents/#pricing`) 일치(nav는 부분집합, 모두 존재).
- **Tailwind 미사용 확정**: 전 컴포넌트가 시맨틱 className + 인라인 style만 사용, Tailwind 유틸 클래스 없음 → 활성화 불필요, 앱 전역 영향 0.
- **플레이스홀더 없음**: 모든 코드 블록 완전. T8/Step5는 라우트 실재 확인 후 분기(없는 링크 금지)로 명시.
- **검증**: 러너 부재 → 각 태스크 build 게이트 + 최종 육안. 작업은 worktree `feature/home-fresh`에서.
