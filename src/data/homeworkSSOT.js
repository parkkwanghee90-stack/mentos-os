/**
 * homeworkSSOT.js — 통합숙제 SSOT (Single Source of Truth)
 * 
 * 13개 단원(수학 상) 통합숙제 정의
 * - 문제 이미지: /math_crops/숙제/수학상/{folderName}/
 * - 해설 이미지: 같은 폴더 {번호}a.webp
 * - 정답: avs_answers.json의 answerKey
 * - AVS 힌트: /math_hints/{hintKey}/
 */

export const HOMEWORK_UNITS = [
  {
    id: 'hw_01',
    title: '다항식의 연산',
    folderName: '01다항식',
    hintKey: '수학상_01다항식_통합숙제',
    answerKey: '수학상_01다항식_통합숙제',
    problemCount: 21,
    imagePath: '/math_crops/숙제/수학상/01다항식/',
    hintPath: '/math_hints/수학상_01다항식_통합숙제/',
    relatedUnit: '다항식의 연산',
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 1, end: 21 } },
  },
  {
    id: 'hw_02',
    title: '항등식과 나머지정리',
    folderName: '02나머지정리',
    hintKey: '수학상_02나머지정리_통합숙제',
    answerKey: '수학상_02나머지정리_통합숙제',
    problemCount: 33,
    imagePath: '/math_crops/숙제/수학상/02나머지정리/',
    hintPath: '/math_hints/수학상_02나머지정리_통합숙제/',
    relatedUnit: '항등식과 나머지정리',
    stages: { '2단계': { start: 1, end: 15 }, '3·4단계': { start: 1, end: 33 } },
  },
  {
    id: 'hw_03',
    title: '인수분해',
    folderName: '03인수분해',
    hintKey: '수학상_03인수분해_통합숙제',
    answerKey: '수학상_03인수분해_통합숙제',
    problemCount: 14,
    imagePath: '/math_crops/숙제/수학상/03인수분해/',
    hintPath: '/math_hints/수학상_03인수분해_통합숙제/',
    relatedUnit: '인수분해',
    stages: { '2단계': { start: 1, end: 7 }, '3·4단계': { start: 1, end: 14 } },
  },
  {
    id: 'hw_04',
    title: '복소수',
    folderName: '04복소수',
    hintKey: '수학상_04복소수_통합숙제',
    answerKey: '수학상_04복소수_통합숙제',
    problemCount: 20,
    imagePath: '/math_crops/숙제/수학상/04복소수/',
    hintPath: '/math_hints/수학상_04복소수_통합숙제/',
    relatedUnit: '복소수',
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_05',
    title: '이차방정식',
    folderName: '05이차방정식',
    hintKey: '수학상_05이차방정식_통합숙제',
    answerKey: '수학상_05이차방정식_통합숙제',
    problemCount: 22,
    imagePath: '/math_crops/숙제/수학상/05이차방정식/',
    hintPath: '/math_hints/수학상_05이차방정식_통합숙제/',
    relatedUnit: '이차방정식',
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 1, end: 22 } },
  },
  // ── 이차함수: 3회 분리 (순서대로 해금) ──
  {
    id: 'hw_06',
    title: '이차함수 1회차 숙제',
    folderName: '06이차함수1번숙제',
    hintKey: '수학상_06이차함수1번숙제_통합숙제',
    answerKey: '수학상_06이차함수1번숙제_통합숙제',
    problemCount: 21,
    imagePath: '/math_crops/숙제/수학상/06이차함수1번숙제/',
    hintPath: '/math_hints/수학상_06이차함수1번숙제_통합숙제/',
    relatedUnit: '이차방정식과 이차함수',
    parentUnit: '이차방정식과 이차함수',
    sequence: 1,
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 1, end: 21 } },
  },
  {
    id: 'hw_07',
    title: '이차함수 2회차 숙제',
    folderName: '07이차함수2번숙제',
    hintKey: '수학상_07이차함수2번숙제_통합숙제',
    answerKey: '수학상_07이차함수2번숙제_통합숙제',
    problemCount: 27,
    imagePath: '/math_crops/숙제/수학상/07이차함수2번숙제/',
    hintPath: '/math_hints/수학상_07이차함수2번숙제_통합숙제/',
    relatedUnit: '이차방정식과 이차함수',
    parentUnit: '이차방정식과 이차함수',
    sequence: 2,
    stages: { '2단계': { start: 1, end: 13 }, '3·4단계': { start: 1, end: 27 } },
  },
  {
    id: 'hw_08',
    title: '이차함수 3회차 숙제',
    folderName: '08이차함수3번숙제',
    hintKey: '수학상_08이차함수3번숙제_통합숙제',
    answerKey: '수학상_08이차함수3번숙제_통합숙제',
    problemCount: 31,
    imagePath: '/math_crops/숙제/수학상/08이차함수3번숙제/',
    hintPath: '/math_hints/수학상_08이차함수3번숙제_통합숙제/',
    relatedUnit: '이차방정식과 이차함수',
    parentUnit: '이차방정식과 이차함수',
    sequence: 3,
    stages: { '2단계': { start: 1, end: 15 }, '3·4단계': { start: 1, end: 31 } },
  },
  // ── 나머지 단원 ──
  {
    id: 'hw_09',
    title: '고차방정식',
    folderName: '09고차방정식',
    hintKey: '수학상_09고차방정식_통합숙제',
    answerKey: '수학상_09고차방정식_통합숙제',
    problemCount: 22,
    imagePath: '/math_crops/숙제/수학상/09고차방정식/',
    hintPath: '/math_hints/수학상_09고차방정식_통합숙제/',
    relatedUnit: '고차방정식',
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 1, end: 22 } },
  },
  {
    id: 'hw_10',
    title: '일차부등식',
    folderName: '10일차부등식',
    hintKey: '수학상_10일차부등식_통합숙제',
    answerKey: '수학상_10일차부등식_통합숙제',
    problemCount: 15,
    imagePath: '/math_crops/숙제/수학상/10일차부등식/',
    hintPath: '/math_hints/수학상_10일차부등식_통합숙제/',
    relatedUnit: '일차부등식',
    stages: { '2단계': { start: 1, end: 7 }, '3·4단계': { start: 1, end: 15 } },
  },
  {
    id: 'hw_11',
    title: '이차부등식',
    folderName: '11이차부등식',
    hintKey: '수학상_11이차부등식_통합숙제',
    answerKey: '수학상_11이차부등식_통합숙제',
    problemCount: 32,
    imagePath: '/math_crops/숙제/수학상/11이차부등식/',
    hintPath: '/math_hints/수학상_11이차부등식_통합숙제/',
    relatedUnit: '이차부등식',
    stages: { '2단계': { start: 1, end: 15 }, '3·4단계': { start: 1, end: 32 } },
  },
  {
    id: 'hw_12',
    title: '경우의수',
    folderName: '12경우의수',
    hintKey: '수학상_12경우의수_통합숙제',
    answerKey: '수학상_12경우의수_통합숙제',
    problemCount: 38,
    imagePath: '/math_crops/숙제/수학상/12경우의수/',
    hintPath: '/math_hints/수학상_12경우의수_통합숙제/',
    relatedUnit: '경우의수',
    stages: { '2단계': { start: 1, end: 18 }, '3·4단계': { start: 1, end: 38 } },
  },
  {
    id: 'hw_13',
    title: '행렬',
    folderName: '13행렬',
    hintKey: '수학상_13행렬_통합숙제',
    answerKey: '수학상_13행렬_통합숙제',
    problemCount: 42,
    imagePath: '/math_crops/숙제/수학상/13행렬/',
    hintPath: '/math_hints/수학상_13행렬_통합숙제/',
    relatedUnit: '행렬',
    stages: { '2단계': { start: 1, end: 20 }, '3·4단계': { start: 1, end: 42 } },
  },

  // ════════════════════════════════════════
  // 수학1 (대수) — 지수 ~ 수학적 귀납법
  // ════════════════════════════════════════
  {
    id: 'hw_m1_01',
    title: '지수',
    subject: '수학1',
    folderName: '01지수',
    hintKey: '수학1_01지수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/01지수2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/01지수3.4단계/정답및해설.html' },
    answerKey: '수학1_01지수_통합숙제',
    problemCount: 46,
    imagePath: '/math_crops/숙제/수학1/01지수/',
    relatedUnit: '지수',
    stages: { '2단계': { start: 1, end: 36 }, '3·4단계': { start: 1, end: 46 } },
  },
  {
    id: 'hw_m1_02',
    title: '로그',
    subject: '수학1',
    folderName: '02로그',
    hintKey: '수학1_02로그_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/02로그2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/02로그3.4단계/정답및해설.html' },
    answerKey: '수학1_02로그_통합숙제',
    problemCount: 43,
    imagePath: '/math_crops/숙제/수학1/02로그/',
    relatedUnit: '로그',
    stages: { '2단계': { start: 1, end: 24 }, '3·4단계': { start: 1, end: 43 } },
  },
  {
    id: 'hw_m1_03',
    title: '지수·로그함수',
    subject: '수학1',
    folderName: '03지수로그함수',
    hintKey: '수학1_03지수로그함수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/03지수,로그함수2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/03지수,로그함수3.4단계단계/정답및해설.html' },
    answerKey: '수학1_03지수로그함수_통합숙제',
    problemCount: 72,
    imagePath: '/math_crops/숙제/수학1/03지수로그함수/',
    relatedUnit: '지수·로그함수',
    stages: { '2단계': { start: 1, end: 36 }, '3·4단계': { start: 1, end: 72 } },
  },
  {
    id: 'hw_m1_04',
    title: '지수로그함수 활용',
    subject: '수학1',
    folderName: '04지수로그함수활용',
    hintKey: '수학1_04지수로그함수활용_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/04지수로그함수활용2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/04지수로그함수활용3.4단계/정답및해설.html' },
    answerKey: '수학1_04지수로그함수활용_통합숙제',
    problemCount: 32,
    imagePath: '/math_crops/숙제/수학1/04지수로그함수활용/',
    relatedUnit: '지수로그함수 활용',
    stages: { '2단계': { start: 1, end: 17 }, '3·4단계': { start: 1, end: 32 } },
  },
  {
    id: 'hw_m1_05',
    title: '삼각함수 성질·정의',
    subject: '수학1',
    folderName: '05삼각함수정의',
    hintKey: '수학1_05삼각함수정의_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/05삼각함수성질및정의2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/05삼각함수성질및정의3.4단계/정답및해설.html' },
    answerKey: '수학1_05삼각함수정의_통합숙제',
    problemCount: 33,
    imagePath: '/math_crops/숙제/수학1/05삼각함수정의/',
    relatedUnit: '삼각함수 성질·정의',
    stages: { '2단계': { start: 1, end: 19 }, '3·4단계': { start: 1, end: 33 } },
  },
  {
    id: 'hw_m1_06',
    title: '삼각함수 그래프',
    subject: '수학1',
    folderName: '06삼각함수그래프',
    hintKey: '수학1_06삼각함수그래프_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/06삼각함수그래프2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/06삼각함수그래프3.4단계/정답및해설.html' },
    answerKey: '수학1_06삼각함수그래프_통합숙제',
    problemCount: 74,
    imagePath: '/math_crops/숙제/수학1/06삼각함수그래프/',
    relatedUnit: '삼각함수 그래프',
    stages: { '2단계': { start: 1, end: 38 }, '3·4단계': { start: 1, end: 74 } },
  },
  {
    id: 'hw_m1_07',
    title: '삼각함수 활용',
    subject: '수학1',
    folderName: '07삼각함수활용',
    hintKey: '수학1_07삼각함수활용_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/07삼각함수활용2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/07삼각함수활용3.4단계/정답및해설.html' },
    answerKey: '수학1_07삼각함수활용_통합숙제',
    problemCount: 44,
    imagePath: '/math_crops/숙제/수학1/07삼각함수활용/',
    relatedUnit: '삼각함수 활용',
    stages: { '2단계': { start: 1, end: 16 }, '3·4단계': { start: 1, end: 44 } },
  },
  {
    id: 'hw_m1_08',
    title: '등차·등비수열',
    subject: '수학1',
    folderName: '08등차등비수열',
    hintKey: '수학1_08등차등비수열_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/08등차등비수열2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/09등차등비수열3.4단계/정답및해설.html' },
    answerKey: '수학1_08등차등비수열_통합숙제',
    problemCount: 31,
    imagePath: '/math_crops/숙제/수학1/08등차등비수열/',
    relatedUnit: '등차·등비수열',
    stages: { '2단계': { start: 1, end: 18 }, '3·4단계': { start: 1, end: 31 } },
  },
  {
    id: 'hw_m1_09',
    title: '수열의 합',
    subject: '수학1',
    folderName: '09수열의합',
    hintKey: '수학1_09수열의합_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/10수열의합2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/11수열의합3.4단계/정답및해설.html' },
    answerKey: '수학1_09수열의합_통합숙제',
    problemCount: 69,
    imagePath: '/math_crops/숙제/수학1/09수열의합/',
    relatedUnit: '수열의 합',
    stages: { '2단계': { start: 1, end: 42 }, '3·4단계': { start: 1, end: 69 } },
  },
  {
    id: 'hw_m1_10',
    title: '수학적 귀납법',
    subject: '수학1',
    folderName: '10수학적귀납법',
    hintKey: '수학1_10수학적귀납법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/대수 수학1/12수학적귀납법2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/대수 수학1/12수학적귀납법3.4단계/정답및해설.html' },
    answerKey: '수학1_10수학적귀납법_통합숙제',
    problemCount: 45,
    imagePath: '/math_crops/숙제/수학1/10수학적귀납법/',
    relatedUnit: '수학적 귀납법',
    stages: { '2단계': { start: 1, end: 25 }, '3·4단계': { start: 1, end: 45 } },
  },

  // ════════════════════════════════════════
  // 수학2 (미적분 기초) — 함수의 극한 ~ 정적분의 활용
  // ════════════════════════════════════════
  {
    id: 'hw_m2_01',
    title: '함수의 극한',
    subject: '수학2',
    folderName: '01함수의극한',
    hintKey: '수학2_01함수의극한_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/01함수의극한/2단계정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/01함수의극한/3단계정답및해설.html' },
    answerKey: '수학2_01함수의극한_통합숙제',
    problemCount: 46,
    imagePath: '/math_crops/숙제/수학2/01함수의극한/',
    relatedUnit: '함수의 극한',
    stages: { '2단계': { start: 1, end: 20 }, '3·4단계': { start: 1, end: 46 } },
  },
  {
    id: 'hw_m2_02',
    title: '함수의 연속',
    subject: '수학2',
    folderName: '02함수의연속',
    hintKey: '수학2_02함수의연속_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/02함수의연속/2단계정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/02함수의연속/3.4단계정답및해설.html' },
    answerKey: '수학2_02함수의연속_통합숙제',
    problemCount: 34,
    imagePath: '/math_crops/숙제/수학2/02함수의연속/',
    relatedUnit: '함수의 연속',
    stages: { '2단계': { start: 1, end: 16 }, '3·4단계': { start: 1, end: 34 } },
  },
  {
    id: 'hw_m2_03',
    title: '미분계수',
    subject: '수학2',
    folderName: '03미분계수',
    hintKey: '수학2_03미분계수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/03미분계수/2단계정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/03미분계수/3.4단계정답및해설.html' },
    answerKey: '수학2_03미분계수_통합숙제',
    problemCount: 37,
    imagePath: '/math_crops/숙제/수학2/03미분계수/',
    relatedUnit: '미분계수',
    stages: { '2단계': { start: 1, end: 16 }, '3·4단계': { start: 1, end: 37 } },
  },
  {
    id: 'hw_m2_04',
    title: '도함수의 활용 1·2',
    subject: '수학2',
    folderName: '04도함수활용12',
    hintKey: '수학2_04도함수활용12_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/04도함수의활용1.2/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/04도함수의활용1.2/3.4단계/정답및해설.html' },
    answerKey: '수학2_04도함수활용12_통합숙제',
    problemCount: 43,
    imagePath: '/math_crops/숙제/수학2/04도함수활용12/',
    relatedUnit: '도함수의 활용',
    stages: { '2단계': { start: 1, end: 21 }, '3·4단계': { start: 1, end: 43 } },
  },
  {
    id: 'hw_m2_05',
    title: '도함수의 활용 3',
    subject: '수학2',
    folderName: '05도함수활용3',
    hintKey: '수학2_05도함수활용3_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/05도함수의활용3/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/05도함수의활용3/3.4단계/정답과해설.html' },
    answerKey: '수학2_05도함수활용3_통합숙제',
    problemCount: 42,
    imagePath: '/math_crops/숙제/수학2/05도함수활용3/',
    relatedUnit: '도함수의 활용',
    stages: { '2단계': { start: 1, end: 12 }, '3·4단계': { start: 1, end: 42 } },
  },
  {
    id: 'hw_m2_06',
    title: '부정적분과 정적분',
    subject: '수학2',
    folderName: '06부정적분정적분',
    hintKey: '수학2_06부정적분정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/06부정적분과정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/06부정적분과정적분/3.4단계/정답및해설.html' },
    answerKey: '수학2_06부정적분정적분_통합숙제',
    problemCount: 69,
    imagePath: '/math_crops/숙제/수학2/06부정적분정적분/',
    relatedUnit: '부정적분과 정적분',
    stages: { '2단계': { start: 1, end: 24 }, '3·4단계': { start: 1, end: 69 } },
  },
  {
    id: 'hw_m2_07',
    title: '정적분의 활용',
    subject: '수학2',
    folderName: '07정적분활용',
    hintKey: '수학2_07정적분활용_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/수학2/07정적분의활용/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/수학2/07정적분의활용/3.4단계/정답및해설.html' },
    answerKey: '수학2_07정적분활용_통합숙제',
    problemCount: 21,
    imagePath: '/math_crops/숙제/수학2/07정적분활용/',
    relatedUnit: '정적분의 활용',
    stages: { '2단계': { start: 1, end: 13 }, '3·4단계': { start: 1, end: 21 } },
  },

  // ════════════════════════════════════════════════════════
  //  미적분 (9개 단원, 764문제)
  //  이미지: /math_crops/숙제/미적분/{folderName}/
  //  정답: avs_answers.json 내 미적분_XX_통합숙제 키
  // ════════════════════════════════════════════════════════

  // ── 01. 수열의 극한 (98문제) ──
  {
    id: 'hw_cal_01a', title: '수열의 극한 ①', subject: '미적분',
    folderName: '01수열의극한', hintKey: '미적분_01수열의극한_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/01수열의극한2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/01수열의극한3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/01수열의극한4단계/정답및해설.html' },
    answerKey: '미적분_01수열의극한_통합숙제', problemCount: 98,
    imagePath: '/math_crops/숙제/미적분/01수열의극한/',
    relatedUnit: '수열의 극한',
    stages: { '2단계': { start: 1, end: 20 }, '3단계': { start: 21, end: 40 } },
  },
  {
    id: 'hw_cal_01b', title: '수열의 극한 ②', subject: '미적분',
    folderName: '01수열의극한', hintKey: '미적분_01수열의극한_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/01수열의극한2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/01수열의극한3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/01수열의극한4단계/정답및해설.html' },
    answerKey: '미적분_01수열의극한_통합숙제', problemCount: 98,
    imagePath: '/math_crops/숙제/미적분/01수열의극한/',
    relatedUnit: '수열의 극한',
    stages: { '2단계': { start: 1, end: 20 }, '3단계': { start: 41, end: 63 } },
  },
  {
    id: 'hw_cal_01c', title: '수열의 극한 ③ (심화)', subject: '미적분',
    folderName: '01수열의극한', hintKey: '미적분_01수열의극한_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/01수열의극한2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/01수열의극한3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/01수열의극한4단계/정답및해설.html' },
    answerKey: '미적분_01수열의극한_통합숙제', problemCount: 98,
    imagePath: '/math_crops/숙제/미적분/01수열의극한/',
    relatedUnit: '수열의 극한',
    stages: { '4단계': { start: 64, end: 83 } },
  },
  {
    id: 'hw_cal_01d', title: '수열의 극한 ④ (심화)', subject: '미적분',
    folderName: '01수열의극한', hintKey: '미적분_01수열의극한_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/01수열의극한2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/01수열의극한3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/01수열의극한4단계/정답및해설.html' },
    answerKey: '미적분_01수열의극한_통합숙제', problemCount: 98,
    imagePath: '/math_crops/숙제/미적분/01수열의극한/',
    relatedUnit: '수열의 극한',
    stages: { '4단계': { start: 84, end: 98 } },
  },

  // ── 02. 급수 (134문제) ──
  {
    id: 'hw_cal_02a', title: '급수 ①', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '2단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_cal_02b', title: '급수 ②', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '2단계': { start: 21, end: 46 } },
  },
  {
    id: 'hw_cal_02c', title: '급수 ③', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '3단계': { start: 47, end: 66 } },
  },
  {
    id: 'hw_cal_02d', title: '급수 ④', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '3단계': { start: 67, end: 86 } },
  },
  {
    id: 'hw_cal_02e', title: '급수 ⑤', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '3단계': { start: 87, end: 99 }, '4단계': { start: 100, end: 114 } },
  },
  {
    id: 'hw_cal_02f', title: '급수 ⑥ (심화)', subject: '미적분',
    folderName: '02급수', hintKey: '미적분_02급수_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/02급수2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/02급수3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/02급수4단계/정답및해설.html' },
    answerKey: '미적분_02급수_통합숙제', problemCount: 134,
    imagePath: '/math_crops/숙제/미적분/02급수/',
    relatedUnit: '급수',
    stages: { '4단계': { start: 115, end: 134 } },
  },

  // ── 03. 지수로그함수의 미분 (37문제) ──
  {
    id: 'hw_cal_03a', title: '지수로그함수의 미분 ①', subject: '미적분',
    folderName: '03지수로그함수미분', hintKey: '미적분_03지수로그함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/03지수로그함수의미분2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/03지수로그함수의미분3.4단계/정답및해설.html' },
    answerKey: '미적분_03지수로그함수미분_통합숙제', problemCount: 37,
    imagePath: '/math_crops/숙제/미적분/03지수로그함수미분/',
    relatedUnit: '지수로그함수의 미분',
    stages: { '2단계': { start: 1, end: 21 } },
  },
  {
    id: 'hw_cal_03b', title: '지수로그함수의 미분 ②', subject: '미적분',
    folderName: '03지수로그함수미분', hintKey: '미적분_03지수로그함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/03지수로그함수의미분2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/03지수로그함수의미분3.4단계/정답및해설.html' },
    answerKey: '미적분_03지수로그함수미분_통합숙제', problemCount: 37,
    imagePath: '/math_crops/숙제/미적분/03지수로그함수미분/',
    relatedUnit: '지수로그함수의 미분',
    stages: { '3·4단계': { start: 22, end: 37 } },
  },

  // ── 04. 삼각함수의 미분 (155문제) ──
  {
    id: 'hw_cal_04a', title: '삼각함수의 미분 ①', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '2단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_cal_04b', title: '삼각함수의 미분 ②', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '2단계': { start: 21, end: 40 } },
  },
  {
    id: 'hw_cal_04c', title: '삼각함수의 미분 ③', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '2단계': { start: 41, end: 60 } },
  },
  {
    id: 'hw_cal_04d', title: '삼각함수의 미분 ④', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '2단계': { start: 61, end: 87 } },
  },
  {
    id: 'hw_cal_04e', title: '삼각함수의 미분 ⑤', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '3단계': { start: 88, end: 107 } },
  },
  {
    id: 'hw_cal_04f', title: '삼각함수의 미분 ⑥', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '3단계': { start: 108, end: 117 }, '4단계': { start: 118, end: 137 } },
  },
  {
    id: 'hw_cal_04g', title: '삼각함수의 미분 ⑦ (심화)', subject: '미적분',
    folderName: '04삼각함수미분', hintKey: '미적분_04삼각함수미분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/04삼각함수의미분2단계/정답및해설.html', '3단계': '/math_crops/숙제/미적분심화/04삼각함수의미분3단계/정답및해설.html', '4단계': '/math_crops/숙제/미적분심화/04삼각함수의미분4단계/정답및해설.html' },
    answerKey: '미적분_04삼각함수미분_통합숙제', problemCount: 155,
    imagePath: '/math_crops/숙제/미적분/04삼각함수미분/',
    relatedUnit: '삼각함수의 미분',
    stages: { '4단계': { start: 138, end: 155 } },
  },

  // ── 05. 여러가지 미분법 (83문제) ──
  {
    id: 'hw_cal_05a', title: '여러가지 미분법 ①', subject: '미적분',
    folderName: '05여러가지미분법', hintKey: '미적분_05여러가지미분법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/05여러가지미분법2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/05여러가지미분법3.4단계/정답및해설.html' },
    answerKey: '미적분_05여러가지미분법_통합숙제', problemCount: 83,
    imagePath: '/math_crops/숙제/미적분/05여러가지미분법/',
    relatedUnit: '여러가지 미분법',
    stages: { '2단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_cal_05b', title: '여러가지 미분법 ②', subject: '미적분',
    folderName: '05여러가지미분법', hintKey: '미적분_05여러가지미분법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/05여러가지미분법2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/05여러가지미분법3.4단계/정답및해설.html' },
    answerKey: '미적분_05여러가지미분법_통합숙제', problemCount: 83,
    imagePath: '/math_crops/숙제/미적분/05여러가지미분법/',
    relatedUnit: '여러가지 미분법',
    stages: { '2단계': { start: 21, end: 40 } },
  },
  {
    id: 'hw_cal_05c', title: '여러가지 미분법 ③', subject: '미적분',
    folderName: '05여러가지미분법', hintKey: '미적분_05여러가지미분법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/05여러가지미분법2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/05여러가지미분법3.4단계/정답및해설.html' },
    answerKey: '미적분_05여러가지미분법_통합숙제', problemCount: 83,
    imagePath: '/math_crops/숙제/미적분/05여러가지미분법/',
    relatedUnit: '여러가지 미분법',
    stages: { '2단계': { start: 41, end: 56 }, '3·4단계': { start: 57, end: 63 } },
  },
  {
    id: 'hw_cal_05d', title: '여러가지 미분법 ④ (심화)', subject: '미적분',
    folderName: '05여러가지미분법', hintKey: '미적분_05여러가지미분법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/05여러가지미분법2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/05여러가지미분법3.4단계/정답및해설.html' },
    answerKey: '미적분_05여러가지미분법_통합숙제', problemCount: 83,
    imagePath: '/math_crops/숙제/미적분/05여러가지미분법/',
    relatedUnit: '여러가지 미분법',
    stages: { '3·4단계': { start: 64, end: 83 } },
  },

  // ── 06. 도함수의 활용 1 (80문제) ──
  {
    id: 'hw_cal_06a', title: '도함수의 활용 1 ①', subject: '미적분',
    folderName: '06도함수활용1', hintKey: '미적분_06도함수활용1_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/06도함수의활용1/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/06도함수의활용1/3.4단계/정답및해설.html' },
    answerKey: '미적분_06도함수활용1_통합숙제', problemCount: 80,
    imagePath: '/math_crops/숙제/미적분/06도함수활용1/',
    relatedUnit: '도함수의 활용 1',
    stages: { '2단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_cal_06b', title: '도함수의 활용 1 ②', subject: '미적분',
    folderName: '06도함수활용1', hintKey: '미적분_06도함수활용1_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/06도함수의활용1/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/06도함수의활용1/3.4단계/정답및해설.html' },
    answerKey: '미적분_06도함수활용1_통합숙제', problemCount: 80,
    imagePath: '/math_crops/숙제/미적분/06도함수활용1/',
    relatedUnit: '도함수의 활용 1',
    stages: { '2단계': { start: 21, end: 31 }, '3·4단계': { start: 32, end: 51 } },
  },
  {
    id: 'hw_cal_06c', title: '도함수의 활용 1 ③', subject: '미적분',
    folderName: '06도함수활용1', hintKey: '미적분_06도함수활용1_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/06도함수의활용1/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/06도함수의활용1/3.4단계/정답및해설.html' },
    answerKey: '미적분_06도함수활용1_통합숙제', problemCount: 80,
    imagePath: '/math_crops/숙제/미적분/06도함수활용1/',
    relatedUnit: '도함수의 활용 1',
    stages: { '3·4단계': { start: 52, end: 71 } },
  },
  {
    id: 'hw_cal_06d', title: '도함수의 활용 1 ④ (심화)', subject: '미적분',
    folderName: '06도함수활용1', hintKey: '미적분_06도함수활용1_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/06도함수의활용1/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/06도함수의활용1/3.4단계/정답및해설.html' },
    answerKey: '미적분_06도함수활용1_통합숙제', problemCount: 80,
    imagePath: '/math_crops/숙제/미적분/06도함수활용1/',
    relatedUnit: '도함수의 활용 1',
    stages: { '3·4단계': { start: 72, end: 80 } },
  },

  // ── 07. 도함수의 활용 2 (39문제) ──
  {
    id: 'hw_cal_07a', title: '도함수의 활용 2 ①', subject: '미적분',
    folderName: '07도함수활용2', hintKey: '미적분_07도함수활용2_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/07도함수의활용2/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/07도함수의활용2/3.4단계/정답및해설.html' },
    answerKey: '미적분_07도함수활용2_통합숙제', problemCount: 39,
    imagePath: '/math_crops/숙제/미적분/07도함수활용2/',
    relatedUnit: '도함수의 활용 2',
    stages: { '2단계': { start: 1, end: 13 }, '3·4단계': { start: 14, end: 20 } },
  },
  {
    id: 'hw_cal_07b', title: '도함수의 활용 2 ②', subject: '미적분',
    folderName: '07도함수활용2', hintKey: '미적분_07도함수활용2_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/07도함수의활용2/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/07도함수의활용2/3.4단계/정답및해설.html' },
    answerKey: '미적분_07도함수활용2_통합숙제', problemCount: 39,
    imagePath: '/math_crops/숙제/미적분/07도함수활용2/',
    relatedUnit: '도함수의 활용 2',
    stages: { '3·4단계': { start: 21, end: 39 } },
  },

  // ── 08. 여러가지 적분법 (18문제) ──
  {
    id: 'hw_cal_08', title: '여러가지 적분법', subject: '미적분',
    folderName: '08여러가지적분법', hintKey: '미적분_08여러가지적분법_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/08여러가지적분법/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/08여러가지적분법/3.4단계/정답및해설.html' },
    answerKey: '미적분_08여러가지적분법_통합숙제', problemCount: 18,
    imagePath: '/math_crops/숙제/미적분/08여러가지적분법/',
    relatedUnit: '여러가지 적분법',
    stages: { '2단계': { start: 1, end: 10 }, '3·4단계': { start: 11, end: 18 } },
  },

  // ── 09. 정적분 (115문제) ──
  {
    id: 'hw_cal_09a', title: '정적분 ①', subject: '미적분',
    folderName: '09정적분', hintKey: '미적분_09정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/09정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/09정적분/3.4단계/정답및해설.html' },
    answerKey: '미적분_09정적분_통합숙제', problemCount: 115,
    imagePath: '/math_crops/숙제/미적분/09정적분/',
    relatedUnit: '정적분',
    stages: { '2단계': { start: 1, end: 20 } },
  },
  {
    id: 'hw_cal_09b', title: '정적분 ②', subject: '미적분',
    folderName: '09정적분', hintKey: '미적분_09정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/09정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/09정적분/3.4단계/정답및해설.html' },
    answerKey: '미적분_09정적분_통합숙제', problemCount: 115,
    imagePath: '/math_crops/숙제/미적분/09정적분/',
    relatedUnit: '정적분',
    stages: { '2단계': { start: 21, end: 40 } },
  },
  {
    id: 'hw_cal_09c', title: '정적분 ③', subject: '미적분',
    folderName: '09정적분', hintKey: '미적분_09정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/09정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/09정적분/3.4단계/정답및해설.html' },
    answerKey: '미적분_09정적분_통합숙제', problemCount: 115,
    imagePath: '/math_crops/숙제/미적분/09정적분/',
    relatedUnit: '정적분',
    stages: { '2단계': { start: 41, end: 53 }, '3·4단계': { start: 54, end: 73 } },
  },
  {
    id: 'hw_cal_09d', title: '정적분 ④', subject: '미적분',
    folderName: '09정적분', hintKey: '미적분_09정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/09정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/09정적분/3.4단계/정답및해설.html' },
    answerKey: '미적분_09정적분_통합숙제', problemCount: 115,
    imagePath: '/math_crops/숙제/미적분/09정적분/',
    relatedUnit: '정적분',
    stages: { '3·4단계': { start: 74, end: 93 } },
  },
  {
    id: 'hw_cal_09e', title: '정적분 ⑤ (심화)', subject: '미적분',
    folderName: '09정적분', hintKey: '미적분_09정적분_통합숙제',
    solutionHtmlPath: { '2단계': '/math_crops/숙제/미적분심화/09정적분/2단계/정답및해설.html', '3·4단계': '/math_crops/숙제/미적분심화/09정적분/3.4단계/정답및해설.html' },
    answerKey: '미적분_09정적분_통합숙제', problemCount: 115,
    imagePath: '/math_crops/숙제/미적분/09정적분/',
    relatedUnit: '정적분',
    stages: { '3·4단계': { start: 94, end: 115 } },
  },
];

/**
 * 학생 등급 → 접근 가능 단계 매핑
 */
export const STAGE_ACCESS = {
  '4~5등급': '2단계',
  '3등급': '3·4단계',
  '1~2등급': '3·4단계',
};

/**
 * 학생 등급에 따라 해당 단원의 문제 범위를 반환
 * 미적분은 2단계/3단계/4단계가 별도로 있으므로 다단계 fallback 지원
 */
export function getHomeworkRange(hwUnit, studentLevel) {
  const stages = hwUnit.stages;
  
  // 우선순위 기반 stage 탐색
  const priorityMap = {
    '4~5등급': ['2단계'],
    '3등급':   ['3단계', '3·4단계', '2단계'],
    '1~2등급': ['4단계', '3·4단계', '3단계', '2단계'],
  };
  
  const candidates = priorityMap[studentLevel] || ['2단계'];
  for (const stage of candidates) {
    if (stages[stage]) return stages[stage];
  }
  
  // fallback: 어떤 stage든 첫 번째 것 반환
  const firstKey = Object.keys(stages)[0];
  return stages[firstKey] || { start: 1, end: 1 };
}

/**
 * 문제 번호를 3자리 문자열로 변환 (1 → "001")
 */
export function padProblemNum(num) {
  return String(num).padStart(3, '0');
}

/**
 * 이차함수 회차 숙제 해금 여부 확인
 */
export function isSequenceUnlocked(hwUnit) {
  if (!hwUnit.parentUnit || !hwUnit.sequence) return true; // 순차 아닌 단원은 항상 해금
  if (hwUnit.sequence === 1) return true; // 1회차는 항상 해금

  // 이전 회차가 완료되었는지 확인
  const progressKey = `hw_sequence_${hwUnit.parentUnit}`;
  try {
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    const completed = progress.completed || [];
    return completed.includes(hwUnit.sequence - 1);
  } catch {
    return false;
  }
}

/**
 * 이차함수 회차 완료 기록
 */
export function markSequenceComplete(hwUnit) {
  if (!hwUnit.parentUnit || !hwUnit.sequence) return;
  
  const progressKey = `hw_sequence_${hwUnit.parentUnit}`;
  try {
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
    const completed = progress.completed || [];
    if (!completed.includes(hwUnit.sequence)) {
      completed.push(hwUnit.sequence);
    }
    localStorage.setItem(progressKey, JSON.stringify({
      currentSequence: Math.max(...completed) + 1,
      completed,
    }));
  } catch (e) {
    console.error('markSequenceComplete error:', e);
  }
}

/**
 * 숙제 진행도 로드
 */
export function getHomeworkProgress(hwId) {
  try {
    return JSON.parse(localStorage.getItem(`hw_progress_${hwId}`) || '{}');
  } catch {
    return {};
  }
}

/**
 * 숙제 진행도 저장
 */
export function saveHomeworkProgress(hwId, progress) {
  localStorage.setItem(`hw_progress_${hwId}`, JSON.stringify(progress));
}

/** 오답 복습 노트(특수 숙제) 식별자 */
export const WRONG_REVIEW_ID = 'wrong_review';

/** hwId(예: 'hw_01')로 단원 메타 조회 (오답노트 문제 재구성용) */
export function getUnitById(hwId) {
  return HOMEWORK_UNITS.find(u => u.id === hwId) || null;
}
