# 🔒 배포 SSOT (Single Source of Truth) — 절대 변경 금지

> **최종 확정일**: 2026-05-28
> **도메인**: mathmentos.com / nuricampus.com
> **이 문서는 프로덕션 배포의 유일한 진실입니다. AI 에이전트 포함 그 누구도 이 방식을 변경해서는 안 됩니다.**

---

## ⛔ 절대 금지 사항

1. **HintPlayerRouter.jsx의 `formula_raw` 폴백 체인에 `st.latex`를 절대 추가하지 마라**
   ```javascript
   // ✅ 올바른 코드 (절대 변경 금지)
   formula_raw: st.formula_raw || st.content || '',
   
   // ❌ 절대 금지 — 이렇게 바꾸면 전체 AVS 수식이 깨짐
   formula_raw: st.formula_raw || st.content || st.latex || '',
   ```

2. **GeometryHintPlayer.jsx의 `preprocessLatexString()` 함수를 절대 수정하지 마라**
   - 이 함수가 `$` 구분자 없는 한글+수식 혼합 텍스트를 자동 보정함
   - 건드리면 고차방정식 이후 전 단원 AVS가 깨짐

3. **AlgebraHintPlayer.jsx, GeometryHintPlayer.jsx, HintPlayerRouter.jsx 3개 파일을 동시에 수정하지 마라**
   - 한 번에 하나씩만, 반드시 테스트 후 배포

4. **`src/config/assets.js`의 `URL_PREFIX`를 빈 문자열(`''`)로 절대 바꾸지 마라**
   ```javascript
   // ✅ 올바른 코드 (절대 변경 금지)
   export const URL_PREFIX = 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/storage/v1/object/public/mentos-assets';
   
   // ❌ 절대 금지 — 이렇게 바꾸면 모든 힌트/이미지 로딩 실패
   export const URL_PREFIX = '';
   ```

5. **`resolveAsset()` 또는 `URL_PREFIX`를 MathClassroom.jsx의 힌트 로딩 경로에 적용하지 마라**
   - 힌트 JSON은 로컬 `/math_hints/` 경로로 직접 fetch

5. **`.vercelignore`의 `public/math_crops/`, `public/math_hints/` 제외 규칙을 삭제하지 마라**

---

## ✅ 정확한 배포 절차 (이것만 따라하라)

### Step 1: 빌드
```bash
cd c:\mentos_os_clean
npx vite build
```
- 결과: `dist/` 폴더에 정적 파일 생성
- 빌드 시간: 약 3~4분

### Step 2: Vercel 프리빌트 구조 생성
```bash
# .vercel/output/ 디렉토리 구조 생성
# config.json + static/ (dist 내용 복사)
```

#### config.json 내용 (`.vercel/output/config.json`):
```json
{
  "version": 3,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/" }
  ]
}
```

#### static 폴더:
```bash
# dist/ 내용을 .vercel/output/static/ 에 복사
Copy-Item -Path "dist\*" -Destination ".vercel/output/static" -Recurse -Force
```

### Step 3: 배포
```bash
npx vercel --prebuilt --prod
```
- `--prebuilt`: 이미 빌드된 결과물을 직접 업로드 (Vercel 서버에서 재빌드 안 함)
- `--prod`: 프로덕션 환경에 배포
- 이 방식은 56,000개 파일 스캔 문제를 완전히 우회

### Step 4: 캐시 클리어 후 확인
- 모바일: 브라우저 → 웹사이트 데이터/캐시 삭제 → mathmentos.com 재접속
- PC: Ctrl+Shift+R (강력 새로고침)

---

## 🔐 변경 불가 파일 목록

| 파일 | 역할 | 변경 금지 이유 |
|---|---|---|
| `src/components/hints/HintPlayerRouter.jsx` | AVS 라우터 | formula_raw 체인, Player 선택 로직 |
| `src/components/hints/GeometryHintPlayer.jsx` | 텍스트 기반 수식 렌더러 | preprocessLatexString 자동 보정 |
| `src/components/hints/AlgebraHintPlayer.jsx` | 이미지 기반 해설 뷰어 | 안정적 작동 중 |
| `.vercelignore` | 배포 제외 규칙 | math_crops/hints 제외 필수 |
| `vercel.json` | SPA 라우팅 | rewrites 규칙 |

---

## 📋 골든 커밋 기준점

| 커밋 | 날짜 | 상태 |
|---|---|---|
| `f155024` | 2026-05-24 | ✅ 힌트 컴포넌트 3개 완벽 작동 기준점 |
| 현재 작업트리 | 2026-05-28 | ✅ f155024 기반 복원 + 단원 매핑 추가 |

**힌트 컴포넌트 복원 명령 (비상시)**:
```bash
git checkout f155024 -- src/components/hints/HintPlayerRouter.jsx
git checkout f155024 -- src/components/hints/GeometryHintPlayer.jsx
git checkout f155024 -- src/components/hints/AlgebraHintPlayer.jsx
```
복원 후 `항등식과나머지정리`, `인수분해`, `복소수`, `이차방정식과이차함수`, `이차방정식` 라우팅 매핑만 HintPlayerRouter.jsx에 재추가.

---

## ⚠️ AI 에이전트에 대한 경고

> **이 프로젝트에서 작업하는 모든 AI 에이전트는 이 SSOT 문서를 반드시 먼저 읽어야 합니다.**
> 
> 위 금지 사항을 위반하는 코드 변경을 제안하거나 실행하는 것은 프로덕션 장애를 유발합니다.
> 
> 배포 방식을 "개선"하거나 "최적화"하려는 시도를 하지 마십시오.
> 이 방식은 실전 검증 완료된 유일한 정답입니다.
