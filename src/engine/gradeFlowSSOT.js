/**
 * gradeFlowSSOT.js
 * 학년별 학습/체험/결제 플로우 SSOT (Single Source Of Truth)
 * 
 * 핵심: "문제 풀이 → 정답 입력 → AVS 확인 → 취약 분석 → 맞춤 보강 설계"
 */

// ─── 학년별 플로우 정의 ───
export const GRADE_FLOWS = {
  '고1': {
    grade: '고1',
    freeTrialMinutes: 20,
    freeTrialType: 'time',
    progressOptions: [
      '아직 안 배움',
      '다항식의 연산',
      '항등식과 나머지정리',
      '인수분해',
      '복소수',
      '이차방정식',
      '이차방정식과 이차함수',
      '고차방정식',
      '일차부등식',
      '이차부등식',
      '행렬',
      '점과좌표',
      '직선의방정식',
      '원의방정식',
      '도형의이동'
    ],
    rankOptions: ['4~5등급', '3등급', '1~2등급'],
    subjects: ['수학(상)', '수학(하)'],
    dailyMaxProblems: 60,
    paidFeatures: ['수학 상/하 기말 범위', 'KaTeX 유사문제 숙제', '숙제 검사', '대시보드'],
  },
  '고2': {
    grade: '고2',
    freeTrialMinutes: 20,
    freeTrialType: 'time',
    progressOptions: [
      '아직 안 배움',
      '지수',
      '로그',
      '지수함수',
      '로그함수',
      '삼각함수성질',
      '삼각함수그래프',
      '삼각함수활용',
      '등차등비',
      '시그마용법',
      '귀납적정의'
    ],
    rankOptions: ['4~5등급', '3등급', '1~2등급'],
    subjects: ['수1', '수2'],
    dailyMaxProblems: 60,
    paidFeatures: ['수1/수2 전체 개방', '취약 단원 보강', 'KaTeX 유사문제 숙제', '2주마다 실력진단테스트'],
  },
  '고3': {
    grade: '고3',
    freeTrialMinutes: null,
    freeTrialType: 'content',
    progressOptions: ['모의고사', '수1', '수2', '미적분', '확률과통계'],
    rankOptions: ['4~5등급', '3등급', '1~2등급'],
    subjects: ['수1', '수2', '미적분', '확률과통계'],
    dailyMaxProblems: 60,
    paidFeatures: ['모의고사 전체', '수1', '수2', '미적분', '확률과통계', '2~4단계', 'AVS', '취약 분석', '보강 문제', '숙제/리포트'],
  }
};

export function progressToNextUnit(grade, currentProgress) {
  const options = GRADE_FLOWS[grade]?.progressOptions || [];
  const idx = options.indexOf(currentProgress);
  let nextPlain = options[1] || '01.다항식의 연산';
  if (idx >= 0 && idx < options.length - 1) {
    nextPlain = options[idx + 1];
  }
  
  const mapping = {
    '다항식의 연산': '01.다항식의 연산',
    '항등식과 나머지정리': '02.항등식과 나머지정리',
    '인수분해': '03.인수분해',
    '복소수': '04.복소수',
    '이차방정식': '05.이차방정식',
    '이차방정식과 이차함수': '06.이차방정식과이차함수',
    '여러가지 방정식': '07.여러가지 방정식',
    '여러가지 부등식': '08.여러가지 부등식',
    '고차방정식': '고차방정식',
    '일차부등식': '일차부등식',
    '이차부등식': '이차부등식',
    '행렬': '행렬',
    '점과좌표': '점과좌표',
    '직선의방정식': '직선의방정식',
    '원의방정식': '원의방정식',
    '도형의이동': '도형의이동'
  };
  
  return mapping[nextPlain] || nextPlain;
}

export function getStartLevel(rank) {
  if (rank.includes('1~2등급')) return 4;
  if (rank.includes('3등급')) return 3;
  return 2; // 4~5등급
}

// ─── 등급별 선생님 배정 로직 ───
export const TEACHER_ASSIGNMENT = {
  '4~5등급': {
    style: '기초 설명형',
    description: '기초 개념부터 차근차근 설명, 공식 유도 과정 강조',
    defaultTeacherIds: { '고1': 'h_math3', '고2': 'h_math6', '고3': 'h_math9' }
  },
  '3등급': {
    style: '개념+문제 균형형',
    description: '개념 이해 확인 후 실전 문제 적용, 오답 분석 중심',
    defaultTeacherIds: { '고1': 'h_math2', '고2': 'h_math5', '고3': 'h_math8' }
  },
  '1~2등급': {
    style: '심화/킬러 대비형',
    description: '3~4단계 고난도 문제 위주, 킬러 문항 전략 훈련',
    defaultTeacherIds: { '고1': 'h_math1', '고2': 'h_math4', '고3': 'h_math7' }
  }
};

// ─── 등급별 난이도 비율 ───
export const DIFFICULTY_RATIOS = {
  '4~5등급': { level2: 0.80, level3: 0.20, level4: 0.00 },
  '3등급':   { level2: 0.50, level3: 0.40, level4: 0.10 },
  '1~2등급': { level2: 0.20, level3: 0.40, level4: 0.40 }
};

// ─── 보강 난이도 구성 (틀린 단계 기준) ───
export const REINFORCEMENT_DIFFICULTY = {
  2: { level2: 0.80, level3: 0.20, level4: 0.00 },
  3: { level2: 0.40, level3: 0.40, level4: 0.20 },
  4: { level2: 0.00, level3: 0.50, level4: 0.50 }
};

// ─── 보강 문제 수 정책 ───
export const REINFORCEMENT_COUNT = {
  1: 3,   // 틀린 문제 1개 → 보강 3문제
  2: 5,   // 틀린 문제 2개 → 보강 5문제
  3: 7,   // 틀린 문제 3개 → 보강 7문제
  4: 10,  // 틀린 문제 4개 이상 → 보강 10문제
};

export function getReinforcementCount(wrongCount) {
  if (wrongCount >= 4) return 10;
  return REINFORCEMENT_COUNT[wrongCount] || 3;
}

// ─── 고3 무료 체험 진행 상태 체크 ───
export const G3_FREE_STAGES = {
  MOCK_EXAM: 'mock_exam',         // 모의고사 1회 진행 중
  WEAKNESS_REPORT: 'weakness',     // 취약 분석 표시
  REINFORCEMENT: 'reinforcement',  // 보강 5문제
  RE_ANALYSIS: 're_analysis',      // 보강 후 재분석
  COMPLETED: 'completed'           // 무료 구간 완료 → 결제 게이트
};

// ─── 무료 체험 상태 관리 ───
const STORAGE_KEY = 'mentos_free_trial';

export function getTrialState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch { return null; }
}

export function setTrialState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function initTrial(grade, rank) {
  const flow = GRADE_FLOWS[grade];
  if (!flow) return null;

  const state = {
    grade,
    rank,
    startedAt: Date.now(),
    freeTrialMinutes: flow.freeTrialMinutes,
    freeTrialType: flow.freeTrialType,
    isPaid: false,
    isTrialExpired: false,
    problemsSolvedToday: 0,
    g3Stage: grade === '고3' ? G3_FREE_STAGES.MOCK_EXAM : null,
    weaknessAnalysisCount: 0,
  };

  setTrialState(state);
  return state;
}

export function checkTrialExpired(trialState) {
  if (!trialState) return true;
  if (trialState.isPaid) return false;

  if (trialState.freeTrialType === 'time') {
    const elapsed = (Date.now() - trialState.startedAt) / 1000 / 60;
    return elapsed >= trialState.freeTrialMinutes;
  }

  if (trialState.freeTrialType === 'content') {
    return trialState.g3Stage === G3_FREE_STAGES.COMPLETED;
  }

  return false;
}

export function advanceG3Stage(currentStage) {
  const order = [
    G3_FREE_STAGES.MOCK_EXAM,
    G3_FREE_STAGES.WEAKNESS_REPORT,
    G3_FREE_STAGES.REINFORCEMENT,
    G3_FREE_STAGES.RE_ANALYSIS,
    G3_FREE_STAGES.COMPLETED
  ];
  const idx = order.indexOf(currentStage);
  return idx < order.length - 1 ? order[idx + 1] : G3_FREE_STAGES.COMPLETED;
}

// ─── 하루 문제 수 제한 체크 ───
export function canSolveMore(trialState) {
  if (!trialState) return false;
  return trialState.problemsSolvedToday < 60;
}

export function incrementProblemCount() {
  const state = getTrialState();
  if (!state) return;
  state.problemsSolvedToday++;
  setTrialState(state);
}

// ─── 유료 전환 ───
export function activatePaidAccess() {
  const state = getTrialState();
  if (!state) return;
  state.isPaid = true;
  state.isTrialExpired = false;
  setTrialState(state);
}
