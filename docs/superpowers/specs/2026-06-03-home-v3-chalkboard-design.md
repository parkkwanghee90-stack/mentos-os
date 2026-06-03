# 매스멘토스 홈화면 V3 — "칠판 다크테크" 디자인 스펙

- **작성일**: 2026-06-03
- **브랜치/워크트리**: `feature/home-fresh` (`.claude/worktrees/home-fresh`, base = `main` 56fe92c)
- **대상**: 랜딩 홈(`/`) = `src/pages/Landing.jsx` (+ 신규 `src/components/home/*`, 신규 `src/styles/chalkboard.css`)
- **배경**: 직전 재디자인(`feature/mainpaage`, 애플 라이트 블루 + 9섹션)을 사용자가 거부. 거부 사유 = ① 너무 흔함/AI가 만든 티 ② 컬러·톤 ③ 레이아웃·구조. (메시지 카피 톤은 문제없음 → 계승)
- **스택**: Vite + React 19, Tailwind v4, Framer Motion 12, lucide-react, react-router-dom 7

---

## 0. 목표

"AI가 만든 흔한 SaaS 템플릿"에서 벗어나, **제품 고유의 정체성(AVS 녹색칠판)** 에서 끌어낸
**개성 있고 독창적인 "칠판 다크테크"** 비주얼로 홈을 다시 만든다.

핵심 메시지(계승): **"답은 알려주지 않아. 같이 푸는 거야."**
— 막힐 때마다 네 풀이를 보고 다음 한 칸을 분필로 짚어주는 AI 수학 코치.

---

## 1. 확정된 의사결정 (브레인스토밍 결과)

| 항목 | 선택 | 근거 |
|---|---|---|
| **작업 베이스** | 신규 워크트리 `feature/home-fresh` (main 기준, 깨끗한 원본 홈) | 직전 스코프 결과 전면 폐기, 처음부터 |
| **아트 디렉션** | **칠판 다크테크** (딥 그린블랙 + 네온 분필 민트) | 제품 AVS 녹색칠판과 연결 → "남의 템플릿" 아닌 우리만의 정체성, 차별화+몰입 |
| **다크 적용 범위** | **다크↔밝음 교차** | 히어로·데모는 칠판 몰입, 정보 많은 섹션(공감·요금·FAQ)은 밝게 가독성 |
| **구조** | **7비트** (직전 9섹션 → 타이트하게 재구성) | 직전 구조 거부 |
| **메시지 톤** | 감성 코칭 카피 계승 | 직전에 톤은 문제없다고 확인됨 |
| **콘텐츠 정직성** | 거짓 후기·과장 수치 금지, 리포트 "예시 데이터" 라벨 | 표시광고법 |
| **애니메이션** | Framer Motion (분필 draw-on·글로우) + `prefers-reduced-motion` 존중 | 개성의 핵심 |

---

## 2. 디자인 시스템 — "우리만의 칠판"

### 2.1 컬러

**다크 서피스 (Hero·작동방식·데모·마지막CTA·FAQ·Footer)**
| 역할 | 값 |
|---|---|
| 칠판 베이스 | `#0B1410` |
| 엘리베이션(카드/패널) | `#0F1A14` |
| 보더/그리드 라인 | `rgba(124,255,176,0.12~0.18)` |
| 본문 텍스트 | `#B9C7BF` (소프트 민트그레이) |
| 제목 텍스트 | `#F3FFF8` |

**밝은 서피스 (공감·학부모·요금)**
| 역할 | 값 |
|---|---|
| 분필가루 종이 | `#F2F4F1` |
| 잉크 텍스트 | `#0B1410` |
| 보조 텍스트 | `#5A6B61` |
| 보더 | `#E2E8E2` |

**컬러 분필 (포인트 — 카테고리 색코딩, 절제 사용)**
| 이름 | 값 | 용도 |
|---|---|---|
| 분필 민트(주) | `#7CFFB0` | 강조, CTA, 글로우 |
| 분필 노랑 | `#F2E9B8` | 손글씨 밑줄, 보조 강조 |
| 분필 코랄 | `#FF9E80` | 정답/포인트 강조 |

> 다크 위 민트 텍스트엔 글로우 `text-shadow: 0 0 22px rgba(124,255,176,0.5)` 사용. 밝은 섹션의 액센트는 글로우 없이 솔리드 그린 `#0B6B3A`.

### 2.2 타이포그래피
| 레벨 | 스펙 |
|---|---|
| Hero 제목 | `clamp(2.4rem, 7vw, 3.6rem)`, weight 850, tracking `-0.03em`, line-height 1.05 |
| 섹션 제목 | `clamp(1.75rem, 4.5vw, 2.8rem)`, weight 800, tracking `-0.025em` |
| 본문 | `1rem~1.0625rem`, line-height 1.7, `word-break: keep-all` |
| **수식·숫자** | **모노스페이스** (`"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`), 다크 위 글로우 |
| 섹션 번호 | 모노 대형 `01`~`07`, 분필색, 시그니처 마커 |
| 한글 폰트 | Pretendard (index.html CDN 기존 로딩 활용) |

### 2.3 시그니처 디테일 (개성 = 흔하지 않음)
- **분필 트레이**: 다크 히어로/CTA 하단에 나무톤 트레이 + 분필 3색 조각
- **손글씨 밑줄**: 핵심 구절 아래 SVG 곡선 밑줄(분필 노랑), 등장 시 좌→우 draw-on
- **수식 draw-on**: 단계별 수식이 한 줄씩 분필로 그려지듯 순차 등장 (Framer + opacity/clip)
- **분필 그레인 + 옅은 그리드**: 다크 섹션 배경에 radial dot 그레인 + 40px 그리드(투명도 0.05)
- **지우개 스머지**: 코너 장식용 흐릿한 호(arc)
- **라이브 글로우 펄스**: "코칭 중" 같은 라이브 요소에 민트 펄스

### 2.4 모션 (Framer Motion)
- 공용 variants `src/components/home/_motion.js`: `fadeUp`, `stagger`, `scaleIn`, `drawLine`(밑줄/수식용 pathLength 또는 clip)
- 스크롤 진입: `whileInView` + `viewport={{ once:true, margin:"-80px" }}`
- 수식 단계: stagger로 한 줄씩
- **접근성**: `prefers-reduced-motion: reduce` 시 draw-on/글로우/펄스 정지, 정적 표시

---

## 3. 구조 (7비트 · 다크↔밝음 리듬)

> 섹션 id는 헤더 nav anchor와 일치시킨다.

### B1. Hero — 다크 `#hero`(앵커 불요) / 섹션 id 없음 (최상단)
- 좌: 모노 kicker(`// MATHMENTOS · AI 수학 코치`) → 대형 제목 **"답은 알려주지 않아.\n같이 푸는 거야."**(민트 글로우 + 노랑 손글씨 밑줄) → 서브 → CTA 2개(`30일 무료 체험`, `풀이 보기 ▶`)
- 우: 칠판에서 `x²−5x+6=0`가 한 줄씩 분필로 풀리는 라이브 + 힌트 박스(점선)
- 하단: 분필 트레이 + 분필 3색

### B2. 공감 — 밝음 `#empathy`
- 제목 "이런 적 있죠?" / 막히는 순간 4가지를 **분필 메모 카드**(약간 기울어진 손글씨 느낌)로
- 카드: 조금만 바뀌면 막힘 · 왜 틀렸는지 모름 · 물어볼 사람 없음 · 풀이를 외우기만

### B3. 작동 방식 — 다크 `#how`
- 제목 "칠판이 채워지는 방식" / AVS 코칭 4단계를 칠판 채워지듯 모노 + draw-on
- 단계: ① 네 풀이를 읽어요 ② 막힌 칸을 찾아요 ③ 답 대신 힌트 ④ 스스로 확인
- 각 단계 분필색 번호 `01~04`

### B4. AI 데모 — 다크(시그니처) `#demo`
- 제목 "실시간으로, 이렇게 같이" / 학생이 쓰고 AI가 분필로 힌트 다는 대화형 칠판
- 채팅 버블(학생=민트 솔리드, AI=다크+민트보더) 순차 등장 + "AI 누리가 분필 드는 중…" 펄스
- 기능 칩 4개: 음성 힌트 · 단계 풀이 · AI 피드백 · 답안 분석

### B5. 학부모·신뢰 — 밝음 `#parents`
- 제목 "아이가 어떻게 공부하는지, 함께 봅니다"
- 리포트 미리보기 카드(막대 그래프) — **"예시 데이터" 배지 필수**, 지표는 "예시"
- 신뢰 포인트: 학습 리포트 · 공부 시간 · 안전한 환경 · 오답 패턴

### B6. 요금 — 밝음 `#pricing`
- 제목 "심플한 요금제" / **Free**(체험) · **Premium**(AI 코칭) 2카드, Premium 강조
- **가격 숫자 미조작** — 기능 차이 중심, CTA `/login`

### B7. 마지막 CTA — 다크 `#cta`
- 칠판 위 대형 마무리 카피 **"막히는 순간, 바로 옆에 분필이 있어."**(또는 유사) + `무료로 시작하기`
- 분필 트레이 재등장으로 수미상관

### + FAQ — 다크 `#faq` / Footer — 다크
- FAQ 아코디언(다크 톤), Footer(브랜드·법무 링크·면책 "실제 교사를 대체하지 않습니다")

---

## 4. 파일 아키텍처

> 원본 `main`의 홈은 단일 `src/pages/Landing.jsx` + `src/pages/Landing.css`.
> 이를 **컴포넌트 분리 + 신규 칠판 스타일**로 재구성한다. immutable 패턴, 파일당 200–400줄(최대 800).

```
src/pages/Landing.jsx              # 재작성 — 조립 (Landing.css import 제거)
src/styles/chalkboard.css          # ★신규 — @theme 토큰 + 칠판 유틸(그레인/그리드/트레이/글로우/draw)
src/main.jsx                       # chalkboard.css import 추가 (Landing.css 대체)

src/components/home/
  ChalkHeader.jsx        # ★신규 — 다크 헤더 + nav(#how,#demo,#parents,#pricing) + CTA
  Hero.jsx               # ★신규 — 칠판 히어로 + 라이브 수식
  Empathy.jsx            # ★신규 — 밝음, 분필 메모 4카드 (#empathy)
  HowItWorks.jsx         # ★신규 — 다크, 4단계 draw-on (#how)
  AiDemo.jsx             # ★신규 — 다크 대화형 칠판 (#demo)
  ParentsReport.jsx      # ★신규 — 밝음, 리포트 미리보기("예시") (#parents)
  Pricing.jsx            # ★신규 — 밝음, Free/Premium (#pricing)
  FinalCta.jsx           # ★신규 — 다크 마무리 (#cta)
  Faq.jsx                # ★신규 — 다크 아코디언 (#faq)
  ChalkFooter.jsx        # ★신규 — 다크 푸터
  _motion.js             # ★신규 — 공용 variants(fadeUp/stagger/scaleIn/drawLine)
  ChalkTray.jsx          # ★신규 — 재사용 분필 트레이 장식 (Hero/FinalCta 공용, DRY)
  ChalkUnderline.jsx     # ★신규 — 재사용 손글씨 SVG 밑줄 (draw-on)
```

> 원본 `src/pages/Landing.css`는 신규 홈에서 미사용 → import 제거. 파일은 즉시 삭제하지 않고(다른 참조 확인 후) 정리 태스크에서 처리.

---

## 5. 반응형 / 접근성

- **모바일**: Hero 세로 1열, 수식 칠판은 카피 아래로, 버튼 풀폭. 다크↔밝음 교차 유지. `overflow-x-hidden` 가드
- **대비**: 다크 위 본문 `#B9C7BF`/제목 `#F3FFF8`, 밝음 위 `#0B1410` — WCAG AA 충족
- **모션 축소**: `prefers-reduced-motion: reduce` → draw-on/글로우/펄스 비활성, 정적 노출
- **시맨틱**: `<main>`, 섹션 heading 위계, skip-link, 포커스 링(민트). lucide 아이콘엔 `aria-hidden`, 인터랙티브엔 `aria-label`
- **모노 폰트 폴백**: 시스템 모노 스택으로 웹폰트 미로드 시에도 안전

---

## 6. 콘텐츠 정직성 규칙 (법적)

- 검증 안 된 사용자 수·성적 향상 수치 **금지**
- 후기 미확보 → 사용 시나리오/제품 기능 기술로 대체(거짓 인용 금지)
- 리포트/그래프는 **"예시 데이터" 라벨** 필수
- 제품이 실제 제공하는 것(단계 힌트·AVS·12명 AI 선생님·오답 분석)만 사실로 기술

---

## 7. 비범위 (Out of Scope)

- 실제 AI/백엔드 데모 연동 (데모는 프론트 시각 연출)
- 로그인/체크아웃 등 타 페이지 (CTA 링크는 기존 `/login`)
- 실제 후기/통계 수집
- 신규 한글 웹폰트 도입 (Pretendard 기존 CDN 활용; 모노는 시스템 폴백 우선, 필요 시 경량 추가 검토)

---

## 8. 성공 기준

- [ ] 7비트 + FAQ/Footer 전부 칠판 다크테크 톤(다크↔밝음 교차)으로 렌더, 빌드 0 에러
- [ ] Hero에 라이브 수식 draw-on + 분필 트레이 + 손글씨 밑줄
- [ ] AiDemo 대화형 칠판 동작
- [ ] 컬러 분필 3색 모티프 일관 적용
- [ ] 모든 수치성 콘텐츠 "예시 데이터" 라벨 또는 검증된 사실만
- [ ] 모바일(≤390px) overflow 없음, 교차 톤 유지
- [ ] `prefers-reduced-motion` 존중
- [ ] 파일당 ≤800줄, immutable 패턴, 공용 모션/장식 DRY
