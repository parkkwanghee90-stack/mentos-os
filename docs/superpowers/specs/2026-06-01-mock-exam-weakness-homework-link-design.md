# 모의고사 오답 → 취약단원 → 숙제 연결 설계

- 작성일: 2026-06-01
- 상태: 설계 승인됨 (구현 전)
- 관련 코드: `mentos-os` (수학 학습 웹앱)

## 1. 문제 정의

모의고사(월간테스트)에서 학생이 틀린 문제가 (1) 취약단원 진단에 반영되어야 하고, (2) 숙제(오답복습 노트)로도 연결되어야 하는데, 현재 둘 다 되지 않는다. 모의고사 채점 결과가 다른 어떤 시스템으로도 흘러가지 않는 "고아 데이터"다.

## 2. 현재 상태 (코드 검증 완료)

| 흐름 | 현재 동작 | 위치 |
|------|-----------|------|
| 모의고사 틀린 문제 기록 | `monthly_test_results` localStorage에만 저장. `addWrong` 미호출 | `src/pages/Dashboard.jsx` `submitMonthlyTest` (~L523) |
| 채점 결과 구조 | `problemDetails[{ id, hwId, unit, num, numStr, imagePath, solutionPath, hintKey, correctAnswer, userAnswer, isCorrect }]` + `unitDiagnoses` | `src/engine/math/monthlyTest.js` `gradeMonthlyTest` |
| 취약단원 분석 입력 | (A) `mentos_lesson_results`(수업) + (B) `hw_progress_*`(숙제 진도)만. 모의고사 결과·오답스토어 미참조 | `src/engine/math/mathWeaknessReporter.js` `analyzeMathWeakness` (L14, L36) |
| 오답복습 노트(숙제) | `getActiveWrongAnswers()`(오답스토어)만 읽음 | `src/pages/HomeworkMathBox.jsx` (L83-98) |
| 오답스토어 적재 | 숙제 채점 시 `addWrong`만 | `src/pages/HomeworkMathBox.jsx` (L225, L266) |
| (작동 중) 모의고사 출제 | `getActiveWrongAnswers()` 누적오답 우선 출제 → 숙제오답→모의고사 방향은 이미 연결됨 | `monthlyTest.js` `generateMonthlyTestProblems` |

오답스토어 엔트리 구조 (`src/services/wrongAnswerStore.js`): `{ hwId, num, unit, answerKey, firstWrongAt, lastSeenAt, resolved, resolvedAt }`. 키는 `(hwId, num)`. API: `addWrong(entry)`, `markResolved(hwId, num)`, `getActiveWrongAnswers()` (firstWrongAt+30일 이내).

**끊긴 지점**: ① 모의고사 채점 → 오답스토어(미연결), ② 취약단원 분석 → 오답스토어(미참조).

## 3. 목표 (사용자 확정)

1. 모의고사 오답이 **오답복습 노트(숙제)** 와 **취약단원 진단** 둘 다에 자동 반영된다 (end-to-end).
2. 모의고사 성적은 **숙제 진도/완료율 통계와 분리** — `hw_progress`를 오염시키지 않는다. (평가와 연습 구분)

## 4. 접근법 (승인: 오답스토어 허브, 최소 배선)

오답스토어를 단일 허브로 두고 끊긴 화살표 2개만 잇는다. 모의고사 문제도 `(hwId, num)`를 가지므로 같은 문제는 숙제 오답과 자연 병합된다.

```
모의고사 제출 → gradeMonthlyTest → problemDetails
   ├─① 오답 addWrong / 정답 markResolved → wrongAnswerStore (허브)
   │        ├─→ 오답복습 노트(숙제)      [기존 reader, 자동]
   │        └─→ 월간/모의고사 재출제       [기존 누적오답 우선, 자동]
   └─② analyzeMathWeakness 입력 C ← wrongAnswerStore → 취약단원 진단/리포트/격주 출제
   ※ hw_progress 미변경 → 숙제 완료율 분리 유지
```

## 5. 변경 사항 (3개 파일)

### 5.1 `src/engine/math/monthlyTest.js`
- `generateMonthlyTestProblems`: 문제 객체에 `answerKey: hwUnit.answerKey` 추가. (오답복습 노트가 `resolveAnswer(e.answerKey, e.num)`로 정답 조회하므로 필수)
- 신규 `recordMonthlyTestWrongs(grading)` (순수·테스트 가능):
  - `grading.problemDetails` 순회.
  - `isCorrect === false` → `addWrong({ hwId, num, unit, answerKey })`.
  - `isCorrect === true` → `markResolved(hwId, num)` (재응시로 극복 시 오답목록에서 제거 — 루프 닫기).
  - 항목별 가드: `hwId && num`가 없거나 `answerKey`가 없으면 skip.
  - 전체 `try/catch`로 감싸 실패해도 throw 안 함(콘솔 경고 후 계속).
  - `wrongAnswerStore`에서 `addWrong, markResolved` import.

### 5.2 `src/pages/Dashboard.jsx`
- `submitMonthlyTest`에서 `gradeMonthlyTest` 직후 `recordMonthlyTestWrongs(grading)` 호출 한 줄 추가. 나머지(학부모 푸시, `monthly_test_results` 저장, 상태 전환)는 그대로.

### 5.3 `src/engine/math/mathWeaknessReporter.js`
- `analyzeMathWeakness`에 **입력 C** 추가 (소스 B 다음):
  - 소스 B(`hw_progress`) 처리 중 틀린 항목 키 `${hw.id}:${pid}`를 `countedKeys: Set`에 적재.
  - `getActiveWrongAnswers()` 순회 (`try/catch`, 실패 시 A·B만 반환):
    - 키 `${e.hwId}:${e.num}`가 `countedKeys`에 있으면 skip(중복 방지 — 숙제 오답 재계상 금지).
    - 없으면(모의고사 전용 오답) `unitStats[e.unit]`에 `wrongCount++`, `totalQuestions++`(지표 정합성: 오답 1 = 시도 1), `wrongIndices.push(e.num)`.
  - 단원명: `e.unit`(= 문제의 `hwUnit.relatedUnit||title`)과 소스 B의 `hw.relatedUnit||hw.title` 동일 규칙으로 일치.
  - `hw_progress`는 읽기만, 쓰지 않음.

## 6. 데이터 흐름 정합성

- **중복 제거**: 같은 `(hwId, num)`가 숙제 오답이자 모의고사 오답이면 소스 B에서 1회만 계상, 입력 C에서 skip. 오답스토어 자체도 `(hwId,num)` upsert라 엔트리는 1개.
- **지표**: `errorRate = wrong/total`. 입력 C가 wrong과 total을 함께 올리므로 분모 누락/100% 초과 없음.
- **정렬**: 기존 `wrong 수 → errorRate` 유지. 모의고사 오답 누적 시 해당 단원이 상위 취약단원으로 자연 상승.

## 7. 에러 처리

- `recordMonthlyTestWrongs`: 항목 가드(`hwId && num && answerKey`) + 전체 try/catch(경고 후 계속). 제출 흐름이 스토어 쓰기 실패로 깨지지 않음.
- `analyzeMathWeakness` 입력 C: `getActiveWrongAnswers()` try/catch, 실패 시 기존 A·B 결과로 graceful degradation.

## 8. 테스트 (TDD, vitest + jsdom)

1. `recordMonthlyTestWrongs`: 오답→`addWrong` 엔트리 생성, 정답→`markResolved`, `answerKey` 누락 항목 skip.
2. `analyzeMathWeakness` 입력 C: (a) 모의고사 전용 오답이 취약단원에 반영, (b) 숙제+모의고사 동일 `(hwId,num)` 중복 비계상, (c) `errorRate` 분모 정상.
3. **분리 회귀 테스트**: `recordMonthlyTestWrongs` 실행 후 `hw_progress_*` 불변(숙제 완료율 영향 없음).
4. Red→Green 확인. 기존 23 테스트 + 신규 전부 통과.

## 9. 범위 밖 (YAGNI)

- 격주테스트(`generateFortnightlyTestProblems`)가 모의고사 오답 '문항 자체'를 후보풀로 직접 참조하도록 배선하지 않음. 단원은 취약으로 잡히고, 정확한 문항 재출제는 오답복습 노트·모의고사 경로가 담당.
- 오답 출처 배지(`source: 'exam'|'homework'`)·가중치(접근법 3) 제외.
- 모의고사 결과를 Supabase 미러링하는 작업 제외(localStorage 범위 유지).

## 10. 성공 기준

- 모의고사 제출 후, 틀린 문제가 오답복습 노트에 나타나고 다시 풀 수 있다.
- 모의고사에서만 틀린 단원이 취약단원 TOP에 반영된다.
- 숙제 완료율/진도 통계는 모의고사 제출 전후로 변하지 않는다.
- `npm test` 전부 통과, `npm run build` 성공.
