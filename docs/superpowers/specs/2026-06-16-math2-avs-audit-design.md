# 수학2 AVS 풀이 전수조사·재작성 설계

- 작성일: 2026-06-16
- 브랜치: `feat/math2-avs-audit`
- 대상: `src/data/homework_avs/수학2_*/{pid}.json` (7단원, 실제 문제 277개)

## 배경

수학2 AVS(AI Vision Solution) 해설은 PCBSA(P/C/B/S/A) 구조의 JSON으로 저장된다.
구조 필드는 277개 전부 채워져 있으나(빈 필드 0), 풀이 과정·내용의 **정확성**은 미검증이다.
01·02·03 단원은 과거 QA 패스(`_qa_*.json` 기록, 수정 반영됨)가 있고, 04~07은 미감사다.
"미비"는 구조 결손이 아니라 **내용 정확성 결함**(풀이 누락·오답·거짓 인수분해·조건 오전사 등)을 뜻한다.

## PCBSA 스키마

| 필드 | 역할 |
|---|---|
| `P` | 문제 요구(무엇을 구하는가) |
| `C` | 주어진 조건(함수·점·수치·객관식 보기) |
| `B` | 개념·접근(풀이에 필요한 정리/전략) |
| `S` | 단계별 **실제 계산** 전개 (계획문이 아닌 수식 전개) |
| `A` | 최종 정답 표기 (`\boxed{...}`) |

비-PCBSA 필드: `title`, `type`, `S_objects`(해설 이미지 참조), `finalAnswer`, `correctAnswer`, `pcbsa_completed`, `vision_*`.

## 데이터 / 정합성 SSOT

- **채점 SSOT** = `src/data/avs_answers.json` 키 `수학2_NN단원_통합숙제 → {pid: 정답}`. 7단원 전부 존재.
- 채점기(`HomeworkMathBox normalizeAnswer`)는 `공백제거 + ①→1` 후 사실상 exact-match → **정답 포맷 보존 필수**.
- 문제 이미지(원본) = Supabase 공개 버킷:
  `https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets/math_crops/homework/math2/{eng단원}/{pid}.webp`(문제)·`{pid}a.webp`(해설).
- 단원 영문 매핑(`src/config/pathMapping.js`):
  `01_limit · 02_continuity · 03_derivative_coeff · 04_derivative_util_12 · 05_derivative_util_3 · 06_integral · 07_def_integral_util`

## 검증 프로토콜 (문제 1개 = 단위 작업)

1. **이미지 취득** — `{pid}.webp`(문제)·`{pid}a.webp`(해설) 다운로드.
2. **문제 판독** — 이미지에서 실제 문제·조건·객관식 보기 전사.
3. **독립 풀이** — 처음부터 직접 풀어 정답 도출.
4. **전사 검증** — `P`+`C`가 이미지 문제를 정확히 복원하는가 (조건 오전사 적발).
5. **구조 검증** — P/C/B/S/A 역할 충족.
6. **풀이 검증** — `S`가 계획문이 아닌 실제 전개인가 · 각 단계 수학적 정확성 · 답 도달.
7. **정답 검증** — `finalAnswer` = `correctAnswer` = `avs_answers.json[단원][pid]` = 독립 답. 객관식은 보기번호 표기 정확성.

## 결함 등급

- **CRITICAL**: 정답 오류 / 채점 SSOT 불일치 → 학생 채점에 직접 영향.
- **HIGH**: 풀이 논리·계산 오류, 거짓 인수분해, 핵심 계산 누락("계획만"), 문제를 바꾸는 전사 오류.
- **MEDIUM**: 단계 불완전, 개념(B) 부실, 답 포맷 오류(맨숫자↔보기번호), KaTeX 깨짐.
- **LOW**: 문체·가독성.

## 재작성 규칙 (불변성 — 새 내용으로 교체)

- HIGH/MEDIUM 결함은 `P/C/B/S/A` **즉시 재작성**. 비-PCBSA 필드 보존.
- **정답 포맷 보존**: A의 채점 가능 값 유지(객관식 보기번호 표기).
- **정답값 변경(CRITICAL)**: 검증 답 ≠ 저장 답이면 문제 JSON + `avs_answers.json` **동시 정정(같은 커밋)**. QA리포트에 별도 "정답 변경(채점 영향)" 섹션으로 전부 기록 → 사람 검토 강조.
- `S_objects` 이미지 참조는 날조 금지·그대로 유지.

## 이미지↔pid 정합 (+1 시프트)

단원마다 첫 문제로 이미지-문제 정합 확인. 체계적 시프트 감지 시 **재작성 금지·플래그**(잘못된 이미지 대조로 정상 풀이를 훼손하지 않도록).

## 산출물 (단원별)

- `_qa_{단원}.json` 갱신: `[{pid, status: pass|rewritten, severity, issues[], answerChanged}]`.
- 단원별 마크다운 요약 + 전체 종합 리포트.

## 실행 계획

- 작업 브랜치 `feat/math2-avs-audit` (main 직접 커밋 금지).
- **파일럿**: 04단원 40문제(001~042 중, 009·021 결번) 이미지 기반 검증+재작성 → 결과·품질·비용 검토.
- 승인 시 나머지 237문제(01·02·03·05·06·07) 병렬 오케스트레이션 확장.
- 단원별 커밋, 최종 PR.

## 검증된 사실 (파일럿 사전 확인)

- 이미지 HTTP 접근 정상(문제 크롭 200 OK).
- 04/001 엔드투엔드 검증: 문제 `f(x)=x³−ax`, 점 (0,16) 접선 기울기 8 → t=−2, a=4, **f(4)=48** = 저장 답 = 채점키. **PASS**, 시프트 없음.
