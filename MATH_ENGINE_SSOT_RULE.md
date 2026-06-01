# 📐 Mentos OS Math Engine SSOT Absolute Rules (수학 엔진 절대 원칙)

> **WARNING: CRITICAL ARCHITECTURAL CONSTRAINTS**
> 본 문서는 수학 AVS, 채점 시스템, 수식 렌더링, 학년 코스 매핑의 무결성을 수호하기 위한 최상위 SSOT 규정집입니다. 
> 향후 어떠한 AI 모델이나 개발자도 본 문서의 원칙에 반하는 리팩토링이나 코드 수정을 진행할 수 없으며, 이를 어길 시 출시 장애를 초래하므로 절대 엄금합니다.

---

## 🚨 1. AVS 칠판 힌트 로드 절대 원칙 (ResolveAsset 사용 금지)
* **현상:** `resolveAsset`은 한글 폴더명을 영어 매핑 경로로 치환하거나 Supabase CDN Storage 경로로 자동 맵핑(Eng 변환)하려 합니다. 이로 인해 로컬 디스크에 물리적으로 존재하는 한글 폴더명을 찾지 못하고 `404 Not Found` 에러를 일으켜 칠판(AVS)이 작동을 멈추게 됩니다.
* **원칙:** `/math_hints/` 하위에 위치하는 AVS 칠판형 데이터(.json)는 **100% 로컬 Static 리소스**입니다.
* **규정 코드:** 반드시 `resolveAsset`을 타지 않고 한글 공백과 특수문자를 인코딩하여 로컬 Static URL로 우회 fetch해야 합니다.
  ```javascript
  const encodedFolder = folder.split('/').map(part => encodeURIComponent(part)).join('/');
  const directUrl = `/math_hints/${encodedFolder}/${pid}.json?v=cb_${Date.now()}`;
  ```

---

## 🚨 2. getHintFolder() 와 답안 DB(avs_answers / answers_master) 키값 100% 일치 규정
* **현상:** 답안 데이터베이스(`avs_answers.json` 및 `answers_master.json`) 내부의 단원명 키값은 전부 **한글**(`고차방정식2단계`, `직선의방정식2단계` 등)로 저장되어 있습니다.
* **원칙:** `getHintFolder()` 함수가 `higher_order_eqstep2` 같은 영어 경로명을 반환하면 채점 시 단원명이 달라 정답 매치에 대실패하고 채점 기능이 완전 정지됩니다.
* **규정 코드:** `getHintFolder()`는 반드시 실제 디스크에 존재하는 **한글 폴더명**을 그대로 반환하도록 매핑 규정을 유지해야 합니다.
  ```javascript
  // ── 수학(상) 한글 폴더명 매핑 유지 (영어 매핑 절대 엄금) ──
  if (clean.includes('고차방정식')) return `고차방정식${stepStr}`;
  if (clean.includes('일차부등식')) {
    if (stepStr === '2단계') return '(2)수학(상)기말/(1)일차부등식 개념2단계(26) 1+1(쌍둥이)';
    return `일차부등식${stepStr}`;
  }
  ```

---

## 🚨 3. 수학1 KaTeX 텍스트 문제 렌더링 수호 규정 (koToEng)
* **현상:** `math_problem_texts.json` 데이터베이스 내부에서 수열/귀납 등의 단원은 `seq_misc_step3`, `seq_sum_step4`, `induction_step3` 등 **영어 키**로 보관되어 있습니다.
* **원칙:** `MathClassroom.jsx` 내부의 `koToEng` 맵이 실제 데이터베이스 키와 단 1자라도 다르면(예: `여러가지수열3단계`를 `sigma_step2`로 오매핑 시) 수식 로드에 실패하고 png/webp 이미지 크롭 화면으로 강제 대체되는 오류를 낳습니다.
* **규정 코드:** 매핑 규칙을 실제 DB 키값과 철저히 대조하여 유지하십시오.
  ```javascript
  const koToEng = {
    '등차등비2단계': 'seq_apgp_step2',
    '등차등비3단계': 'seq_misc_step3', // seq_misc_step3로 일치
    '등차등비수열4단계': 'seq_apgp_step4',
    '시그마용법2단계': 'sigma_step2',
    '여러가지수열3단계': 'seq_misc_step3',
    '수열의합4단계': 'seq_sum_step4',
    '귀납적정의2단계': 'induction_def_step2',
    '수학적귀납법3단계': 'induction_step3',
    '수학적귀납법4단계': 'induction_step4',
    '삼각함수활용 4단계(68)': 'trig_util_step4'
  };
  ```

---

## 🚨 4. 학년 코스 선택권 및 강제 락(Lock) 절대 금지
* **현상:** 이전 AI 모델이 고2 전용 드롭다운에서 코스 선택지를 `📐 수학1 (대수) 전용` 하드코딩 텍스트로 박아두고, 고3용 튜터 판정 조건을 꼬아두어 고3에서 `수학2`와 타 코스들이 통째로 실종되는 락아웃 장애를 일으켰습니다.
* **원칙:**
  1. 고1(수학상), 고2(수학1, 수학2, 확통), 고3(수1, 수2, 미적분, 확통, 모의고사) 코스는 각각의 학년 스펙트럼에 맞춰 항상 **자유롭게 드롭다운에서 선택할 수 있도록 개방**되어야 합니다.
  2. 특정 코스로 강제 락(Lock)을 거는 UI나 예외 분기는 일체 불허하며, 코스 변경 시 해당 코스의 첫 번째 단원으로 자동으로 selectedUnit을 변경해주는 반응형 리스너(`useEffect`)를 온전히 수호해야 합니다.
