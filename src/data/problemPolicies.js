// src/data/problemPolicies.js

// levelBand: low (4~5등급), mid (3등급), high (2등급), top (1등급)
// studyMode: NORMAL, EXAM

const buildPolicy = (overrides) => ({
  sourceStyle: 'standard',
  allowedProblemTypes: [],
  forbiddenProblemTypes: ['포괄적 질문', '단순 개념 정의 서술', '아는 것 말해봐 등 개방형 질문'],
  questionLength: 'medium',
  calculationLevel: 'none',
  explanationWeight: 0.5,
  testQuestionCount: 5,
  classQuestionCount: 5,
  transformPolicy: 'standard_rebuild',
  ...overrides
});

export const problemPolicies = {
  중1: {
    english: {
      low: buildPolicy({
        sourceStyle: '중1 기본', allowedProblemTypes: ['단어', '짧은 문장 해석', '기초 문법'], questionLength: 'short', explanationWeight: 0.8, classQuestionCount: 3, transformPolicy: 'easy_rebuild'
      }),
      mid: buildPolicy({
        sourceStyle: '중1 내신', allowedProblemTypes: ['짧은 독해', '기본 어법', '문장 배열 기초'], explanationWeight: 0.5, classQuestionCount: 5
      }),
      high: buildPolicy({
        sourceStyle: '중등 상위권', allowedProblemTypes: ['중등 상위권 독해', '문맥 파악', '문장 순서'], questionLength: 'long', explanationWeight: 0.3, classQuestionCount: 7, transformPolicy: 'advanced_rebuild'
      }),
      top: buildPolicy({
        sourceStyle: '중등 최상위', allowedProblemTypes: ['중등 상위권 독해', '문맥 파악', '문장 순서'], questionLength: 'long', explanationWeight: 0.2, classQuestionCount: 8, transformPolicy: 'elite_rebuild'
      })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['힘/운동 쉬운 개념'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['속력/가속도 기본 적용'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['개념 적용', '간단 계산', '이유 설명'], calculationLevel: 'intermediate', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['개념 적용', '간단 계산', '이유 설명'], calculationLevel: 'advanced', explanationWeight: 0.2 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['물질 상태', '변화 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['상태 변화 이유', '입자 관점'] }),
      high: buildPolicy({ allowedProblemTypes: ['개념 적용', '비교 문제'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['개념 적용', '비교 문제', '심화 추론'], explanationWeight: 0.2 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['세포', '생물 특징'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['기관/조직 기초'] }),
      high: buildPolicy({ allowedProblemTypes: ['생명 활동 이유 설명'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['생명 활동 이유 설명', '자료 해석'], explanationWeight: 0.2 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['지구/별/기초 현상'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['날씨/지구 구조'] }),
      high: buildPolicy({ allowedProblemTypes: ['개념 비교', '원인 설명'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['개념 비교', '원인 설명', '자료 해석'], explanationWeight: 0.2 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['계산', '기본 개념'], calculationLevel: 'basic', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['개념 적용'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['유형 응용'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['심화 응용'], calculationLevel: 'advanced', explanationWeight: 0.2 })
    }
  },
  중2: {
    english: {
      low: buildPolicy({ allowedProblemTypes: ['단어', '기본 문장'], questionLength: 'short', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['중간 길이 독해', '어법'] }),
      high: buildPolicy({ allowedProblemTypes: ['문맥 파악', '추론 기초'], questionLength: 'long', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['문맥 파악', '추론 기초', '고난도'], questionLength: 'long', explanationWeight: 0.2 })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['전기/열 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['전류/전압 기본 적용'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['회로/열 문제 계산'], calculationLevel: 'intermediate', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['회로/열 문제 응용'], calculationLevel: 'advanced', explanationWeight: 0.2 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['원자/분자 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['화학 변화 이해'] }),
      high: buildPolicy({ allowedProblemTypes: ['반응 적용 문제'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['반응 적용 복합 문제'], explanationWeight: 0.2 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['소화/순환 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['기관 기능 문제'] }),
      high: buildPolicy({ allowedProblemTypes: ['항상성 연결'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['복합 항상성 추론'], explanationWeight: 0.2 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['지진/화산 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['기상/기후 기초'] }),
      high: buildPolicy({ allowedProblemTypes: ['자료 연결'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['복잡한 자료 해석'], explanationWeight: 0.2 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['기본 문제'], calculationLevel: 'basic', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['일차함수/도형 적용'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용형'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['심화 심화형'], calculationLevel: 'highest', explanationWeight: 0.2 })
    }
  },
  중3: {
    english: {
      low: buildPolicy({ allowedProblemTypes: ['중등 마무리 독해', '어법'], questionLength: 'short', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['중간 길이 독해', '순서/삽입 기초'] }),
      high: buildPolicy({ allowedProblemTypes: ['고등 진입형 독해', '빈칸 기초'], questionLength: 'long', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['예비 고1 실전', '고난도 추론'], questionLength: 'long', explanationWeight: 0.2 })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['운동/에너지 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['일과 에너지 적용'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['간단 계산/그래프'], calculationLevel: 'intermediate', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['복합 그래프 추론'], calculationLevel: 'advanced', explanationWeight: 0.2 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['화학식/반응식 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['산/염기 기초'] }),
      high: buildPolicy({ allowedProblemTypes: ['반응량/계산 기초'], calculationLevel: 'intermediate', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['고난도 양적 계산'], calculationLevel: 'advanced', explanationWeight: 0.2 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['유전 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['멘델 기초'] }),
      high: buildPolicy({ allowedProblemTypes: ['자료해석 입문'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['가계도 기초'], explanationWeight: 0.2 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['태양계/우주 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['계절 변화'] }),
      high: buildPolicy({ allowedProblemTypes: ['천체 운동 연결'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['복합 천체 추론'], explanationWeight: 0.2 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['기본 개념'], calculationLevel: 'basic', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['이차함수/통계 기초'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용형'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['심화 문제'], calculationLevel: 'highest', explanationWeight: 0.2 })
    }
  },
  고1: {
    english: {
      low: buildPolicy({ sourceStyle: '짧은 지문', allowedProblemTypes: ['구조 설명형', '문장 의미 파악 중심'], transformPolicy: 'easy_rebuild', explanationWeight: 0.8 }),
      mid: buildPolicy({ sourceStyle: '중간 지문', allowedProblemTypes: ['문장 의미 파악 중심', '어법 기초'] }),
      high: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함'], transformPolicy: 'advanced_rebuild', explanationWeight: 0.3, classQuestionCount: 7 }),
      top: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함', '심화 추론'], transformPolicy: 'elite_rebuild', explanationWeight: 0.2, classQuestionCount: 8 })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['힘/운동 기본 개념', '쉬운 적용'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['역학 기초 문제'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['계산/응용'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['상위권 내신/모의형'], calculationLevel: 'highest', explanationWeight: 0.2 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['원자/주기율 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['화학결합 표준형'] }),
      high: buildPolicy({ allowedProblemTypes: ['분자 성질', '양적 관계'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['응용형 양적 관계'], calculationLevel: 'highest', explanationWeight: 0.2 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['세포 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['세포막/광합성 표준'] }),
      high: buildPolicy({ allowedProblemTypes: ['유전/항상성 응용'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['자료해석 강화'], explanationWeight: 0.2 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['지권/대기 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['지각 변동/기압'] }),
      high: buildPolicy({ allowedProblemTypes: ['해양/기후 연결'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['자료형 문제 심화'], explanationWeight: 0.2 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['수학(상)(하) 기본 문제'], calculationLevel: 'basic', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 내신형'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용형', '학교 시험형'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['최상위 응용형', '학교 시험형'], calculationLevel: 'highest', explanationWeight: 0.2 })
    }
  },
  고2: {
    english: {
      low: buildPolicy({ sourceStyle: '짧은 지문', allowedProblemTypes: ['구조 설명형', '문장 의미 파악 중심'], transformPolicy: 'easy_rebuild', explanationWeight: 0.8 }),
      mid: buildPolicy({ sourceStyle: '중간 지문', allowedProblemTypes: ['문장 의미 파악 중심', '표준 독해'] }),
      high: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함'], transformPolicy: 'advanced_rebuild', explanationWeight: 0.3, classQuestionCount: 8 }),
      top: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함', '상위권 변별형'], transformPolicy: 'elite_rebuild', explanationWeight: 0.1, classQuestionCount: 10 })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['역학/파동 기본'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['전형적 내신/모의형'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['응용 계산형'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['상위권 변별형'], calculationLevel: 'highest', explanationWeight: 0.1 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['평형/산염기 기본'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 계산형'], calculationLevel: 'basic' }),
      high: buildPolicy({ allowedProblemTypes: ['반응속도/산화환원 응용'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['고난도 계산형'], calculationLevel: 'highest', explanationWeight: 0.1 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['유전/생태 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['자료해석 표준'] }),
      high: buildPolicy({ allowedProblemTypes: ['계산/추론'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['고난도 자료해석'], explanationWeight: 0.1 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['천체/기후 기초'], explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['자료해석 표준'] }),
      high: buildPolicy({ allowedProblemTypes: ['복합 자료형'], explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['변별형 고난도 자료'], explanationWeight: 0.1 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['수1/수2 기본'], calculationLevel: 'basic', explanationWeight: 0.8 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 문제'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용/심화'], calculationLevel: 'advanced', explanationWeight: 0.3 }),
      top: buildPolicy({ allowedProblemTypes: ['최상위 변별형'], calculationLevel: 'highest', explanationWeight: 0.1 })
    }
  },
  고3: {
    english: {
      low: buildPolicy({ sourceStyle: '짧은 지문', allowedProblemTypes: ['구조 설명형', '문장 의미 파악 중심'], forbiddenProblemTypes: ['중학교식 단문 문법 오류 찾기', '"She don\'t ..." 같은 기초문법형'], transformPolicy: 'easy_rebuild', explanationWeight: 0.6 }),
      mid: buildPolicy({ sourceStyle: '중간 지문', allowedProblemTypes: ['문장 의미 파악 중심', '표준 독해'], forbiddenProblemTypes: ['중학교식 단문 문법 오류 찾기', '"She don\'t ..." 같은 기초문법형'] }),
      high: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함'], forbiddenProblemTypes: ['중학교식 단문 문법 오류 찾기', '"She don\'t ..." 같은 기초문법형'], transformPolicy: 'advanced_rebuild', explanationWeight: 0.2, classQuestionCount: 10 }),
      top: buildPolicy({ sourceStyle: '긴 수능형 지문 사용', allowedProblemTypes: ['긴 문장 독해', '구조 파악', '문장 삽입', '순서 배열', '빈칸', '주제/요지 포함', '변별형 킬러'], forbiddenProblemTypes: ['중학교식 단문 문법 오류 찾기', '"She don\'t ..." 같은 기초문법형'], transformPolicy: 'elite_rebuild', explanationWeight: 0.1, classQuestionCount: 15 })
    },
    physics: {
      low: buildPolicy({ allowedProblemTypes: ['수능형 기본 문항'], explanationWeight: 0.6 }),
      mid: buildPolicy({ allowedProblemTypes: ['실전형 표준'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용 계산'], calculationLevel: 'advanced', explanationWeight: 0.2 }),
      top: buildPolicy({ allowedProblemTypes: ['변별형 킬러'], calculationLevel: 'highest', explanationWeight: 0.1 })
    },
    chemistry: {
      low: buildPolicy({ allowedProblemTypes: ['수능형 기본'], explanationWeight: 0.6 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 계산/평형'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용 계산'], calculationLevel: 'advanced', explanationWeight: 0.2 }),
      top: buildPolicy({ allowedProblemTypes: ['최상위 변별형'], calculationLevel: 'highest', explanationWeight: 0.1 })
    },
    biology: {
      low: buildPolicy({ allowedProblemTypes: ['기본 자료형'], explanationWeight: 0.6 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 자료형'] }),
      high: buildPolicy({ allowedProblemTypes: ['추론형'], explanationWeight: 0.2 }),
      top: buildPolicy({ allowedProblemTypes: ['킬러형 생명과학'], explanationWeight: 0.1 })
    },
    earthScience: {
      low: buildPolicy({ allowedProblemTypes: ['기본 개념+자료'], explanationWeight: 0.6 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 자료형'] }),
      high: buildPolicy({ allowedProblemTypes: ['복합 자료형'], explanationWeight: 0.2 }),
      top: buildPolicy({ allowedProblemTypes: ['변별형 천체/해양'], explanationWeight: 0.1 })
    },
    math: {
      low: buildPolicy({ allowedProblemTypes: ['수능형 기본'], calculationLevel: 'basic', explanationWeight: 0.6 }),
      mid: buildPolicy({ allowedProblemTypes: ['표준 기출형'], calculationLevel: 'intermediate' }),
      high: buildPolicy({ allowedProblemTypes: ['응용형'], calculationLevel: 'advanced', explanationWeight: 0.2 }),
      top: buildPolicy({ allowedProblemTypes: ['최상위 변별형'], calculationLevel: 'highest', explanationWeight: 0.1 })
    }
  }
};

const EXAM_MONTHS = [4, 5, 6, 7, 9, 10, 11, 12];
export const isExamPeriod = () => {
  const m = new Date().getMonth() + 1;
  return EXAM_MONTHS.includes(m);
};

export const getProblemPolicy = (grade, subject, levelBand, studyModeOverride = null) => {
  const normGrade = grade === 'high3' ? '고3' : grade === 'high2' ? '고2' : grade === 'high1' ? '고1' : grade;
  
  let mode = studyModeOverride;
  if (!mode) {
    mode = isExamPeriod() ? 'EXAM' : 'NORMAL';
  }

  // Fallbacks
  const gradeKey = problemPolicies[normGrade] ? normGrade : '고1';
  let subjectKey = subject;
  if (subject === 'earth_science') subjectKey = 'earthScience';
  const subData = problemPolicies[gradeKey][subjectKey] || problemPolicies[gradeKey]['english'];

  // Map 1등급 -> top, 2등급 -> high, 3등급 -> mid, 4~5등급 -> low
  let mappedBand = 'mid';
  if (levelBand?.includes('1등급')) mappedBand = 'top';
  else if (levelBand?.includes('2등급')) mappedBand = 'high';
  else if (levelBand?.includes('3등급')) mappedBand = 'mid';
  else if (levelBand?.includes('4') || levelBand?.includes('5')) mappedBand = 'low';

  let policy = { ...subData[mappedBand] };

  // Math Specific Logic (Growth vs Exam)
  if (subjectKey === 'math') {
    if (mode === 'NORMAL') {
      // 성장 모드: 퍼즐 / 구조 중심
      policy.allowedProblemTypes = ['논리 퍼즐', '구조 발견', '개념 관계', '두뇌 훈련'];
      policy.forbiddenProblemTypes = [...(policy.forbiddenProblemTypes || []), '특정 학년/단원에 얽매인 기출문제 반복', '숫자 대입 단순 노동형 계산'];
      policy.studyModeName = '성장 모드(퍼즐/구조 중심 북극성)';
    } else {
      // 시험 모드: 철저한 해당 학년/단원 범위 평가
      policy.forbiddenProblemTypes = [...(policy.forbiddenProblemTypes || []), '해당 범위를 벗어난 선행학습 문제', '단원 외 통합형 퍼즐'];
      policy.studyModeName = '시험 모드(점수 확보 중심)';
    }
  }

  // Apply EXAM mode modifiers
  if (mode === 'EXAM') {
    policy.classQuestionCount = Math.floor((policy.classQuestionCount || 5) * 1.5);
    policy.testQuestionCount = (policy.testQuestionCount || 5) + 2;
    policy.explanationWeight = (policy.explanationWeight || 0.5) * 0.5;
    policy.allowedProblemTypes.push('실전 모의고사 변형', '서술형 대비');
  }

  return {
    ...policy,
    studyMode: mode
  };
};
