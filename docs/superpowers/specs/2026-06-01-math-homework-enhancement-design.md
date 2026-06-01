# 수학 숙제 시스템 고도화 설계 (Design Spec)

- **작성일:** 2026-06-01
- **브랜치:** `feature/mathmentos_homework`
- **범위:** 수학 과목 한정 (영어·과학은 추후 오픈 예정, 본 작업 제외)
- **검증 기준:** Vitest 단위테스트 green + `npm run build` 성공

---

## 1. 목적

1. 모든 단원의 수학 숙제 시스템을 **오류 없이 완성**한다.
2. 숙제 시스템의 약점들을 파악해 **보완 수정**한다.

## 2. 결과물 (Deliverables)

- **W1.** 틀린 문제를 숙제(오답 노트)에 **자동 누적**. 푼 문제도 30일간 누적 노출.
- **W2.** 숙제 완료 시 **대시보드 기록 + 학부모 푸시**.
- **W3.** **2주(격주) + 월간 테스트**에 숙제/오답 데이터를 사용.
- **W4.** 전 단원 **무오류 완성** + 약점 보안 수정(Supabase 동기화 포함).

## 3. 사전 조사 결과 (검증 완료)

기존 인프라는 성숙하며, 다음이 **이미 구현**되어 있다:

- `mathWeaknessReporter.js`: `analyzeMathWeakness()`(수업+숙제 오답 단원별 집계), `generateFortnightlyTestProblems()`(취약단원 오답우선 20문항), `gradeFortnightlyTest()`, `sendFortnightlyParentPush()`
- `pushService.js`: 실제 구현 (Supabase `push_notifications` + CoolSMS REST API + 카카오 알림톡). 목 아님.
- 2주(격주) 테스트는 `Dashboard.jsx`에서 생성·채점·학부모 푸시까지 **완전히 연결됨**.
- 수업 종료 시 학부모 푸시(`finalizeSession.js`) 작동.

**선반영된 버그 수정:** `src/services/homeworkGenerator.js:311`의 `getHomeworkRange` 미임포트로 인한 수업 종료 후 숙제 생성 크래시 → import 1줄 추가로 수정 완료(빌드 검증).

**목표 대비 실제 신규/수정 항목:**

| # | 작업 | 현재 상태 | 작업 유형 |
|---|------|-----------|-----------|
| W1 | 오답 → 숙제 누적 | 전용 "오답 숙제" 없음 (오답은 2주 테스트에만 사용) | 신규 |
| W2 | 완료 → 대시보드+푸시 | 대시보드 집계 일부 / 완료 푸시 없음 | 일부 신규 |
| W3 | 2주 + 월간 테스트 | 2주 완성 / 월간 없음 | 월간 신규 |
| W4 | 무오류 + 보안 | getHomeworkRange 수정됨 / "3" 더미·localStorage 한계 잔존 | 검증+수정 |

## 4. 아키텍처 — 오프라인-우선 + 동기화 계층 (A안 승인)

```
UI (HomeworkMathBox, Dashboard, MonthlyTest)
   훅: handleGrade / handleShowAVS / handleFinish
        ↓ 기록
신규 서비스 계층 (순수 로직, Vitest 대상)
 • wrongAnswerStore.js   오답 수집·30일 보존·조회
 • homeworkCompletion.js 완료 판정·요약·중복 푸시 가드
 • monthlyTest.js        월간 테스트 생성·채점·푸시
 • answerResolver.js     정답 로딩 단일화 ("3" 더미 제거)
        ↓ 로컬 SSOT            ↓ 미러링/hydrate
 localStorage  ←──────→  syncService.js → Supabase
 (즉시 읽기/쓰기)        (타임스탬프 merge, 로그인 hydrate)
```

**원칙:** localStorage가 세션 진실원천(기존 패턴 유지). 모든 쓰기를 `syncService`가 Supabase에 미러. 로그인 시 양방향 merge(최신 `updated_at` 우선). 오프라인 100% 동작. `pushService.js`의 기존 패턴(localStorage 큐 + Supabase 미러)과 일관.

## 5. 파일 구성 (작게 분리, 고응집·저결합)

**신규 서비스 (순수 함수 위주):**
- `src/services/wrongAnswerStore.js`
- `src/services/homeworkCompletion.js`
- `src/services/answerResolver.js`
- `src/services/syncService.js`
- `src/engine/math/monthlyTest.js`

**수정 (훅 연결만, 최소 침습):**
- `src/pages/HomeworkMathBox.jsx` — handleGrade/handleShowAVS/handleFinish 훅 추가
- `src/pages/Dashboard.jsx` — 오답노트 카드 + 월간 테스트 UI + 완료 현황 강화
- `src/data/homeworkSSOT.js` — `wrong_review` 특수 숙제 헬퍼
- `src/engine/math/mathWeaknessReporter.js` — 정답 로딩을 `answerResolver`로 교체

**테스트/설정:**
- `src/services/__tests__/*.test.js`, `src/engine/math/__tests__/monthlyTest.test.js`
- `vitest.config.js`, `package.json`에 `"test": "vitest run"` 추가
- `scripts/validate_homework_integrity.cjs` (전 단원 무결성 점검)

## 6. Supabase 스키마 (신규 3테이블, RLS)

```sql
homework_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  homework_id text not null,
  problem_id text not null,
  is_correct boolean,
  user_answer text,
  avs_viewed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, homework_id, problem_id)
);

wrong_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  unit text,
  hw_id text not null,
  problem_num int not null,
  answer_key text,
  first_wrong_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  resolved boolean default false,
  resolved_at timestamptz,
  unique(user_id, hw_id, problem_num)
);

test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  test_type text not null,            -- 'fortnightly' | 'monthly'
  accuracy int,
  correct_count int,
  total_count int,
  unit_diagnoses jsonb,
  created_at timestamptz default now()
);
```

- 모든 테이블 RLS: `user_id = auth.uid()` (anon 키 노출 안전)
- `push_notifications` 기존 테이블 재사용
- 마이그레이션 SQL은 `supabase/migrations/` 또는 문서에 기재 (적용은 대시보드/CLI)

## 7. 기능별 상세 설계

### W1 — 오답 누적 노트
- **수집 범위:** 문항 단위가 명확한 **숙제·테스트 오답만** 수집(`hw_id`+`problem_num`으로 이미지/정답 재구성 가능). 수업 오답(`mentos_lesson_results`)은 문항 번호 체계가 숙제와 달라 오답노트에 직접 넣지 않고, 기존 `analyzeMathWeakness()`의 **단원 취약 신호로만** 계속 사용(현행 유지).
- **수집 훅:** `handleGrade`에서 `isCorrect=false` 시 `wrongAnswerStore.add({unit, hwId, num, answerKey})`. `handleShowAVS`의 AVS 페널티 오답도 동일.
- **보존 정책:** 각 항목 `firstWrongAt` 보유. 이후 정답 처리되면 `resolved=true`로 마킹하되 **목록 유지**("해결됨" 배지). `firstWrongAt + 30일` 경과 시 제거.
- **노출:** `wrong_review` 특수 숙제로 모델링 → 기존 `HomeworkMathBox` 동적 숙제 렌더 경로 재사용. 숙제함/대시보드 상단 "오답 복습 노트" 카드.

### W2 — 완료 → 대시보드 기록 + 학부모 푸시
- `handleFinish`에서 `homeworkCompletion.record(homeworkId, {정답률, 오답수, 소요시간})`. localStorage+Supabase 저장.
- **전 문항 완료 시에만** `queueParentPush(요약)` 1회 발송. `homeworkCompletion`에 중복 발송 가드(이미 push된 homeworkId 기록).
- Dashboard "숙제 완료 현황" 카드가 완료 이벤트 표시(기존 집계 강화).

### W3 — 월간 테스트
- `monthlyTest.js`: 격주 엔진 미러링.
  - `generateMonthlyTestProblems(studentLevel)` — 30일 누적 오답 + 취약단원 기반 40문항
  - `gradeMonthlyTest(userAnswers, problems)`
  - `sendMonthlyParentPush(studentName, gradingResult)` → `queueParentPush`
- Dashboard에 `monthly_test_status` 상태머신 추가(격주 UI 패턴 재사용).
- 2주 테스트 로직은 변경 없음. 월간은 한 달 누적 데이터 사용. 월간 결과는 `test_results`(test_type='monthly') 저장. 2주 결과의 `test_results` 저장은 동일 헬퍼로 손쉽게 얹을 수 있으면 추가(선택), 아니면 현행 유지(필수 아님).

### W4 — 무오류 + 약점 수정
- **"3" 더미 제거:** `answerResolver.resolve(answerKey, num)` → 정답 없으면 `null` 반환 + 해당 문제 채점 제외/경고(조용한 오답 방지). `homeworkGenerator.js`, `mathWeaknessReporter.js` 양쪽 교체.
- **무결성 검증:** `scripts/validate_homework_integrity.cjs` — 모든 `HOMEWORK_UNITS`의 stages/answerKey/이미지 폴더/정답 존재 점검, 누락 리포트 출력.
- **Supabase 동기화:** `syncService` 적용(W1에서 토대 도입).

## 8. 검증 (Vitest)

- **단위테스트:**
  - `wrongAnswerStore`: 30일 경계(29일째 유지/31일째 제거), resolved 항목 목록 유지, 중복 add 시 last_seen 갱신
  - `homeworkCompletion`: 전 문항 완료 판정, 중복 푸시 가드
  - `monthlyTest`: 40문항 생성, 오답 우선 선택, 정답 없는 문제 제외
  - `answerResolver`: 정답 없을 때 `null`(더미 미생성)
- **기준:** `npm test` green + `npm run build` 성공 = "테스트 검증 완료".
- **회귀:** 기존 격주 테스트·숙제 흐름 무손상 확인.

## 9. 진행 순서 (순차)

W1 → W2 → W3 → W4, 각 W 독립 커밋.
단, `answerResolver`·`syncService`는 W1이 의존하므로 W1 단계에서 함께 도입.

## 10. 비범위 (Out of Scope)

- 영어·과학 숙제 (추후 오픈)
- 숙제 제출 OCR/AI 채점 고도화
- CoolSMS/카카오 실제 발송 키 설정 (기존 pushService 큐에 적재까지만)
