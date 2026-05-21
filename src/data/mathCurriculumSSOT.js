// src/data/mathCurriculumSSOT.js

export const MATH_CURRICULUM = {
  middle1: [
    { title: '수와 연산', concepts: ['정수 / 유리수', '사칙연산', '절댓값'] },
    { title: '문자와 식', concepts: ['문자 사용', '식의 계산', '일차식'] },
    { title: '방정식', concepts: ['일차방정식', '간단한 응용'] },
    { title: '좌표와 그래프 기초', concepts: ['좌표평면', '점의 위치', '간단한 그래프'] },
    { title: '기본 도형', concepts: ['선, 각', '삼각형', '기본 도형 성질'] },
  ],
  middle2: [
    { title: '식의 계산', concepts: ['다항식', '전개 / 인수분해 기초'] },
    { title: '일차함수', concepts: ['y = ax + b', '그래프', '기울기', '변화량'] },
    { title: '연립방정식', concepts: ['두 식 연결', '해의 의미'] },
    { title: '도형 심화', concepts: ['삼각형 성질', '평행선', '각의 관계'] },
    { title: '확률 기초', concepts: ['경우의 수', '간단한 확률'] },
  ],
  middle3: [
    { title: '이차식', concepts: ['전개 / 인수분해', '이차식 계산'] },
    { title: '이차방정식', concepts: ['해 구하기', '근의 의미'] },
    { title: '함수 심화', concepts: ['이차함수 기초', '그래프 형태'] },
    { title: '피타고라스 정리', concepts: ['직각삼각형', '길이 관계'] },
    { title: '통계', concepts: ['평균 / 분산', '자료 해석'] },
  ],
  high1: [
    { title: '다항식', concepts: ['연산', '나머지정리'] },
    { title: '방정식과 부등식', concepts: ['2차 방정식', '부등식'] },
    { title: '함수', concepts: ['함수 정의', '그래프 해석'] },
    { title: '경우의 수', concepts: ['순열', '조합'] },
    { title: '기초 확률', concepts: ['경우의 수 확장'] },
  ],
  high2: [
    { title: '지수 / 로그', concepts: ['지수법칙', '로그'] },
    { title: '지수함수 / 로그함수', concepts: ['그래프', '변화'] },
    { title: '삼각함수', concepts: ['sin, cos, tan', '주기'] },
    { title: '수열', concepts: ['등차 / 등비', '일반항', '합'] },
    { title: '함수 확장', concepts: ['다양한 함수 해석'] },
  ],
  // 고3은 커리큘럼에서 고2의 심화 과정을 따르거나 전범위를 따름. (별도 지정 제외)
};

MATH_CURRICULUM.high3 = MATH_CURRICULUM.high2;

// 월(month)에 따른 5개 단원 매핑 (타 과목 시험기간과 연동. 단, 고3은 수능준비로 매핑 예외가 될 수 있음)
export const getMathUnitByMonth = (grade, month) => {
  const units = MATH_CURRICULUM[grade] || MATH_CURRICULUM['middle1'];
  
  if (grade === 'high3') {
    // 고3은 항상 수능 대비 모드 또는 1학기에 전단원 몰아치기
    return {
      unit: '수능 수학 전범위',
      concepts: ['수1/수2/선택과목 심화'],
      isExamPeriod: false
    };
  }

  // 1학기 중간 (3, 4, 5월): 단원 1, 2
  if (month === 3) return { unit: units[0].title, concepts: units[0].concepts, isExamPeriod: false };
  if (month === 4) return { unit: `${units[0].title} / ${units[1].title}`, concepts: [...units[0].concepts, ...units[1].concepts], isExamPeriod: true };
  if (month === 5) return { unit: units[1].title, concepts: units[1].concepts, isExamPeriod: true };
  
  // 1학기 기말 (6, 7월): 단원 3
  if (month === 6) return { unit: units[2].title, concepts: units[2].concepts, isExamPeriod: false };
  if (month === 7) return { unit: units[2].title, concepts: units[2].concepts, isExamPeriod: true };
  
  // 2학기 중간 (8, 9, 10월): 단원 4
  if (month === 8 || month === 9) return { unit: units[3].title, concepts: units[3].concepts, isExamPeriod: false };
  if (month === 10) return { unit: units[3].title, concepts: units[3].concepts, isExamPeriod: true };
  
  // 2학기 기말 (11, 12월): 단원 5
  if (month === 11 || month === 12) return { unit: units[4].title, concepts: units[4].concepts, isExamPeriod: true };

  // default (1, 2월)
  return { unit: units[0].title, concepts: units[0].concepts, isExamPeriod: false };
};
