# mentos-os (멘토스 수학앱)

중·고등 수학 학습 앱. AVS(AI Vision Solution) 단계별 해설 + 숙제 채점.

## 기술 스택
- React 19 + Vite 8 — **순수 JS (TypeScript 아님)**
- Capacitor 8 (모바일 래핑), Supabase (DB·스토리지·인증)
- KaTeX (수식 렌더), vitest (테스트)
- 배포: Vercel GitHub 연동 자동배포 (main 푸시 시 / mentos-os·mentos_os_clean 2개 프로젝트)

## 필수 명령어
- `npm run dev` — 개발 서버 (vite)
- `npm run build` — 프로덕션 빌드 (vite build)
- `npm test` — 테스트 (vitest run, 131+)
- `npm run check:homework` — 숙제 데이터 무결성 검증
- `npm run check:math-latex` — 수식 KaTeX 검증·정규화 (⚠️ in-place 수정함)
- ⚠️ `npm run lint` — eslint flat-config 부재로 깨짐 (무시)

## 디렉터리
- `src/pages` 화면 · `src/components` UI · `src/hooks` 로직(채점=`useMathClassroomEngine`)
- `src/services` 데이터로더·`answerResolver` · `src/config` `pathMapping`·`assets`
- `src/data` 정적 데이터 · `src/lib` 유틸 · `scripts/` 일회성 도구 · `public/` 정적 자산

## 데이터 / AVS 규약 (중요)
- **채점 SSOT** = `src/data/avs_answers.json` (키 `과목_NN단원_통합숙제` → {pid: 정답}). 채점기(HomeworkMathBox `normalizeAnswer`)는 공백제거+①→1 후 사실상 exact-match → 정답 포맷 보존 필수.
- 숙제 정의 = `src/data/homeworkSSOT.js` (imagePath·answerKey·problemCount).
- 경로 리라이트 = `src/config/pathMapping.js` (`/math_crops/숙제/{과목}/{단원KR}` → Supabase `math_crops/homework/{eng}`), 베이스 URL = `src/config/assets.js` URL_PREFIX.
- AVS 힌트 = Supabase `mentos-assets/math_hints/{getSafePath(단원)}/{pid}.json` (P/C/B/S/A 스키마). 크롭 = `math_crops/homework/{과목}/{단원}/{pid}.webp`(문제)·`{pid}a.webp`(해설, +1 시프트 주의).
- `public/math_hints`·`dist` = gitignore (프로덕션은 Supabase가 서빙).

## Git 워크플로우
- 기능 브랜치 → PR → 머지(Vercel 자동배포). main 직접 커밋 지양.
- 원격: `parkkwanghee90-stack/mentos-os`.

## 주의 / 보안
- ✅ `scripts/upload_*.cjs`·`check_supa.js`의 service_role 키 하드코딩 제거 완료 → `process.env.SUPABASE_SERVICE_ROLE_KEY`(`.env`)에서만 로드(미설정 시 fail-fast).
- ⚠️ **단 옛 키는 여전히 git 이력에 남아 있음**: ① Supabase 대시보드에서 service_role 키 **재발급 필수**(GMAIL_SMTP·SUPABASE_ACCESS_TOKEN·Gemini 키도) ② 재발급 후 `git filter-repo`로 이력 스크럽(강제푸시·협업자 조율 필요).
- 신규 스크립트는 키를 `.env`(`SUPABASE_SERVICE_ROLE_KEY` 등)에서만 로드(하드코딩 금지).
