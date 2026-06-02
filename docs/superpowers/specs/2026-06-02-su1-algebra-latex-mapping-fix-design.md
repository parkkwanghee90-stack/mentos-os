# 수1(대수) 수식 깨짐 + 단원 매핑 수정 — 설계 문서

- **작성일**: 2026-06-02
- **브랜치**: `feature/su1-ka-avs`
- **상태**: 설계 승인 완료 → 구현 계획 작성 대기

## 1. 배경 / 문제

수학1(대수) 파트에서 다음 세 종류의 데이터 결함이 보고됨:

1. **문제 본문 LaTeX 깨짐 (A)** — `math_problem_texts.json`에서 수식을 `$…$`로 제대로 감싸지 않거나(예: `① $2`, `⑤ 3$`처럼 `$` 짝 불균형), 줄바꿈을 가로질러 절단된 케이스. 실제 샘플 `(5)점과좌표 … /004.webp`에서 확인됨.
2. **AVS 해설 LaTeX 깨짐 (B)** — `avs_answers.json`(및 관련 사본)의 해설 수식 깨짐.
3. **단원↔문제 매핑 오류 (C)** — 예: `삼각함수성질3단계` 문제가 `삼각함수활용3단계`로 바뀐 정황. 실제로 `삼각함수성질3단계`가 `avs_answers.json`에는 있으나 `problems_index.json`에는 없고 `삼각함수활용3단계`만 존재.

### 데이터 출처 현황 (조사 결과)
- 런타임 정본: **`public/data/`** (앱이 `/data/...`로 fetch — `src/services/mathDataLoader.js`).
- `src/data/avs_answers.json`(181키) ≠ `public/data/avs_answers.json`(142키) — 이미 분기됨.
- Supabase Storage `mentos-assets/data/...` = fetch 실패 시 fallback 사본.
- 주요 파일: `public/data/math_problem_texts.json`(14,267키), `public/data/avs_answers.json`(142키), `public/data/answers_master.json`, `public/problems_index.json`.
- 단원 정규 정의: `src/data/homeworkSSOT.js` 의 "수학1 (대수)" 10단원.

## 2. 범위

**대상: 수학1(대수) 전체 단원** — 지수, 로그, 지수로그함수, 지수로그함수활용, 삼각함수 성질/그래프/활용, 등차등비수열, 수열의합, 수학적귀납법 (각 2/3/4단계 전개).

**범위 밖 (명시)**: 비대수 단원, `src/data`의 비대수 키 정리, Supabase 실제 업로드(배포 체크리스트로 분리), 이미지(webp) 자체 수정.

## 3. 접근법 (승인: ① Audit-first 단일 검토 배치)

읽기 전용 **audit 단계**와 쓰기 **fix 단계**를 분리. 신규 스크립트는 `scripts/` 아래, 기존 자산(`npm run check:math-latex`, 기존 audit 스크립트, `mojibake_audit_report.json` 패턴) 재사용/확장.

```
[Phase 0] 대수 단원 화이트리스트 확정
   homeworkSSOT 대수 10단원 → 단계(2/3/4) 전개 → "대수 단원 키 집합"
        │
[Phase 1] AUDIT (쓰기 없음) → 리포트 3종
   ├─ C. 매핑 audit    : 디스크폴더 ∩ problems_index ∩ avs_answers ∩ answers_master ∩ SSOT 교차대조
   ├─ A. 문제 LaTeX audit : math_problem_texts.json 대수 키 → 패턴 검출
   └─ B. AVS LaTeX audit  : avs_answers.json 대수 키 → 패턴 검출
        │
   ▶ 사용자 리뷰 게이트 (케이스별 확인, 특히 매핑 이동건)
        │
[Phase 2] FIX (승인 항목만) — 순서 고정: C → A → B
        │  (매핑이 단원 키를 바꾸므로 LaTeX 수정은 교정된 키 위에서 수행)
        │
[Phase 3] 검증: check:math-latex + vitest + 매핑 재-audit(0 불일치)
        │
[Phase 4] 3-출처 동기화: public/data → src/data(대수 키 선별) / Supabase는 배포 메모
```

**산출물**: ① 매핑 audit 리포트, ② LaTeX audit 리포트(문제+해설), ③ fix before/after diff 요약, ④ 검증 로그.

## 4. C — 단원↔문제 매핑 audit 로직

**교차 대조 소스 5종 (대수 한정)**:
1. 디스크 폴더명 — `public/concept_cards/[S.S.S note]_수학1_…` (실물 출처)
2. `public/problems_index.json` 키
3. `public/data/avs_answers.json` 키
4. `public/data/answers_master.json` 키
5. `src/data/homeworkSSOT.js` 대수 단원 정의 (정규 명칭/단계)

**검출 규칙**:
- (가) **키 존재 불일치**: 소스 간 단원키 존재 여부 차이 (예: `삼각함수성질3단계` avs O / index X).
- (나) **명칭 변형 그룹핑**: `단원루트+단계`로 정규화해 성질↔활용 엇갈림 검출.
- (다) **문제 수 불일치**: problems_index 개수 ≠ 디스크 파일 수 ≠ answers_master 정답 수.
- (라) **정답키 포맷 불일치**: `answers_master` ↔ `avs_answers` 포맷 차이로 매칭 실패 단원 플래그 (기존 알려진 이슈).

**판정 기준**: **디스크 폴더명 + 정답키(answers_master)** 를 1차 진실원천. 어긋난 소스를 교정 후보로 제시.
**중요**: 데이터 이동(rename/merge)이 필요한 건은 **자동 적용 금지** — `[이동제안] 활용3단계 → 성질3단계, 근거: …` 형태로 케이스별 나열 → 사용자 승인 후 적용.

**출력**: `docs/superpowers/specs/2026-06-02-mapping-audit.md` (단원별 표: 소스5종 존재여부 / 문제수 / 불일치유형 / 제안조치).

## 5. A·B — LaTeX 깨짐 audit & fix

문제 본문(A)·AVS 해설(B)은 **동일 엔진**, 대상 파일만 다름.

**검출 패턴**:
| 분류 | 예시 | 비고 |
|---|---|---|
| P1. `$` 짝 불균형 | `① $2`, `⑤ 3$` | 줄 단위 `$` 홀수 |
| P2. 줄바꿈 내부 절단 | `$2\n② $\sqrt5$` | 실제 샘플 확인 |
| P3. plaintext 수식 | `x^2`, `sqrt(5)`, `<=` | `auto_fix_plaintext_latex.js` 참고 |
| P4. mojibake/인코딩 | 깨진 ±, √ 등 | `mojibake_audit_report.json` 재사용 |
| P5. 명령어 오타 | `\sqrt5`→`\sqrt{5}`, 미닫힌 `{` | KaTeX 파싱 실패 |

**검출 방법**: 값을 `$…$` 단위 분리 → KaTeX `renderToString({throwOnError:true})` 시도 → 실패 수집 + 정규식 매칭. (앱과 동일 katex 버전 사용 → 런타임 일치.)

**자동수정 안전 등급**:
- **AUTO**: 명백·가역 — 줄 끝 댕글링 `$` 보정, `\sqrt5`→`\sqrt{5}`, 알려진 mojibake 치환표. 적용 후 **재렌더 통과 필수**.
- **REVIEW**: 의미 추론 필요(P2 모호 경계 등) → `before / 제안 / 사유` 나열 후 사용자 검토.
- 자동수정이 재렌더 실패 시 적용 취소 → REVIEW 강등.

**출력**: `docs/superpowers/specs/2026-06-02-latex-audit.md` (A/B 구분, 단원·문제별 패턴·등급·제안).
**검증**: `npm run check:math-latex` 0 에러 + 수정 항목 전수 재렌더 통과.

## 6. 3-출처 동기화

- **진실원천 = `public/data/`** — 모든 수정 먼저 적용.
- **`src/data/` 동기화**: `public/data` → `src/data` 중 **대수 단원 키만 선별 동기화**. `src/data/avs_answers.json`(181키)이 더 많으므로 **단순 덮어쓰기 금지**(비대수 데이터 손실 방지). 그 외 키 차이는 리포트에 "출처 불일치"로 기록만.
- **Supabase Storage**: 코드 자동 업로드 안 함. **"배포 시 `mentos-assets/data/` 갱신 필요"** 체크리스트 항목으로 분리.

## 7. 에러 처리

- **백업 먼저**(`*.bak` 또는 git 의존) 후 쓰기. 실패 시 원본 보존.
- JSON 파싱/쓰기 try-catch. 부분 실패 시 해당 단원만 스킵 + 리포트 기록(전체 중단 X).
- **불변성**: 원본 객체 변형 없이 새 객체 생성 후 직렬화.
- 자동수정 후 KaTeX 재렌더 실패 → 롤백 + REVIEW 강등.

## 8. 테스트 (vitest, `src/data/__tests__/`)

- **매핑 불변식**: 대수 단원 키 집합이 problems_index·avs_answers·answers_master에서 일치 → fix 후 green.
- **LaTeX 회귀**: 알려진 깨짐 샘플(예: 점과좌표 004 `$2`/`3$`)이 수정본에서 KaTeX 통과.
- **Red-Green 검증**: 수정 되돌리면 FAIL 확인.
- 전체: `npm run check:math-latex`, `npm test` 통과 로그 첨부.

## 9. 완료 기준 (Definition of Done)

- [ ] 매핑 audit 리포트 + 사용자 승인된 이동/수정 적용, 재-audit 0 불일치.
- [ ] LaTeX audit 리포트 + AUTO 적용(재렌더 통과) + REVIEW 항목 사용자 검토 반영.
- [ ] `npm run check:math-latex` 0 에러, `npm test` 통과(증거 로그).
- [ ] `public/data` 수정 + `src/data` 대수 키 동기화.
- [ ] Supabase 갱신은 배포 체크리스트로 문서화.
