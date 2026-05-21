import { getCurrentUnit as ssotGetCurrentUnit, getStudyMode } from '@/data/curriculumSSOT';

// Helper for other legacy references to avoid breaking
export const getCurrentScienceUnit = ({ grade, currentDate = new Date() }) => {
  const month = currentDate.getMonth() + 1;
  const unitData = ssotGetCurrentUnit({ grade, subject: '과학', month });
  
  if (!unitData) {
    return {
      unit: '기본 개념',
      concepts: [],
      questions: {},
      beginnerFlow: []
    };
  }

  // Map SSOT to old structure gracefully
  return {
    unit: unitData.unit,
    concepts: unitData.concepts,
    questions: {},
    beginnerFlow: [],
    ...unitData
  };
};

import { getMathUnitByMonth } from '@/data/mathCurriculumSSOT';
import { parseGrade } from '@/data/curriculumSSOT';

export const getCurrentUnit = ({ subject, grade, currentDate = new Date() }) => {
  const month = currentDate.getMonth() + 1;
  const pGrade = parseGrade(grade);

  if (subject === 'math' || subject === '수학') {
    const mathUnitData = getMathUnitByMonth(pGrade, month);
    return {
      unit: mathUnitData.unit,
      concepts: mathUnitData.concepts,
      questions: {},
      beginnerFlow: [],
      ...mathUnitData
    };
  }

  const unitData = ssotGetCurrentUnit({ grade, subject, month });
  
  if (unitData) {
    return {
      unit: unitData.unit,
      concepts: unitData.concepts,
      questions: {},
      beginnerFlow: [],
      ...unitData
    };
  }

  // Fallback for missing units
  return {
    unit: '기본 개념',
    concepts: ['기초'],
    questions: {},
    beginnerFlow: []
  };
};

export { getStudyMode };
