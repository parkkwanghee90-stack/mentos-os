/**
 * 단원 기반 문제 세트 생성 엔진
 */
import problemsIndex from '../../../public/problems_index.json';

const CONCEPT_FOLDER_MAP = {
  '점과좌표': {
    2: '점과좌표2단계',
    3: '점과좌표3단계',
    4: '점과좌표4단계'
  },
  '직선의방정식': {
    2: '직선의방정식2단계',
    3: '직선의방정식3단계',
    4: '직선의방정식4단계'
  },
  '원의방정식': {
    2: '원의방정식2단계',
    3: '원의방정식3단계',
    4: '원의방정식4단계'
  },
  '도형의이동': {
    2: '도형의이동2단계',
    3: '도형의이동3단계',
    4: '도형의이동4단계'
  },
  '고차방정식': {
    2: '고차방정식2단계',
    3: '고차방정식3단계',
    4: '고차방정식4단계'
  },
  '이차부등식': {
    2: '이차부등식2단계',
    3: '이차부등식3단계',
    4: '이차부등식4단계'
  },
  '지수': {
    2: '지수2단계',
    3: '지수3단계',
    4: '지수4단계'
  },
  '로그': {
    2: '로그2단계',
    3: '로그3단계',
    4: '로그4단계'
  },
  '지수함수': {
    2: '지수함수2단계',
    3: '지수함수3단계',
    4: '지수함수4단계'
  },
  '삼각함수': {
    2: '삼각함수2단계',
    3: '삼각함수3단계',
    4: '삼각함수4단계'
  },
  '수열': {
    2: '수열2단계',
    3: '수열3단계',
    4: '수열4단계'
  },
  '미분': {
    2: '(7)수학2/미분계수 2단계',
    3: '(7)수학2/미분계수3단계',
    4: '(7)수학2/미분계수4단계'
  },
  '적분': {
    2: '(7)수학2/부정적분과 정적분 2단계',
    3: '(7)수학2/부정적분과 정적분 3단계',
    4: '(7)수학2/부정적분과 정적분 4단계'
  },
  '함수의극한': {
    2: '(7)수학2/함수의 극한 2단계',
    3: '(7)수학2/함수의극한3단계',
    4: '(7)수학2/함수의극한4단계'
  },
  '함수의연속': {
    2: '(7)수학2/함수의 연속 2단계',
    3: '(7)수학2/함수의연속3단계',
    4: '(7)수학2/함수의연속4단계'
  },
  '미분계수와도함수': {
    2: '(7)수학2/미분계수 2단계',
    3: '(7)수학2/미분계수3단계',
    4: '(7)수학2/미분계수4단계'
  },
  '도함수의활용': {
    2: '(7)수학2/도함수의 활용1 2단계',
    3: '(7)수학2/도함수의활용3단계',
    4: '(7)수학2/도함수의 활용 4단계'
  },
  '부정적분과정적분': {
    2: '(7)수학2/부정적분과 정적분 2단계',
    3: '(7)수학2/부정적분과 정적분 3단계',
    4: '(7)수학2/부정적분과 정적분 4단계'
  },
  '정적분의활용': {
    2: '(7)수학2/정적분의 활용 2단계',
    3: '(7)수학2/정적분의 활용 3단계',
    4: '(7)수학2/정적분의 활용 4단계'
  },
  '순열과조합': {
    2: '순열과조합2단계',
    3: '순열과조합3단계',
    4: '순열과조합4단계'
  },
  '확률': {
    2: '확률2단계',
    3: '확률3단계',
    4: '확률4단계'
  },
  '통계': {
    2: '통계2단계',
    3: '통계3단계',
    4: '통계4단계'
  },
  '삼각함수활용': {
    2: '삼각함수활용2단계',
    3: '삼각함수활용3단계',
    4: '삼각함수활용 4단계(68)'
  }
};

export class UnitProblemSetGenerator {
  /**
   * 특정 단원, 레벨의 문제를 랜덤하게 선택하여 "단원/번호" 문자열 배열로 반환합니다.
   */
  static generateSet(concept, level, count = 5) {
    const folderName = CONCEPT_FOLDER_MAP[concept]?.[level] || CONCEPT_FOLDER_MAP[concept]?.[2];
    if (!folderName || !problemsIndex[folderName]) {
      console.warn(`No folder found for concept: ${concept}, level: ${level}`);
      const fallbackFolder = Object.keys(problemsIndex).find(f => f.includes(concept) && f.includes(String(level)));
      if (!fallbackFolder) return [];
      return this.pickRandomTags(fallbackFolder, count);
    }

    return this.pickRandomTags(folderName, count);
  }

  static pickRandomTags(folderName, count) {
    const available = problemsIndex[folderName];
    if (!available || available.length === 0) return [];
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(pId => `${folderName}/${pId}`);
  }
}
