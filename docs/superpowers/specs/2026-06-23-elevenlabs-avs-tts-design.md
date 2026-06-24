# ElevenLabs 신규 AVS TTS 파이프라인 설계 (미적분/확통/수2)

- **Date:** 2026-06-23
- **Status:** Approved design — ready for implementation planning
- **Repo:** `/Users/mac/mathmentos` (`mentos-os`)
- **선행 작업:** Gemini 3.1+Aoede 음색 통일(별도 트랙, PR #33). 본 작업은 그와 **독립**.

## 1. 목표

아직 TTS 음성이 없는 단원의 AVS 단계별 해설을 **ElevenLabs로 음성화**한다. 첫 서브프로젝트는 **이미 AVS 텍스트가 존재하는 미적분/확통/수2**(Supabase에 텍스트 JSON ~1,806개, TTS 0개)의 음성 생성이다.

> 비유: 대본(텍스트)은 이미 쓰여 있는데 성우 녹음만 안 된 상태. 이번엔 그 대본을 ElevenLabs 성우가 낭독해 녹음한다. 대본이 없는 단원(수학 하)은 별도 2차 작업에서 대본부터 쓴다.

## 2. 범위

**In scope (1차):**
- 텍스트 보유 + TTS 미보유 단원의 ElevenLabs 음성 생성. 실측 대상 34개 폴더(`calculus_*`, `math2_*`, 미분/적분/확률/통계/극한 계열), 텍스트 JSON ~1,806개.
- 수식 낭독 전처리 강화(미적분 기호: `\int`, `dx`, `\ln`, `\displaystyle` 등).
- 기존 경로/매니페스트로 저장 → 앱은 추가 연동 거의 불필요.

**Out of scope (2차 이후):**
- **AVS 텍스트 신규 생성**(수학 하 등 텍스트 부재 단원). 문제 소스·정답키 확보가 선행돼야 하는 별도 서브프로젝트. 본 스펙은 다루지 않음.
- 기존 Gemini Aoede 클립을 ElevenLabs로 교체(음색 전체 통일). 하지 않음.

## 3. 음색 정책 (확정)

**과목별 다른 음색 허용.** 신규 단원(미적분/확통/수2)은 ElevenLabs voice(`.env`의 `ELEVENLABS_VOICE_ID`), 기존 수학상/수1은 Gemini Aoede 유지. manifest에 `engine`으로 구분 기록. 앱 내 과목 간 음색 혼재는 수용한다(과목 내 일관성만 보장).

## 4. 핵심 제약

- **용량 = 글자 수 기반.** 현재 ElevenLabs **Creator 플랜 = 131,000자/월**. 전체 ~1,806개 × 평균 300자 ≈ **약 54만 자** → 월 한도로 **약 4~5개월** 분량. → **월 할당량만큼 나눠 배치·재개**(Gemini cron과 동일 철학, 단 카운터는 글자 수).
- **수식 낭독 품질이 성패.** 텍스트가 LaTeX(`\displaystyle\int_{1}^{2}\dfrac{3x+2}{x^{2}}\,dx` 등) → 한국어 구어로 정확히 풀어야 함. 기존 `latexToSpeech`(su1, 53규칙)는 수1 위주라 미적분 기호 누락 → 전용 강화 필요.
- API 키는 `.env`에서만 로드(하드코딩 금지). 키는 민감정보.

## 5. 아키텍처 (작은 단위 3 + 데이터 1)

### 신규 파일
- **`scripts/lib/ttsElevenLabs.cjs`** — ElevenLabs 합성 SSOT.
  - `.env`에서 `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL`(기본 `eleven_multilingual_v2`) 로드(미설정 시 fail-fast).
  - `synthesize(text) → { buffer, chars }` (POST `text-to-speech/{voiceId}`, mp3 반환). 재시도(429/5xx).
  - `getUsage() → { used, limit }` (구독 API).
- **`scripts/lib/latexToSpeechCalc.cjs`** — 수식→한국어 낭독 전처리(순수 함수).
  - 기존 su1 규칙 베이스 + **미적분 전용**: `\int`→"적분", `\int_{a}^{b}`→"a부터 b까지 적분", `\,dx`/`dx`→"디엑스에 대하여", `\ln`→"자연로그", `\displaystyle` 제거, `\dfrac/\frac`→"~분의~", `\lim_{x\to a}`→"x가 a로 갈 때 극한", `\sum`, `\prod`, `'`(프라임)→"프라임/도함수" 등.
  - 입력=힌트 JSON의 낭독 대상 필드(P/C/B/S 또는 steps), 출력=순수 한국어 문장.
- **`scripts/lib/elevenlabsQuota.cjs`** — 글자수 한도/재개 순수 로직.
  - `remaining(progress)`, `wouldExceed(usedChars, nextChars, limit)`, `isQuotaError(err)`. 단위테스트.
- **`scripts/generate_elevenlabs_avs.cjs`** — 오케스트레이터.
  - 대상 폴더 목록(텍스트 보유 ∧ TTS 미보유) enumerate → 각 JSON 전처리 → 글자수 예측 → 한도 내에서 `synthesize` → `math-tts/{ttsDir}/{NNN}.mp3` 업로드 + `recordManifest`(engine:elevenlabs, voiceId) → 진행 저장. 한도 도달 시 중단(exit 0).

### 신규 데이터
- **`scripts/tts_elevenlabs_map.json`** — 텍스트폴더(hintDir) → ttsDir 매핑(숙제 폴더는 기존 STAGES에 없으므로 신규 매핑, pid·내용 검증). `tts_hintdir_map.json`과 동일 검증 절차.
- **`scripts/tts_elevenlabs_progress.json`** — 처리 완료 키 + 누적 글자수(월 리셋 추적).

### 수정 파일 (앱 연동 — 구현 중 발견으로 필수화)
> **⚠️ 2026-06-23 EL-5 검증 발견:** 스펙 초안의 "앱 연동 거의 불필요" 가정은 **틀렸다.** 숙제(homework) AVS는 현재 앱에서 **음성 재생 기능이 연결돼 있지 않다.** 흐름: `HomeworkMathBox`가 `HintPlayerRouter`에 `unit={effectiveHintKey}`(예: `수학2_01함수의극한_통합숙제`) 전달 → `GeometryHintPlayer`가 `cleanUnit → TTS_UNIT_MAP[cleanUnit]`로 ttsDir 조립 → **숙제 hintKey는 `src/data/tts_map.json`에 없어 `engPath` 없음 → `return null`(음성 버튼 미표시)**. 따라서 음성을 만들어 올려도 앱이 재생하지 못한다.
- **`src/data/tts_map.json`** — 숙제 `effectiveHintKey`(통합숙제 키) → ttsDir 매핑 항목 추가(앱이 음성 경로를 조립하도록). ttsDir 이름은 우리가 정함(권장: hintKey와 1:1 대응되는 안정적 영문 slug, 또는 hintKey 그대로).
- **저장 ttsDir 규칙 변경:** 음성은 위 tts_map에 등록한 ttsDir 이름으로 `math-tts/{ttsDir}/{NNN}.mp3` 업로드(텍스트 폴더명 ≠ ttsDir이므로 **EL-5 매핑 테이블이 hintDir→ttsDir 의미 매핑을 담아야 함**, "동일명" 가정 폐기).
- (`GeometryHintPlayer`의 cleanUnit 정규화가 숙제 hintKey를 그대로 통과시키는지 확인 — 공백/괄호 제거만 하므로 hintKey가 tts_map 키와 일치하면 OK.)

## 6. 데이터 흐름

```
math_hints/{hintDir}/{NNN}.json (텍스트, Supabase)
  → extractNarration + latexToSpeechCalc   # 낭독필드 → 한국어 구어
  → 글자수 예측 → 월 한도 체크
  → ttsElevenLabs.synthesize(text)         # mp3 buffer
  → 업로드 math-tts/{ttsDir}/{NNN}.mp3      # ttsDir = EL-5 매핑(hintDir→앱 ttsDir)
  → recordManifest(engine:elevenlabs, voiceId, chars)
  → 앱: tts_map[숙제hintKey]=ttsDir 등록돼 있어야 음성버튼 표시·재생
  → tts_elevenlabs_progress.json 갱신
한도 도달 → 진행 저장 후 exit 0 → 다음 배치/월에 재개
앱: 기존대로 math-tts 경로 재생(코드 변경 없음)
```

## 7. 에러 처리

- 키 미설정 → fail-fast(명확한 메시지). 하드코딩 금지.
- HTTP 401/402/429(한도·결제) → 진행 저장 후 exit 0(다음 창 재개). 일시 5xx/네트워크 → 재시도(backoff) 후 실패 시 해당 클립 skip+로그.
- 매핑 불명(ttsDir 미정) 폴더 → 처리 보류 + 로그(절대 임의 추정 금지 — 잘못된 단원 음성 방지).
- 빈/placeholder 텍스트 → skip + 로그.

## 8. 테스트

- **단위:** `latexToSpeechCalc`(미적분 케이스: 적분·극한·분수·프라임), `elevenlabsQuota`(remaining/wouldExceed/isQuotaError), `ttsElevenLabs`(요청 바디·키 로드, fetch 모킹).
- **검증(실합성):** 대표 1~2개 폴더로 실제 생성→업로드→manifest 기록→앱 재생 확인. 음색·수식 낭독 청취 확인.
- **회귀:** 기존 Gemini 트랙(`ttsService.js`·su1/sang 생성기) 불변 확인(grep: 신규 코드가 기존 manifest/생성기 미오염).

## 9. 단계(월 할당량 분할)

| 단계 | 내용 | 글자 |
|---|---|---|
| 0 | 모듈 3 + 매핑/검증 + 단위테스트 (코드) | 0 |
| 1 | 대표 폴더 실합성 검증(소량) | 소량 |
| 2~N | 월 13.1만 자 한도 내 배치, 진행 저장·재개. ~1,806개 소진까지 반복 | 월 한도 |

## 10. 미해결/실데이터 의존(구현 중 확정)

- 34개 텍스트 폴더 각각의 정확한 `ttsDir` 매핑(내용+pid 검증). 일부(`prob_casesstep*`)는 기존 확통 클립과 중복일 수 있어 "텍스트 보유 ∧ TTS 미보유" 교집합으로 최종 대상 확정.
- 신규 ttsDir이 앱 단원 라우팅에 연결돼 있는지(미연결 시 매핑 보강 필요).
- 평균 글자수 실측(스펙은 300자 가정) → 월 처리량 정밀화.
