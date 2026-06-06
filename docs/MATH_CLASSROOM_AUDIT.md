# 🔎 수학 교실(MathClassroom) 정밀 검수 보고서

생성: 자동 검수 (4개 병렬 에이전트 + 직접 검증). 대상: `src/pages/MathClassroom.jsx`(≈3150줄) 및 관련 흐름/렌더/데이터/TTS.
표기: ✅=코드로 직접 검증함, ▫=에이전트 보고(추가 확인 권장).

---

## 0. 요약 (먼저 고칠 것 TOP)

| 우선 | 항목 | 위치 | 영향 |
|------|------|------|------|
| 🔴 1 | **데스크톱 채팅 입력 한글 IME 버그** | MathClassroom.jsx:2214 | 맥에서 한글 입력 중 Enter가 조합을 끊어 전송/유실 (모바일 1715는 수정됨, 데스크톱만 미수정) |
| 🔴 2 | **교실 오답 저장에 정답(correct_answer) 누락** | MathClassroom.jsx:650 | wrong_answers에 학생답만 저장, 정답 없음 → 대시보드 오답노트 비교 불가 |
| 🔴 3 | **학습시간 120분 하드코딩** | MathClassroom.jsx:764 | study_logs에 항상 120분 기록 → 학부모 리포트 학습시간 부정확 |
| 🔴 4 | **AI 튜터 호출 throttle 없음 + 키 브라우저 노출** | openaiChatApi.js | 전송 연타 시 동시 호출·비용 폭증 위험, VITE_OPENAI_API_KEY 클라이언트 노출 |
| 🟠 5 | **TTS 5턴 중 1턴만 재생** | ttsService.js:44 | 비용절감 의도지만 음성 끊김(1·6·11턴만) — UX 혼란 |
| 🟠 6 | **기하/함수 렌더 실패 케이스** | MathCanvas/HintPlayerRouter | objects 비거나 미인식 타입이면 도형이 조용히 안 그려짐 (사용자 지적 사항) |
| 🟡 7 | **세션 null 접근/검증 순서** | MathClassroom.jsx:161 vs 2833 | 세션 없을 때 flow 접근 → ErrorBoundary로만 방어 |

---

## 1. 레슨 흐름 & PCBS 단계

- ▫ **PCBS 단계 자동 진행 불완전**: 문제 내 P→C→B→SOLVE→S는 있으나, 레슨 레벨(core→step→mock→homework→finalize)은 수동 단계 버튼 의존. 문제 전환 시 `pcbsPhase`/`pcbsTurnCount`가 리셋 안 돼 이전 진행이 다음 문제로 누수. (MathClassroom.jsx:169-171, 399-403, 709-784)
- ▫ **SOLVE 단계 코칭 발화 누락**: `getPCBSNextPrompt`가 P/C/B/S만 처리, `SOLVE`는 빈 문자열 반환 → 학생이 SOLVE에서 안내 없이 멈춤. (mathPCBS_SSOT.js:66-88)
- ▫ **SSOT 검증이 흐름을 막고 복구 없음**: name/targetGrades/targetRanks 누락 시 alert 후 return, 세션 멈춤. 기본값 폴백 권장. (MathClassroom.jsx:838-851)
- ▫ **잘못된 effect 의존성**: `vocabSubPhaseIndex`(영어/과학 교실 잔재) 참조 — 수학엔 없음. (MathClassroom.jsx:785)
- ✅ **finalize가 /dashboard로 navigate**(782 부근) — 세션 종료 흐름이 매끄럽지 않을 수 있음.

## 2. 세션 라이프사이클

- ▫ **레슨 콘텐츠 로드 에러 처리 없음**: `useMathLessonSession.js`의 동적 import(`modules[targetPath]()`)가 실패 시 조용히 기본 콘텐츠로 폴백, 사용자/로그 경고 없음. (useMathLessonSession.js:39-186)
- ▫ **커리큘럼 로드 레이스 가능성**: round 초기값/상태 불일치 시 중복 fetch. (useMathLessonSession.js:37)
- ✅ **세션 null 검증 순서**: `currentPhaseFlow`(161)가 null 체크(2833)보다 먼저 평가 → 세션 null이면 crash, ErrorBoundary가 잡음. 방어 순서 개선 권장.

## 3. 문제 표시 & 기하/함수 렌더 (★ 사용자 핵심 관심)

- ▫ **크롭 이미지 404 미감지**: `window.resolveAsset()` 경로 없으면 `<img>`가 조용히 빈칸. 404 폴백 없음. (MathClassroom.jsx:1049-1208)
- ▫ **캐시버스터 하드코딩** `?v=20260429_v4` (1208) — 버전 안 맞으면 이미지 로드 실패 가능.
- ▫ **수학2/미적분4단계 강제 이미지전용**: KaTeX를 null로 → 이미지 없으면 문제 안 보임. (1309-1311)
- 🟠 **기하 렌더 실패 지점**:
  - `objects` 배열이 비거나 malformed면 Mafs가 "해설 데이터 로드 중..." 플레이스홀더에서 멈춤 (MathCanvas:355-362)
  - object `.type`이 미인식(오타 등)이면 `MathObject()`가 null 반환 → **도형이 조용히 사라짐** (MathCanvas 렌더 루프)
  - `function_plot`의 `parseExpr`가 `ln`/`arctan` 미지원, 파싱 실패 시 `()=>NaN` → **그래프 안 그려짐**
  - 삼각형 자동계산이 각 합 180 위반 시 퇴화 삼각형 생성, 검증로그 없음
  → **사용자 지적("도형/함수 안 그려짐")의 실제 원인 후보**. 재생성 시 hint JSON의 objects/타입/표현식 검증 필요.
- ▫ **AVS 힌트 없을 때 복구 불가**: 모든 fetch 실패 시 "힌트 없음" 카드만, 재시도 없음. (HintPlayerRouter:725-731)
- ▫ **KaTeX 파싱이 정규식 기반**: 이스케이프된 `\$`, 혼합 한글/수식에서 오분할 가능. ErrorBoundary 없는 렌더 경로 존재. (MathProblemRenderer:46-95)
- ▫ **힌트 폴더 매핑 60+ 하드코딩**(MathClassroom + HintPlayerRouter 두 곳) — 신규 단원 누락 위험.

## 4. 채점 & 데이터 저장

- ✅ **wrong_answers insert에 correct_answer 누락** (650): `student_id/subject/unit_folder/problem_num/wrong_answer_text`만. 테이블엔 correct_answer 컬럼 있음(숙제 경로는 채움). 교실 경로도 채우도록 수정 권장.
- ✅ **study_logs duration_minutes: 120 하드코딩** (764): 실제 경과시간(window.__mentosSessionStart) 사용해야 함.
- ▫ **answer 정규화 공격적**: `√`/`^` 제거 등으로 정답 오매칭 가능(예: √3→3). (560-588)
- ▫ **정답 조회 6단 폴백, 어느 소스 성공했는지 로그 없음** → 오답 디버깅 난해. (463-558)
- ▫ **finalize 동시 실행 레이스**: 두 탭에서 동시 종료 시 study_logs 중복·정답률 2회 집계 가능. (729-770)
- ▫ **stale gradingHistory 미삭제**: 같은 단원 재수강 시 이중 집계. (finalizeSession.js)

## 5. AI 튜터 / TTS / 외부 API

- ✅ **OpenAI 키 클라이언트 노출**: `Authorization: Bearer ${VITE_OPENAI_API_KEY}` 브라우저 fetch에 직접. 모델 gpt-4o(env override 가능). 프록시/백엔드로 이전 권장. (openaiChatApi.js:4-21)
- ▫ **호출 throttle 없음**: 전송 연타 → 동시 tutorChat 호출·비용 폭증. (handleSubmit)
- ▫ **에러 시 ok:true 반환**: 네트워크 실패도 "오프라인" reply로 위장 → 진짜 실패 구분 불가. (openaiChatApi.js:44-51)
- ✅ **TTS 5턴 중 1턴만 재생**: `(outputCount-1)%5!==0`이면 스킵 (1·6·11턴만). 비용절감 의도지만 음성 끊김. (ttsService.js:44)
- ▫ **TTS 키 브라우저 노출 + 폴백 무한**: Gemini→OpenAI→브라우저 로봇음성 폴백, 사용자에 실패 표시 없음. (ttsService.js)
- ▫ **오디오 404 시 버튼 비활성화 안 됨**: 재생 클릭→로드 실패→로그만, 버튼 그대로 → UX 데드락. (HintPlayerRouter:254+)
- ✅ **finalize 푸시 템플릿 연결됨**(lessonEnd) — 단 fire-and-forget(성공 검증 없음). (finalizeSession.js:37)

## 6. 버그 / 품질 / 데드코드

- ✅ **`MathClassroom_Mobile.jsx:821` `handeSubmit` 오타** (onKeyPress + 버튼 onClick) — 호출 시 crash. 단 **이 파일은 라우팅 미사용(데드)**으로 보임(App.jsx는 MathClassroom.jsx가 isMobile로 처리). 삭제 또는 수정 권장.
- ▫ **데드/미사용**: `TRIG_ANSWERS={}`(항상 빈 객체인데 조회함, 41/462), `introConfig`(706), `katexStyle` 미주입(23-26), 일부 lucide 아이콘/`HomeworkEngine`/`saveResult` import 미사용. (재검증 권장 — 일부는 실제 사용 중일 수 있음)
- ▫ **거대 컴포넌트(3150줄)**: 모바일/데스크톱 렌더 경로 중복(~500줄), AVS 버튼 로직 이중. 상태 20+ useState. 분리·useMemo 권장.
- ▫ **하드코딩**: `'수학'`/`'수학상'` 매직스트링, 학생ID, 교사ID 등 상수화 권장.

---

## 7. 권장 조치 (난이도/위험 순)

**즉시(저위험 1줄급)**
1. 데스크톱 입력 IME 가드 추가 (2214): `onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing)handleSubmit();}}`
2. wrong_answers insert에 `correct_answer` 추가 (650)
3. study_logs `duration_minutes`를 실제 경과시간으로 (764)
4. supabase insert 앞에 `if(!user?.id)return;` 가드

**단기**
5. AI 튜터 호출 throttle(전송 버튼 디바운스/in-flight 락) + 빈 reply 검증
6. TTS 스킵 정책 재검토(끊김 vs 비용) + 오디오 404 시 버튼 비활성화·안내
7. 기하 렌더: hint JSON objects/타입/표현식 검증 + 미렌더 시 명시적 폴백(이미지/메시지)

**구조(중기)**
8. OpenAI/Gemini 키 백엔드 프록시로 이전(클라이언트 노출 제거)
9. finalize 동시실행 락 + stale gradingHistory 정리
10. MathClassroom 컴포넌트 분리(모바일/데스크톱 공통화), 힌트 폴더 매핑 SSOT 단일화
11. PCBS 단계 리셋/SOLVE 코칭 보강

---

## 8. AVS 재생성 연계
- 본 보고서의 **3절(기하/함수 렌더)** 이 `docs/AVS_QA_CHECKLIST.md`의 🔷 단원 "재생성" 판정과 직결됨.
- 재생성 시 점검: ① objects 배열/타입 유효 ② function_plot 표현식 파서 지원 범위 ③ KaTeX 유효성 ④ 정답(A) 정확.

_검증 항목은 ✅ 표시. 나머지(▫)는 에이전트 보고로 코드 추가 확인 권장._
