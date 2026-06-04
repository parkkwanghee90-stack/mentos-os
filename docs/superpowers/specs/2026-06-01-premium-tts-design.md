# Premium Lecture TTS — 커버리지 확대 + 음색 일관성 (설계)

- 날짜: 2026-06-01
- 브랜치: `feature/mathmentos_premium_tts`
- 전략: **접근법 A** (경로 버그 수정 → 매핑 통합 → 갭만 생성 → 로봇 폴백 제거)
- 생성 방식: **강의당 단일 호출 합성** + ffmpeg 무음 분할 (실패 시 스텝별 자동 폴백)

---

## 1. 배경 / 문제 정의

프리미엄 AI 강의(`PremiumLecturePlayer`)는 Gemini 3.1 TTS(`Aoede`)로 사전 생성한
스텝별 MP3를 Supabase `mentos-assets` 버킷에서 스트리밍한다. 사용자가 보고한
체감 문제는 **"음색/화자 일관성"** 이지만, 조사 결과 근본 원인은 둘이다.

### 1.1 경로 불일치 버그 (가장 큰 원인, 실측 확인)

`PremiumLecturePlayer.jsx`는 오디오 URL을 만들 때 baseId에 `encodeURIComponent`를
**먼저** 적용한다. 그 결과 한글이 `%EA%B3%A0…`로 인코딩되어, `getSafePath`의
한글→영문 매핑(`고차방정식`→`higher_order_eq`)이 **무력화**된다. 반면 업로드
스크립트는 한글 원본을 `getSafePath`로 영문 변환해 저장한다.

실측(Supabase 공개 엔드포인트):

| 경로 | HTTP | 의미 |
|---|---|---|
| `premium_lectures/higher_order_eq.json` | 200 | JSON은 영문 경로로 정상 (fetch는 encode 안 함) |
| `audio/premium_lectures/higher_order_eq/step_1.mp3` (업로드 경로) | 200 | 오디오 **실재** |
| `audio/premium_lectures/%EA%B3%A0…/step_1.mp3` (플레이어 요청 경로) | 400 | ❌ 404 → 로봇 폴백 |

즉 **이미 생성된 음성조차 재생되지 못하고** Web Speech(시스템 로봇 음성)로
떨어진다. "음색이 강의마다/스텝마다 다르다"는 체감의 상당 부분이 이 상시 폴백 때문.

### 1.2 커버리지 희소 + 네이밍 불일치 (실측 확인)

service_role로 `audio/premium_lectures/` 나열 결과 생성된 폴더는 ~12개뿐:
`higher_order_eq, prob_cases, geom_transform, recursive_def, independent_trials,
derivative_01, derivative_app_1, derivative_app_2, derivative_app_3, 1, 2, 3`.

- `LECTURE_INDEX`의 41개 강의 대비 **대부분 미생성**.
- `derivative_01`, `1`, `2`, `3` 등 **baseId 매핑과 불일치**한 폴더명 존재.
- `audio/premium_lectures/step_1.mp3 … step_15.mp3`가 폴더 없이 prefix 루트에
  직접 존재 → 과거 경로 버그의 **고아 파일**.

### 1.3 부차 원인 — 호출 간 음색 드리프트

스텝마다 독립적인 stateless API 호출이라 프리뷰 TTS 모델이 호출 간 톤/속도/음높이를
미세하게 흔든다. 1.1·1.2 해결 후 남는 잔여 일관성 문제이며, **강의당 단일 호출
합성**으로 강의 내 일관성을 확보한다.

### 1.4 코드 중복

- `PremiumLecturePlayer.jsx`에 baseId 매핑 if/else 체인이 **2번 중복**되고, 두 번째
  (오디오용, L162–177)는 첫 번째(JSON용, L63–136)보다 **불완전**하다.
- 생성 스크립트가 3종(`generate_premium_gemini_tts`, `generate_gemini_math_sang_tts`,
  `generate_gemini_math_su1_tts`) + gocha(구형 2.5 모델) → 모델·버킷·프롬프트 분기.
  (이번 작업 범위는 **프리미엄 강의** 경로이며, hint/gocha 스크립트는 설정 통합 모듈을
  공유하도록만 정리하고 재생성은 범위 밖.)

---

## 2. 목표 / 비목표

### 목표
1. 경로 불일치 버그 수정 → 이미 생성된 음성 즉시 복구 (API 비용 0).
2. baseId 매핑·경로 해석·생성 설정을 **단일 SSOT 모듈**로 통합 (런타임/스크립트 공유).
3. Supabase 버킷을 실제 나열하는 **감사 도구**로 정확한 갭·고아·이름불일치 산출.
4. **강의당 단일 호출 합성**으로 음색 일관성 확보, 빠진 강의/스텝 생성·업로드.
5. 로봇 Web Speech 폴백 제거 → "음성 준비 중" 우아한 상태.

### 비목표
- 실시간 교실(classroom) 튜터 TTS, 힌트 TTS, 숙제 TTS의 적용 확대 (표면 확대 제외).
- 새 보이스/다국어, 음성 캐싱 인프라 재설계.
- gocha/hint 음성의 전량 재생성.

---

## 3. 아키텍처

```
런타임(브라우저)
  PremiumLecturePlayer.jsx
    ├─ src/lib/premiumLectureMap.js   (신규) 강의명→정규 baseId  ← 중복 매핑 1곳 통합
    ├─ src/lib/premiumAudioPath.js    (신규) baseId+step→URL (resolveAsset, encode 미사용)
    ├─ JSON  : resolveAsset(`/premium_lectures/{baseId}.json`)
    ├─ AUDIO : premiumAudioPath(baseId, step)          ← 버그 수정 핵심
    └─ 폴백  : "음성 준비 중" 상태 (로봇 Web Speech 제거)

오프라인(Node)
  scripts/lib/ttsConfig.cjs   (신규) MODEL·VOICE·buildPrompt·speechConfig·cleanNarration  SSOT
  scripts/lib/geminiTts.cjs   (신규) Gemini 호출 + 키 로테이션 + 재시도 공통화
  scripts/audit_premium_tts.cjs (신규) 버킷 나열 × JSON steps × LECTURE_INDEX → 갭 리포트
  scripts/generate_premium_gemini_tts.cjs (재작성) 강의당 단일 호출 합성 → 무음 분할 → 업로드
```

**불변 원칙:** baseId→경로 해석을 런타임과 생성 스크립트가 **동일 모듈**(`getSafePath`
기반)로 공유 → 업로드 경로와 요청 경로가 구조적으로 어긋날 수 없다.

---

## 4. 컴포넌트 책임

| 파일 | 상태 | 책임 |
|---|---|---|
| `src/lib/premiumLectureMap.js` | 신규 | 강의명 변형 → 정규 baseId. Player의 중복 if/else 추출. 테스트 대상. |
| `src/lib/premiumAudioPath.js` | 신규 | `(baseId, step)` → 최종 오디오 URL. `resolveAsset` 사용, **encodeURIComponent 미사용**. |
| `src/components/lectures/PremiumLecturePlayer.jsx` | 수정 | 위 2모듈 사용, 매핑·경로 인라인 제거, 폴백 로직 교체. 파일 축소. |
| `scripts/lib/ttsConfig.cjs` | 신규 | `MODEL`, `VOICE`, `buildPrompt()`, `speechConfig`, `cleanNarration()` SSOT. |
| `scripts/lib/geminiTts.cjs` | 신규 | Gemini fetch + 키풀 로테이션 + 429/quota 재시도. |
| `scripts/audit_premium_tts.cjs` | 신규 | 버킷 list API로 실재 확인, 강의별 누락 스텝/고아/이름불일치 표 출력. JSON 리포트 저장. |
| `scripts/generate_premium_gemini_tts.cjs` | 재작성 | 강의당 단일 호출 합성 → 무음 분할 → 검증 게이트 → 업로드. 멱등 skip/`--force`. |

파일 크기 가이드: 각 신규 모듈 200~400줄 이내, 함수 50줄 이내, 불변 패턴 유지.

---

## 5. 데이터 흐름 — 강의당 단일 호출 합성

1. 강의 JSON 로드 → `steps[]`의 narration 추출, 각 `cleanNarration()`.
2. 모든 narration을 **하나의 프롬프트**로 결합. 스텝 사이에 명확한 낭독 멈춤을
   유도(문단 분리 + 충분한 무음을 만들도록 지시).
3. Gemini 3.1 단일 호출 → 원시 PCM 1개.
4. `ffmpeg silencedetect`로 무음 경계 검출 → N 스텝 ↔ N 조각 매칭.
5. **검증 게이트:** 조각 수 ≠ 스텝 수, 또는 강의 narration 총 길이가 임계 초과 →
   해당 강의는 **스텝별 개별 호출로 자동 폴백**. (정확도 보장 우선)
6. 각 조각 → libmp3lame MP3 → 로컬 캐시(`public/audio/premium_lectures/{baseId}/step_N.mp3`)
   → Supabase 업로드(`getSafePath` 경로, `x-upsert`).
7. **멱등성:** 원격에 유효 파일(>10KB) 존재 시 skip. `--force`로 재생성. `--lecture`,
   `--limit` 인자 지원.
8. **레이트리밋:** 단일 호출 방식이라 호출 수가 스텝 합산 대비 급감(강의당 1콜).
   기존 8.5s 지연을 강의 단위로 적용.

### 음색 일관성 설정 (ttsConfig.cjs SSOT)
- 모델: `gemini-3.1-flash-tts-preview` (고정)
- 보이스: `Aoede` (고정)
- 프롬프트: 동일 톤 지시 1종으로 고정(친절·활기찬 여대생 선생님, 잡담 금지, 대본만 낭독).
- `speechConfig`: 모델이 지원하는 범위에서 temperature 등 고정값 적용(드리프트 최소화).

---

## 6. 런타임 폴백 정책

- **로봇 Web Speech 폴백 제거.** 오디오 404/에러 시:
  - 해당 스텝을 "🔊 음성 준비 중입니다" 상태로 표시, **자동 진행 멈춤**.
  - 자막(narration 텍스트)은 정상 노출, 수동 다음/이전 가능.
  - 콘솔에 누락 `{baseId, step}` 기록(감사용).
- 근거: 음색 일관성이 목표인데 시스템 로봇 음성 전환이 최대 불일치원. "없으면 안 튼다."
- 경로 버그 수정 후 기존 음성이 대부분 복구되므로 폴백 노출 자체가 급감.

---

## 7. 실행 전제조건 / 운영

- `.env` (워크트리, gitignore됨)에 `VITE_SUPABASE_URL`, `VITE_GEMINI_API_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` 설정 완료. ffmpeg 설치 확인됨.
- 강의 JSON 원본은 로컬에 없음 → 감사/생성 스크립트가 Supabase 공개 경로
  (`premium_lectures/{getSafePath(baseId)}.json`)에서 **자동 다운로드**해
  `public/premium_lectures/`로 복원.
- 실행 순서: (a) 코드 수정+도구 → (b) 감사 리포트로 갭 확정 → (c) 생성·업로드 →
  (d) 감사 재실행으로 0 갭 확인.
- **보안:** service_role 키는 채팅에 노출됨 → 작업 종료 후 Supabase에서 **로테이트 권장**.

---

## 8. 에러 처리

- Gemini: 429/quota → 키풀 로테이션 후 재시도(최대 N회), 실패 시 해당 강의 스킵 + 로그.
- ffmpeg 분할 실패/조각 수 불일치 → 스텝별 폴백(5번 게이트).
- Supabase 업로드 실패 → 재시도(backoff), 실패 시 로컬 캐시 보존 + 리포트.
- JSON 다운로드 404 → 해당 baseId를 "원본 누락"으로 리포트(생성 불가 분리 표기).
- 런타임 오디오 로드 실패 → 폴백 상태(6번), 크래시 금지.

---

## 9. 테스트 / 검증 (Evidence-Based)

- `premiumLectureMap` / `premiumAudioPath` 단위 테스트: 대표 baseId(고차방정식,
  미적분_정적분, 확통_순열 등)가 올바른 영문 경로로 해석되는지. 특히
  `audioPath('고차방정식',1)` === `…/audio/premium_lectures/higher_order_eq/step_1.mp3`.
- **경로 버그 회귀(Red-Green):** 수정 전 경로가 400, 수정 후 200을 실측으로 확인.
- 감사 스크립트: 생성 전 갭 목록 출력 → 생성 후 재실행 시 대상 강의 갭 0 확인.
- 생성 검증: 무작위 스텝 MP3의 크기>10KB + 재생 가능(ffprobe duration>0).
- 일관성 스폿체크: 한 강의의 여러 스텝을 이어 들어 톤 단절 없는지 수동 확인(소규모).
- 빌드: `vite build` 0 에러.

---

## 10. 단계별 산출물 (구현 계획 입력)

1. SSOT 모듈: `premiumLectureMap.js`, `premiumAudioPath.js` (+테스트).
2. `PremiumLecturePlayer.jsx` 리팩터: 모듈 사용 + 폴백 교체.
3. 스크립트 공통 모듈: `ttsConfig.cjs`, `geminiTts.cjs`.
4. `audit_premium_tts.cjs` + 1차 감사 리포트.
5. `generate_premium_gemini_tts.cjs` 재작성(단일 호출 합성 + 분할 게이트).
6. JSON 원본 복원 → 갭 강의 생성·업로드 실행.
7. 감사 재실행 0 갭 + 빌드 확인 → 커밋/PR.
