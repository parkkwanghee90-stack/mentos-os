# 전국 고1 1학기 기말 예상문제 자동화 파이프라인

기출 PDF(마운트된 사무폴더)를 **분석**해서, 학교별 **오리지널 예상문제 20문항**(정답·해설 포함)과
**출제경향 분석 데이터**를 자동 생성한다. 앱의 "전국 고1 1학기 기말 예상문제" 코스 카드와
학교별 분석 포스터가 이 산출물을 렌더한다.

## ⚖️ 저작권 원칙 (중요)
- `extracted/*` = 실제 기출의 디지털 사본 → **내부 분석 전용**. 앱/포스터에 그대로 내보내지 않는다.
- 앱·포스터에 나가는 것은 `predicted/*`(생성된 **오리지널** 문제)와 `analysis/*`(통계)뿐.
- 04단계는 기출을 복제하지 않고 새 수치·새 상황으로 창작하도록 강제한다.

## 파이프라인 단계
| 단계 | 스크립트 | 입력 → 출력 | LLM |
|---|---|---|---|
| (01) | `01_pdf_to_png.cjs` | PDF → 페이지 PNG (poppler) | — *(선택. 02가 PDF 직접입력이라 보통 불필요)* |
| 02 | `02_extract.cjs` | 기출 PDF → `extracted/<학교>.json` (문항 디지털화) | Gemini (PDF 직접) |
| 03 | `03_analyze.cjs` | extracted → `analysis/<학교>.json` (출제비중·난이도·TOP) | 순수 JS |
| 04 | `04_generate.cjs` | analysis → `predicted/<학교>.json` (예상문제 20 + 정답·해설) | Gemini |
| 05 | `05_assemble.cjs` | analysis+predicted → `cards/<학교>.json` (+`cards/_index.json`) | 순수 JS |

산출물 루트: `src/data/exam_predict/`. 실패는 `failed.json` 에 누적.

## 사용법
```bash
set -a; source .env; set +a          # VITE_GEMINI_API_KEY 로드 필수

# 전체(소스 폴더의 모든 학교) — 멱등: 이미 된 학교는 skip
node scripts/exam_predict/run_all.cjs

# 한 학교만 (파일명 부분일치)
node scripts/exam_predict/run_all.cjs 풍산

# 단계 일부만
STAGES=02,03 node scripts/exam_predict/run_all.cjs 풍산

# 강제 재생성
REGEN=1 node scripts/exam_predict/04_generate.cjs 풍산
```

### 운영 (하루 20개씩 추가 업로드 대응)
새 PDF 를 소스 폴더에 넣고 `node scripts/exam_predict/run_all.cjs` 만 다시 실행하면,
멱등성 덕분에 **새로 추가된 학교만** 처리된다.

## 환경변수
| 변수 | 기본 | 설명 |
|---|---|---|
| `VITE_GEMINI_API_KEY` | (필수) | Gemini 키. 콤마로 여러 개 두면 라운드로빈 |
| `EXAM_SRC_DIR` | `/Volumes/수학의 빛 사무폴더/멘토스기출/2025/1학년1학기말` | 기출 PDF 폴더 |
| `EXAM_GEMINI_MODEL` | `gemini-2.5-flash` | 사용 모델 |
| `EXAM_COUNT` | `20` | 회당 생성 문항 수 |
| `EXAM_MAX_PDF_BYTES` | `18MB` | 인라인 한도(초과 시 File API 필요 — TODO) |

## 데이터 스키마
- **extracted**: `{school,region,year,grade,term,subject,source,problems[{num,unit,level,type,latex,answer}]}`
  (`src/data/naesin_exams/현암고_2025_고1_1학기_기말.json` 과 동일 구조)
- **analysis**: `{unit_share[], top_units, objective_ratio, subjective_ratio, difficulty_stars, discrimination_stars, summary}`
- **predicted**: `{count, blueprint, problems[{id,num,unit,level,type,latex,choices,answer,solution,wrong_point}]}`
- **cards/<학교>.json**: 위 analysis + predicted 를 합친 앱/포스터 렌더용. `cards/_index.json` 에 학교 목록.

## 알려진 TODO / 다음 단계
- [ ] 정답 자동 검증기(생성 문제를 다시 풀어 answer/solution 교차검산) — 현재는 생성기 자체 검산에 의존
- [ ] 18MB 초과 PDF용 Gemini File API 업로드 경로
- [ ] AVS(사고과정) 생성 연계 — `predicted.avs_pending=true`, 기존 AVS 인프라(`gen_*_avs`)와 연결
- [ ] 앱 코스 카드/포스터 렌더러 (cards/*.json 소비)
- [ ] 단원 라벨 표준화 사전(추출 단원명 ↔ UNITS)
