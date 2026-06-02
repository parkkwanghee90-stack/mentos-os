# 배포 체크리스트 — 수1(대수) 수식 깨짐 + 매핑 수정 반영

작성일: 2026-06-02 / 브랜치: `feature/su1-ka-avs`

## 런타임 데이터 경로
앱은 `/data/...`(= `public/data/`)를 fetch하며, 실패 시 Supabase Storage `mentos-assets/data/`로 폴백한다(`src/services/mathDataLoader.js`). 따라서 production 일관성을 위해 아래를 배포 시 갱신해야 한다.

## 배포 전 확인
- [x] `public/data/math_problem_texts.json` — 문제 본문 수정 반영(delimiter 6 + auto-wrap 51)
- [x] `public/data/avs_answers.json` — AVS 해설 auto-wrap 46 + 키 삭제(성질3 + 백업 7) 반영
- [x] `public/problems_index.json` — 백업 잔재 키 10 삭제 반영
- [x] `src/data/avs_answers.json` / `src/data/math_problem_texts.json` — 대수 네임스페이스 public과 동기화
- [x] vitest 전체 통과(21 files / 84 tests), 회귀 테스트 포함

## 배포 시 수동 작업(사용자 권한 필요)
- [x] Supabase Storage `mentos-assets/data/math_problem_texts.json` 업로드 완료(CLI, sha256 검증)
- [x] Supabase Storage `mentos-assets/data/avs_answers.json` 업로드 완료(CLI, sha256 검증)
- [x] Supabase Storage `mentos-assets/data/problems_index.json` 업로드 완료(일관성, sha256 검증)
- [ ] 배포 후 실기기/브라우저에서 대수 단원 렌더 스팟체크:
  - 삼각함수활용2단계(객관식 보기 $ 정상), 지수2단계/로그함수2단계(본문 수식), 삼각함수그래프2단계
  - AVS 해설(삼각함수합성과미분 등) 수식 렌더

## 남은 REVIEW 항목(이번 수정 범위 밖 — 별도 처리 권장)
- 문제 본문 A: stray `$` 짝 깨짐 + un-wrapped 혼재 항목(자동 거부됨, 약 P1/P5 잔여). 의미 판단 필요.
- 문제 본문 A: P3 중 자동 래핑 거부분(연속 `$$` 생성 위험 등).
- AVS 해설 B: `frac34`처럼 백슬래시 없이 뭉개진 plaintext 수식(예 `frac3740` → `\frac{37}{40}`? 경계 모호) — 수기 확정 필요.
- 원본 데이터에 이미 존재하던 `$$$`(예: `지수로그4단계/074a.webp`, `4)삼각함수합성과미분/003.webp`).
- problemsIndex↔answersMaster 단원명/문제수 불일치(리포트만, 표준화는 별도).
- 삼각함수성질3단계 실제 문제 소스 확보 시 로드.

리포트: `docs/superpowers/specs/2026-06-02-*` (mapping-audit / latex-audit / latex-review-list / *-diff / *-log).
