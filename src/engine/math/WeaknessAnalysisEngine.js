import { UnitProblemSetGenerator } from './UnitProblemSetGenerator';
import mockExam01Map from '../../data/mock_exam_01_unit_map.json';

/**
 * 모의고사 취약단원 분석 및 맞춤형 보강 문제 생성 엔진
 */
export const WeaknessAnalysisEngine = {
  /**
   * 학생의 오답 데이터를 기반으로 취약단원을 분석하고 보강 세트를 생성합니다.
   * @param {Array} questionsWithMeta - 모의고사 전체 문제 객체 배열
   * @param {Array} wrongIds - 학생이 틀린 문제의 ID 배열
   * @param {number} score - 학생의 점수 (0-100)
   * @returns {Object} { report, drillSet }
   */
  analyzeAndGenerateDrill: (questionsWithMeta, wrongIds, score = 0) => {
    console.log('[WeaknessAnalysisEngine] 분석 시작:', { wrongCount: wrongIds.length, score });
    
    const UNIT_ALIAS_MAP = {
      '사인법칙과 코사인법칙': '삼각함수활용',
      '지수함수의 그래프와 평행이동': '지수함수',
      '로그함수와 정삼각형': '지수함수',
      '속도와 가속도': '미분',
      '수열의 귀납적 정의': '수열',
      '정적분과 넓이': '적분',
      '미분가능성과 삼차함수 추론': '미분',
      '함수의 극한과 다항함수 추론': '미분',
      '삼각함수의 미분과 도형': '미분',
      '여러 가지 미분법과 사잇값 정리': '미분',
      '등비급수와 삼각함수 수열': '수열',
      '합성함수의 미분가능성과 극대극소': '미분',
      '지수함수와 로그함수': '지수함수',
      '다항함수의 미분법': '미분',
      '다항함수의 적분법': '적분',
      '함수의 극한과 연속': '미분',
      '삼각함수': '삼각함수',
      '미적분_수열의극한': '수열',
      '미적분_미분법': '미분',
      '미적분_적분법': '적분'
    };

    // 1. 정확한 오답 단원 매핑 및 그룹화
    const unitGroups = {};

    wrongIds.forEach(id => {
      const mapping = mockExam01Map[String(id)];
      const rawUnit = mapping ? mapping.unitName : '기타단원';
      const normalizedUnit = UNIT_ALIAS_MAP[rawUnit] || rawUnit;
      const level = mapping ? mapping.level : 3;
      
      if (!unitGroups[normalizedUnit]) {
        unitGroups[normalizedUnit] = {
          unitName: rawUnit,
          normalizedUnit: normalizedUnit,
          wrongQuestionNumbers: [],
          level: level
        };
      }
      unitGroups[normalizedUnit].wrongQuestionNumbers.push(id);
    });

    console.log('[WeaknessAnalysisEngine] 단원별 그룹화:', unitGroups);

    // 2. 취약 단원 랭킹 생성
    const sortedUnits = Object.values(unitGroups)
      .map(group => ({
        ...group,
        wrongCount: group.wrongQuestionNumbers.length,
        errorRate: group.wrongQuestionNumbers.length / 30
      }))
      .sort((a, b) => b.wrongCount - a.wrongCount);

    // 3. 등급별 보강 전략 수립 (점수 구간별 정교화)
    let targetUnitCount = 5;
    let targetLevels = [3]; // Default
    let gradeStrategy = '일반';

    if (score < 50) {
      // 4~5등급: 2단계 기초 집중
      targetUnitCount = 5;
      targetLevels = [2, 2, 2, 2, 2];
      gradeStrategy = '4~5등급 기초 강화 (2단계 5문항)';
    } else if (score < 60) {
      // 50~60점: 2단계(3문항) + 3단계(2문항) 혼합
      targetUnitCount = 5;
      targetLevels = [2, 2, 2, 3, 3];
      gradeStrategy = '3~4등급 실력 다지기 (2단계 3문항 + 3단계 2문항)';
    } else if (score < 70) {
      // 60~70점: 3단계 유형 정복
      targetUnitCount = 5;
      targetLevels = [3, 3, 3, 3, 3];
      gradeStrategy = '3등급 핵심 정복 (3단계 5문항)';
    } else {
      // 70점 이상: 4단계 킬러 도전
      targetUnitCount = 3;
      targetLevels = [4, 4, 4, 4, 4];
      gradeStrategy = '1~2등급 고득점 유지 (4단계 5문항)';
    }

    const topWeakUnits = sortedUnits.slice(0, targetUnitCount);

    // 4. 보강 문제 풀(Pull) 생성
    const drillSet = topWeakUnits.map(wu => {
      const questions = [];
      // 각 레벨별로 문제 추출
      targetLevels.forEach(lvl => {
        const q = UnitProblemSetGenerator.generateSet(wu.normalizedUnit, 1, lvl);
        if (q.length > 0) questions.push(q[0]);
      });
      if (questions.length === 0) {
        console.warn(`[WeaknessAnalysisEngine] 보강 문제 생성 실패 (0문제): ${wu.normalizedUnit}`);
      }
      
      return {
        unit: wu.unitName,
        normalizedUnit: wu.normalizedUnit,
        wrongQuestionNumbers: wu.wrongQuestionNumbers,
        drillQuestions: questions.map((q, idx) => {
          const parts = q.split('/');
          const folderName = parts[0];
          // 폴더명에서 "N단계" 추출 (예: "지수함수2단계" -> 2)
          const lvlMatch = folderName.match(/(\d)단계/);
          const lvl = lvlMatch ? parseInt(lvlMatch[1]) : 3;

          return {
            drillId: `drill_${wu.normalizedUnit}_${lvl}_${idx + 1}`,
            tag: q,
            unit: folderName,
            num: parts[1],
            level: lvl
          };
        })
      };
    });

    return {
      report: {
        score,
        topWeakUnits: drillSet.map(d => ({
          unit: d.unit,
          normalizedUnit: d.normalizedUnit,
          wrongQuestionNumbers: d.wrongQuestionNumbers,
          wrongCount: d.wrongQuestionNumbers.length,
          drillCount: d.drillQuestions.length,
          errorRate: d.wrongQuestionNumbers.length / 30,
          targetLevels: d.drillQuestions.map(dq => dq.level)
        })),
        gradeStrategy
      },
      drillSet
    };
  }
};
