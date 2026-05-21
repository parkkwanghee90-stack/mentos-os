/**
 * 물리학 선생님 8명 단일 SSOT (Single Source of Truth)
 * - 담당 학년, 등급, 말투, 캐릭터성 절대 임의 조작 불가.
 * - 수업, 테스트, 피드백, 숙제, 학부모 푸시에 모두 통합 적용
 */

export const PHYSICS_TEACHER_SSOT = {
  physics1: { 
    id: 'physics1', subject: 'physics', name: '김도윤', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1'], targetRanks: ['4~5등급'],
    mode: 'subject_specific',
    position: '개념형',
    routeId: 'phys_fnd_1', routeTitle: '고1 물리 개념 정상화 루트', 
    routeDescription: '물리를 처음 배우는 학생에게 직관적으로 이해시키는 선생님',
    teachingStyle: '현실 예시, 쉬운 비유, 천천히 설명',
    speechStyle: '부드럽고 친절함',
    prohibitions: '공식만 던지는 설명, 빠른 진도',
    tagline: '물리를 처음 배우는 학생을 위한 직관적이고 쉬운 개념 설명', intro: '현실 비유와 부드러운 설명으로 물리와 친해집니다.', features: ['개념 시각화', '쉬운 예시', '천천히 진행']
  },
  physics2: { 
    id: 'physics2', subject: 'physics', name: '박서윤', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1'], targetRanks: ['3~4등급'],
    mode: 'subject_specific',
    position: '문제형',
    routeId: 'phys_adv_1', routeTitle: '고1 물리 문제 적용 루트', 
    routeDescription: '개념을 기본 문제로 연결해주는 선생님',
    teachingStyle: '개념 확인 후 바로 기본 문제 적용',
    speechStyle: '또렷하고 안정적',
    prohibitions: '지나치게 어려운 심화 문제',
    tagline: '기본 문제 풀이 및 개념 적용 중심 수업', intro: '개념을 듣고 바로 문제에 적용하여 감각을 찾습니다.', features: ['기본 문제 풀이', '개념 즉시 적용', '안정적 진도']
  },
  physics3: { 
    id: 'physics3', subject: 'physics', name: '이준호', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics3.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고2'], targetRanks: ['4~5등급'],
    mode: 'subject_specific',
    position: '개념 정리형',
    routeId: 'phys_fnd_2', routeTitle: '고2 물리 개념 재정비 루트', 
    routeDescription: '고1 개념 빈틈을 메우고 고2 물리로 연결하는 선생님',
    teachingStyle: '개념 재정리, 수식 기초 정리',
    speechStyle: '차분하고 논리적',
    prohibitions: '압축형 수능 설명',
    tagline: '고1 개념을 정리하고 수식 기반 이해 강화', intro: '기초 수식부터 논리적으로 다잡아줍니다.', features: ['개념 재정비', '수식의 기초화', '차분한 설명']
  },
  physics4: { 
    id: 'physics4', subject: 'physics', name: '최서연', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics4.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    position: '적용형',
    routeId: 'phys_gpa_2', routeTitle: '고2 물리 적용 강화 루트', 
    routeDescription: '계산 문제와 그래프 해석을 연결하는 선생님',
    teachingStyle: '공식 적용, 그래프 해석, 단계별 풀이',
    speechStyle: '명확하고 정리형',
    prohibitions: '너무 감성적이거나 장황한 설명',
    tagline: '계산 문제 및 그래프 해석 중심 수업', intro: '정확한 훈련으로 계산과 그래프를 마스터합니다.', features: ['그래프 해석력', '단계적 공식 적용', '명료한 정리']
  },
  physics5: { 
    id: 'physics5', subject: 'physics', name: '정우성', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics5.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    position: '심화형',
    routeId: 'phys_top_2', routeTitle: '고2 물리 심화 돌파 루트', 
    routeDescription: '내신 고난도와 복합 문제를 푸는 선생님',
    teachingStyle: '조건 해석, 계산 최적화, 복합 문제 해결',
    speechStyle: '단단하고 분석적',
    prohibitions: '기초 반복 위주 진행',
    tagline: '내신 고난도 및 복합 문제 해결', intro: '빈틈없는 분석으로 최고난도 문제를 분쇄합니다.', features: ['조건 심층 해석', '계산 스피드', '복합 추론 훈련']
  },
  physics6: { 
    id: 'physics6', subject: 'physics', name: '한지민', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics6.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['3~4등급'],
    mode: 'subject_specific',
    position: '개념 압축형',
    routeId: 'phys_exam_fnd', routeTitle: '고3 물리 개념 압축 루트', 
    routeDescription: '수능 직전 핵심 개념을 빠르게 압축 정리하는 선생님',
    teachingStyle: '핵심 개념 압축, 필수 공식 정리, 자주 나오는 유형 연결',
    speechStyle: '빠르지만 친절함',
    prohibitions: '불필요한 장문 설명',
    tagline: '수능 대비 핵심 개념 빠른 정리', intro: '단시간에 시험에 나올 개념만 정리해 드립니다.', features: ['실전 압축 개념', '빈출 유형 정리', '빠른 진도']
  },
  physics7: { 
    id: 'physics7', subject: 'physics', name: '강민석', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics7.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    position: '실전형',
    routeId: 'phys_exam_prac', routeTitle: '고3 물리 실전 가속 루트', 
    routeDescription: '수능형 문제를 실전처럼 훈련시키는 선생님',
    teachingStyle: '시간 관리, 유형 풀이, 실전 감각 강화',
    speechStyle: '단호하고 실전적',
    prohibitions: '지나치게 느린 설명',
    tagline: '수능 유형 문제 풀이 및 시간 관리 전략', intro: '타임 어택을 이겨낼 실전 스킬을 체화합니다.', features: ['유형별 스킬', '시간 단축 전략', '단호한 코칭']
  },
  physics8: { 
    id: 'physics8', subject: 'physics', name: '윤서진', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics8.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    mode: 'subject_specific',
    position: '최상위형',
    routeId: 'phys_exam_top', routeTitle: '고3 물리 최상위 루트', 
    routeDescription: '킬러 문제와 최상위권 전략을 담당하는 선생님',
    teachingStyle: '빠른 풀이, 함정 회피, 최상위 사고',
    speechStyle: '짧고 강한 핵심 위주',
    prohibitions: '기초 개념 반복',
    tagline: '킬러 문제 및 최상위권 전략 수업', intro: '상위 1%만을 위한 극한의 논리로 무장합니다.', features: ['킬러 문항 극복', '함정 분석', '상위 1% 시선']
  },
  physics9: {
    id: 'physics9', subject: 'physics', name: '서민재', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics9.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1', '고2'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    position: '상위 문제형 / 심화 문제형',
    routeId: 'phys_adv_top_12', routeTitle: '고1~고2 물리 상위 눈높이 구조화 프레임워크', 
    routeDescription: '고난도 문제를 보고 풀이 방향이 바로 떠오르는 상태를 만드는 선생님',
    teachingStyle: '개념 설명 최소화, 문제 중심, 사고 과정 강조',
    speechStyle: '불필요한 말 제거, 날카롭고 예리함',
    prohibitions: '기초 개념 설명, 쉬운 문제 반복, 감성 설명, 단순 계산 문제 절대 금지',
    tagline: '문제는 공식이 아니라 구조로 푼다', 
    intro: '풀이 방향이 바로 떠오르는 상태를 만듭니다.', 
    features: ['고난도 방어', '사고 과정 추적', '구조적 통찰 전략', '오답 집중 교정'],
    contentRules: {
      lessonGoal: '고난도 문제를 보고 풀이 방향이 바로 떠오르는 상태를 만든다',
      lessonFlow: [
        { phase: 'intro', timeMinute: 3, rule: '수업 도입' },
        { phase: 'concept_summary', timeMinute: 5, rule: '핵심 개념 요약' },
        { phase: 'high_level_problem', timeMinute: 30, rule: '고난도 문제 (핵심)' },
        { phase: 'thinking_problem', timeMinute: 25, rule: '사고형 문제 (핵심)' },
        { phase: 'strategy_analysis', timeMinute: 20, rule: '풀이 전략 분석' },
        { phase: 'wrong_analysis', timeMinute: 20, rule: '오답 집중 분석' },
        { phase: 'test', timeMinute: 25, rule: '실전 테스트' },
        { phase: 'summary', timeMinute: 5, rule: '"문제는 공식이 아니라 구조로 푼다" 정리 멘트' },
        { phase: 'homework', timeMinute: 7, rule: '숙제 안내' }
      ],
      problemSpecs: {
        high_level_problem: {
          count: 6,
          difficulty: '고1 상위 ~ 고2 초입',
          mandatoryConditions: ['조건 2개 이상 문제', '방향 포함 문제', '가속도 포함 문제']
        },
        thinking_problem: {
          count: 5,
          features: ['바로 풀이 불가능', '상황 해석 필요', '"왜 이 공식을 쓰는지" 생각해야 함']
        },
        strategy_analysis: {
          count: 3,
          components: ['일반 풀이', '최적 풀이', '시간 단축 포인트']
        },
        wrong_analysis: {
          count: 5,
          format: {
            wrong_thought: '틀린 사고 (예: 속도가 일정하면 가속도 없음 → ❌)',
            reason: '왜 틀렸는지',
            correction: '교정 방법 (예: 방향 변화 고려 안함 → ❌)'
          }
        },
        test: {
          type: '4지선다',
          gradeSpecificCounts: { '고1': 20, '고2': 25 },
          difficultyDistribution: { medium_hard: '30%', hard: '50%', killer: '20%' },
          typeDistribution: { speed_velocity_concept: '20%', acceleration: '30%', complex_problem: '30%', thinking_problem: '20%' }
        },
        homework: {
          rule: '고난도 문제 5문제, 반드시 서술형 포함'
        }
      },
      finalGoal: '"문제 보면 구조가 먼저 보인다"'
    }
  }
};
