// src/services/examModeEngine.js
// 날짜 기반 NORMAL / EXAM 모드 자동 판별

// 시험 기간 정의 (월, 일 범위)
const EXAM_PERIODS = [
  { name: 'midterm_spring',  label: '1학기 중간고사', start: [4, 22], end: [5, 10] },
  { name: 'final_spring',    label: '1학기 기말고사', start: [6, 22], end: [7, 5]  },
  { name: 'midterm_fall',    label: '2학기 중간고사', start: [9, 22], end: [10, 10] },
  { name: 'final_fall',      label: '2학기 기말고사', start: [11, 22], end: [12, 10] },
];

import { getStudyMode } from '@/data/curriculumSSOT';

export const detectStudyMode = (date = new Date()) => {
  const month = typeof date === 'number' ? date : date.getMonth() + 1;
  const modeStatus = getStudyMode(date);
  
  if (modeStatus.startsWith('EXAM')) {
    const isMidterm = modeStatus.includes('MID');
    return {
      mode: 'EXAM',
      examType: isMidterm ? 'midterm' : 'final',
      label: isMidterm ? '중간고사 대비' : '기말고사 대비',
      periodName: isMidterm ? 'midterm_prep' : 'final_prep'
    };
  }

  return { mode: '', examType: null, label: '평상시 학습', periodName: null };
};

export const detectMathMode = (date = new Date(), grade = '') => {
  if (grade === '고3' || grade === 'high3') {
    // 고3은 항상 시험/수능 모드
    return { mathMode: 'exam', examType: 'suneung', label: '수능 대비' };
  }
  const modeStatus = getStudyMode(date);
  if (modeStatus.startsWith('EXAM')) {
    const isMidterm = modeStatus.includes('MID');
    return { mathMode: 'exam', examType: isMidterm ? 'midterm' : 'final', label: isMidterm ? '중간고사 대비' : '기말고사 대비' };
  }
  return { mathMode: 'growth', examType: null, label: '성장 모드 (F~A등급 기반)' };
};

// EXAM MODE 시험 범위 추천
export const getExamScope = ({ grade, examType }) => {
  const scopes = {
    midterm: {
      '중1': ['여러 가지 힘', '물질의 상태'],
      '중2': ['물질의 구성', '전기와 자기'],
      '중3': ['화학 반응의 규칙', '운동'],
      '고1': ['역학과 에너지', '물질의 특성'],
      '고2': ['역학적 상호작용', '전자기'],
    },
    final: {
      '중1': ['지구계와 지권의 변화', '생물의 구조'],
      '중2': ['빛과 파동', '소화흡수'],
      '중3': ['유전과 진화', '전기에너지'],
      '고1': ['파동과 정보', '생태계'],
      '고2': ['열과 에너지', '파동'],
    }
  };
  return scopes[examType]?.[grade] || ['전 단원 복습'];
};

// EXAM MODE 테스트 설정 (고3 전용 분기 추가)
export const getExamTestConfig = (selfReportedLevel, grade) => {
  if (grade === '고3' || grade === 'high3') {
    const high3Configs = {
      '4~5등급': { total: 18, timeLimit: 25 }, // 목표: 15~20
      '3등급':   { total: 25, timeLimit: 35 }, // 목표: 20~30
      '2등급':   { total: 35, timeLimit: 45 }, // 목표: 30~40
      '1등급':   { total: 45, timeLimit: 60 }, // 목표: 40+
      '모름':    { total: 18, timeLimit: 25 },
    };
    return high3Configs[selfReportedLevel] || high3Configs['3등급'];
  }

  const configs = {
    '4~5등급': { total: 15, timeLimit: 20 },
    '3등급':   { total: 18, timeLimit: 25 },
    '2등급':   { total: 22, timeLimit: 30 },
    '1등급':   { total: 25, timeLimit: 35 },
    '모름':    { total: 15, timeLimit: 20 },
  };
  return configs[selfReportedLevel] || configs['3등급'];
};
