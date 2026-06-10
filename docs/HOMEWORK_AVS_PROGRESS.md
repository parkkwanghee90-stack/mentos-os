# 📦 숙제(통합숙제) AVS 생성 진행상황

## 상태: 1차 베이스라인 완료 (2026-06-07)

숙제 AVS는 **전무**였음(Gemini가 만들었다고 거짓보고). 실측 확인 후 생성·업로드.

### 완료
- **39단원 / 1,863개 AVS 생성·업로드** (Supabase mentos-assets/math_hints/*_homework/), 실패 0, HTTP 200 검증
- 앱 코드 수정: `HintPlayerRouter` 통합숙제 힌트를 **resolveAsset(Supabase)** 로 로드 (이전엔 로컬-only → 배포 404)
- 문제↔해설 매칭 검증 (고차방정식 015 등), **미적분 +1 시프트** 적용(문제 N 해설=(N+1)a.webp)

### 생성 방식 (안정/무환각)
`scripts/gen_homework_avs_template.cjs` (노트북 `generateHomeworkAVS.cjs` 기반):
- **P·C·B** = 단원별 개념 템플릿 (사고력 개념·접근·핵심공식 KaTeX)
- **S** = **실제 선생님 해설 이미지**(`S_objects:[{type:image,src}]`) — LLM 재생성 안 함 → 환각 없음
- **A** = 검증된 avs_answers 정답(객관식 번호 등)

> ⚠️ 폐기: 초기 Gemini-비전 재생성 방식(`generate_homework_avs.cjs`)은 자가 auto-QA에서 3/5 오류(풀이 환각) → 사용 안 함.

### 이미지 연결
- **1,839 / 1,863 (98.7%)** 실제 해설이미지 연결
- 24개는 이미지 없음(개념+정답만): 미적분 각 단원 마지막(시프트 끝) + 해설크롭 누락분

### 품질 등급 (정직)
- 현재: **신뢰 가능한 베이스라인** — 개념 템플릿 + 실제 해설이미지(이게 사고력 핵심 내용)
- 한계: P/C/B가 **단원별 공통**(문제별 맞춤 아님). 문제별 풍부한 서술+도형렌더는 아래 업그레이드 영역.
- **다음(전수검사)**: `scripts/verify_homework_avs.cjs`(적대적 auto-QA: 매칭·정답·**사고력 깊이**·수식) 돌려 → 부족 단원만 **v6(gpt-4o+기하엔진)** 으로 고급 재생성. 등급별 차등 해설도 이 단계.

### 도구
- `scripts/gen_homework_avs_template.cjs` — 생성(템플릿+해설이미지)
- `scripts/upload_homework_avs.cjs` — Supabase 업로드(getSafePath 경로)
- `scripts/verify_homework_avs.cjs` — auto-QA 검증(매칭/정답/깊이/수식 → 플래그)
