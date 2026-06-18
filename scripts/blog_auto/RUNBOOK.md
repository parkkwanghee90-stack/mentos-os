# 난이도 상향 대량화 — /loop 런북 (오케스트레이터용)

한 /loop 턴 = 한 배치(5교). 매 턴 아래 절차를 수행한다.

## 0) 직전 한도 여부
- 직전 턴이 한도(deferred 다수)로 끝났고 리셋 전이면: 작업 생략, ScheduleWakeup(1200~3600s) 후 종료.

## 1) 다음 배치 선택
- `node scripts/blog_auto/next_pick.cjs 5` 실행.
- 출력이 `QUEUE_EMPTY` 면: 최종 배포(4단계) 후 ScheduleWakeup 생략(루프 종료).
- `raw_png=X` 인 학교는 즉시 `needs_source`로 트래커 기록(6단계 헬퍼)하고 배치에서 빼고 다음 후보로 채운다.

## 2) 생성 (병렬 5)
- 각 학교에 `prompts/generate.md`의 `{{...}}`를 치환해 Agent(general-purpose) 5개 병렬 dispatch.
  - go1 → GRADE_LABEL=고1, SUBJECT=공통수학1, CARD_DIR=src/data/exam_predict/cards, RAWPNG_DIR=src/data/exam_predict/raw_png/<학교>
  - go2 → GRADE_LABEL=고2, SUBJECT=수학Ⅰ, CARD_DIR=src/data/exam_predict_go2/cards, RAWPNG_DIR=src/data/exam_predict_go2/raw_png/<학교>
  - REGION: 있으면 `, <지역>` 형태, 없으면 빈 문자열.
  - KILLER_HINTS:
    - go1=「행렬 거듭제곱·미정계수, 1의세제곱근 ω 다항합·주기, 경우의수 색칠·포함배제·이웃배치, 판별식 다중계수 케이스, 절댓값·연립부등식 정수해 역추적, 이차함수+도형 결합, 복소수 켤레」
    - go2=「부분합→일반항 역산, 절댓값·분기 점화식 추적, 등차 부호변화 역추적, 도형결합(사인변비→넓이역산→코사인→이등분), (가)(나)(다) 동시조건, 경우분리 3+」
- 에이전트 보고에 한도신호(tracker.isLimitSignal)가 있으면 그 학교는 `deferred`로 기록.

## 3) 검수 (병렬, 생성 성공분만)
- 각 성공 학교에 `prompts/verify.md` 치환해 Agent 병렬 dispatch.
- 마지막 줄 `VERDICT: 적정` → `done`. `VERDICT: 쉬움` → 검수 근거를 generate 프롬프트 끝에 덧붙여 **1회 재생성→재검수**. 2회째도 `쉬움`이면 `needs_review`.

## 4) 트래커·커밋·(주기)배포
- 트래커 갱신은 인라인 node로(예시):
  `node -e "const T=require('./scripts/blog_auto/lib/tracker.cjs');const t=T.load();T.mark(t,'go1','개포고','done');T.save(t)"`
- done된 학교의 cards/predicted/analysis + difficulty_progress.json 커밋·푸시.
- **3배치마다 또는 QUEUE_EMPTY**: `node scripts/blog_auto/deploy_bundles.cjs` → `rm -rf dist && npm run build && npm run deploy` → 라이브 index 청크 일치 검증.

## 5) 다음 깨움
- 작업 진행됨 → ScheduleWakeup(약 270s, 캐시 유지)로 다음 배치.
- 한도로 막힘 → ScheduleWakeup(1200~3600s).
- QUEUE_EMPTY → ScheduleWakeup 생략(종료).

## 6) needs_source 기록 헬퍼
`node -e "const T=require('./scripts/blog_auto/lib/tracker.cjs');const t=T.load();T.mark(t,'<grade>','<slug>','needs_source');T.save(t)"`
